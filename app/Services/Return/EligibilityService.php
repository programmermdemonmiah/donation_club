<?php

namespace App\Services\Return;

use App\Models\MemberReturn;
use App\Models\ReturnRule;
use App\Models\User;
use App\Services\Deposit\DepositEligibilityService;
use App\Services\Referral\ReferralService;
use App\Support\Money;

/**
 * Central eligibility evaluation for return/reward qualification.
 * Checks (all server-side):
 *  - module enabled
 *  - account status / email verification
 *  - direct referral count
 *  - rank requirement
 *  - deposit requirement (total completed deposits)
 *  - sequence requirement
 */
class EligibilityService
{
    public function __construct(private readonly DepositEligibilityService $depositEligibility)
    {
    }

    /**
     * @return array{eligible: bool, failed: array<string, array{required: string, actual: string}>, details: array}
     */
    public function evaluate(User $user, ?ReturnRule $rule = null): array
    {
        $rule ??= ReturnRule::query()->first();

        $details = [
            'module_enabled' => (bool) ($rule?->enabled ?? false),
            'minimum_direct_referrals' => (int) ($rule?->minimum_direct_referrals ?? 0),
            'rank_requirement' => $rule?->rankRequirement?->name,
            'deposit_requirement' => (string) ($rule?->deposit_requirement ?? '0'),
            'sequence_requirement' => (int) ($rule?->sequence_requirement ?? 0),
        ];

        $failed = [];

        if (! $details['module_enabled']) {
            $failed['module'] = ['required' => 'enabled', 'actual' => 'disabled'];
        }

        if (! $user->isActive()) {
            $failed['account'] = ['required' => 'active', 'actual' => 'blocked'];
        }

        if (! $user->hasVerifiedEmail()) {
            $failed['email_verified'] = ['required' => 'verified', 'actual' => 'unverified'];
        }

        $directCount = ReferralService::directReferralCount($user);
        if ($directCount < $details['minimum_direct_referrals']) {
            $failed['direct_referrals'] = [
                'required' => (string) $details['minimum_direct_referrals'],
                'actual' => (string) $directCount,
            ];
        }

        $currentRankLevel = $this->currentRankLevel($user);
        if ($details['rank_requirement'] !== null && $currentRankLevel < $this->requiredRankLevel($rule)) {
            $failed['rank'] = [
                'required' => (string) $details['rank_requirement'],
                'actual' => $user->activeRank->first()?->name ?? 'None',
            ];
        }

        $totalDeposits = $this->totalCompletedDeposits($user);
        if (Money::lt($totalDeposits, $details['deposit_requirement'])) {
            $failed['total_deposits'] = [
                'required' => $details['deposit_requirement'],
                'actual' => $totalDeposits,
            ];
        }

        if ($details['sequence_requirement'] > 0) {
            $lastSequence = $user->deposits()->completed()
                ->join('deposit_sequences', 'deposit_sequences.deposit_id', '=', 'deposits.id')
                ->max('deposit_sequences.sequence_number') ?? 0;

            if ((int) $lastSequence < $details['sequence_requirement']) {
                $failed['sequence'] = [
                    'required' => sprintf('#%06d', $details['sequence_requirement']),
                    'actual' => sprintf('#%06d', (int) $lastSequence),
                ];
            }
        }

        return [
            'eligible' => empty($failed),
            'failed' => $failed,
            'details' => $details + [
                'actual_direct_referrals' => $directCount,
                'actual_total_deposits' => $totalDeposits,
                'actual_rank_level' => $currentRankLevel,
            ],
        ];
    }

    public function currentRankLevel(User $user): int
    {
        return (int) ($user->activeRank->first()?->level ?? 0);
    }

    private function requiredRankLevel(ReturnRule $rule): int
    {
        return (int) ($rule->rankRequirement?->level ?? 0);
    }

    private function totalCompletedDeposits(User $user): string
    {
        return (string) $user->deposits()->completed()->sum('amount');
    }
}
