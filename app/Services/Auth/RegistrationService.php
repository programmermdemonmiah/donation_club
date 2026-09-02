<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Models\UserProfile;
use App\Models\Wallet;
use App\Services\Referral\ReferralService;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Registration pipeline: user + profile + wallet + referral link — atomically.
 */
class RegistrationService
{
    public function register(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $referrer = null;

            if (! blank($data['referral_code'] ?? null)) {
                try {
                    $referrer = ReferralService::resolveReferrer($data['referral_code']);
                } catch (\InvalidArgumentException) {
                    throw ValidationException::withMessages([
                        'referral_code' => 'The referral code is invalid.',
                    ]);
                }
            }

            /** @var User $user */
            $user = User::create([
                'name' => trim($data['name']),
                'username' => strtolower(trim($data['username'])),
                'email' => strtolower(trim($data['email'])),
                'password' => $data['password'],
                'referral_code' => ReferralService::generateReferralCode(),
            ]);

            UserProfile::create(['user_id' => $user->id]);
            Wallet::create(['user_id' => $user->id, 'balance' => '0.00', 'locked_balance' => '0.00']);

            if ($referrer) {
                ReferralService::attachReferrer($user, $referrer);
            }

            return $user;
        });
    }
}
