<?php

namespace App\Services\Deposit;

use App\Enums\DepositStatus;
use App\Models\Deposit;
use App\Models\DepositSequence;
use App\Models\User;
use App\Services\Settings\SettingsService;
use App\Support\Money;

/**
 * Server-side deposit eligibility decisions. Frontend values are never trusted.
 */
class DepositEligibilityService
{
    public function __construct(private readonly SettingsService $settings)
    {
    }

    /**
     * @return array{eligible: bool, reason: string|null, details: array}
     */
    public function check(User $user, string $amount): array
    {
        $details = [
            'min_amount' => $this->settings->minDeposit(),
            'max_amount' => $this->settings->maxDeposit(),
            'required_sequence_gap' => $this->settings->requiredSequenceGap(),
        ];

        if (! $user->isActive()) {
            return ['eligible' => false, 'reason' => 'Your account is blocked. Contact support.', 'details' => $details];
        }

        if (! $user->hasVerifiedEmail()) {
            return ['eligible' => false, 'reason' => 'Please verify your email address first.', 'details' => $details];
        }

        $amount = Money::parse($amount);

        if (Money::lt($amount, $details['min_amount'])) {
            return ['eligible' => false, 'reason' => 'Amount is below the minimum deposit.', 'details' => $details];
        }

        if (Money::gt($amount, $details['max_amount'])) {
            return ['eligible' => false, 'reason' => 'Amount exceeds the maximum deposit.', 'details' => $details];
        }

        if ($pending = $this->hasOpenDeposit($user)) {
            return [
                'eligible' => false,
                'reason' => "You already have a pending deposit ({$pending->reference}). Complete or cancel it first.",
                'details' => $details,
            ];
        }

        if (! $this->passesSequenceRule($user, $gapRemaining)) {
            $details['deposits_remaining_gap'] = $gapRemaining;

            return [
                'eligible' => false,
                'reason' => "Deposit limit reached for your account. You will be eligible again after {$gapRemaining} more club deposit(s) by other members.",
                'details' => $details,
            ];
        }

        return ['eligible' => true, 'reason' => null, 'details' => $details];
    }

    public function hasOpenDeposit(User $user): ?Deposit
    {
        return Deposit::query()
            ->where('user_id', $user->id)
            ->where('status', DepositStatus::Pending->value)
            ->first();
    }

    /**
     * Sequence-gap rule: once an account completes its configured cycle limit
     * of deposits, it must wait until the configured number of subsequent
     * global sequence positions pass before becoming eligible again.
     */
    public function passesSequenceRule(User $user, ?int &$remainingGap = null): bool
    {
        $maxPerCycle = (int) ($this->settings->get('deposit.max_per_account_cycle') ?? 1);
        $gap = $this->settings->requiredSequenceGap();

        if ($maxPerCycle < 1 || $gap < 1) {
            return true;
        }

        $lastCompleted = Deposit::query()
            ->where('user_id', $user->id)
            ->where('status', DepositStatus::Completed->value)
            ->orderByDesc('completed_at')
            ->first();

        if (! $lastCompleted || ! $lastCompleted->sequence) {
            return true; // never completed enough to trigger the rule
        }

        $completedCount = Deposit::query()
            ->where('user_id', $user->id)
            ->where('status', DepositStatus::Completed->value)
            ->count();

        if ($completedCount % $maxPerCycle !== 0) {
            return true;
        }

        $latestGlobal = (int) (DepositSequence::query()->max('sequence_number') ?? 0);
        $myLast = (int) $lastCompleted->sequence->sequence_number;
        $passed = $latestGlobal - $myLast;

        $remainingGap = max(0, $gap - $passed);

        return $passed >= $gap;
    }

    /**
     * Snapshot stored on each deposit for auditability.
     */
    public function snapshot(array $result): array
    {
        return [
            'eligible' => $result['eligible'],
            'reason' => $result['reason'],
            'rules' => $result['details'],
            'checked_at' => now()->toIso8601String(),
        ];
    }
}
