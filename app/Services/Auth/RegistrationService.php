<?php

namespace App\Services\Auth;

use App\Models\Pin;
use App\Models\User;
use App\Models\UserProfile;
use App\Models\Wallet;
use App\Services\Rank\RankService;
use App\Services\Referral\ReferralService;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;
use ValueError;

/**
 * Registration pipeline: user + profile + wallet + referral link — atomically.
 */
class RegistrationService
{
    public function __construct(private readonly RankService $ranks) {}

    public function register(array $data): User
    {
        try {
            $referrer = null;

            $user = DB::transaction(function () use ($data, &$referrer) {
                if (! blank($data['referral_code'] ?? null)) {
                    $referrer = ReferralService::validateForRegistration($data['referral_code']);
                }

                /** @var User $user */
                $user = User::create([
                    'name' => trim($data['name']),
                    'username' => strtolower(trim($data['username'])),
                    'email' => strtolower(trim($data['email'])),
                    'email_verified_at' => now(),
                    'password' => $data['password'],
                    'referral_code' => ReferralService::generateReferralCode(),
                ]);

                // Mark secret code as used
                $pin = Pin::where('pin_code', strtoupper($data['secret_code']))->first();
                if ($pin) {
                    $pin->update([
                        'is_used' => true,
                        'used_by_user_id' => $user->id,
                    ]);
                }

                UserProfile::create(['user_id' => $user->id]);
                Wallet::create(['user_id' => $user->id, 'balance' => '0.00', 'locked_balance' => '0.00']);

                if ($referrer) {
                    ReferralService::attachReferrer($user, $referrer);
                }

                return $user;
            });

            if ($referrer) {
                $this->ranks->evaluateUserAndUpline($user);
            } else {
                $this->ranks->promoteIfEligible($user);
            }

            return $user;
        } catch (InvalidArgumentException $e) {
            throw ValidationException::withMessages([
                'referral_code' => $e->getMessage(),
            ]);
        } catch (ValueError) {
            throw ValidationException::withMessages([
                'referral_code' => 'The referral code is invalid.',
            ]);
        } catch (QueryException $e) {
            if (str_contains(strtolower($e->getMessage()), 'ancestor_path')) {
                throw ValidationException::withMessages([
                    'referral_code' => 'This referral cannot be linked right now. Please contact support.',
                ]);
            }

            throw $e;
        }
    }
}
