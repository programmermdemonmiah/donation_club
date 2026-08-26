<?php

namespace App\Services\Fund;

use App\Enums\FundRequestStatus;
use App\Events\FundDisbursed;
use App\Models\Fund;
use App\Models\FundRequest;
use App\Models\User;
use App\Services\Audit\AuditLogService;
use App\Services\Rank\RankService;
use App\Services\Wallet\WalletService;
use App\Support\Money;
use App\Support\ReferenceGenerator;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Rank-gated support fund requests with admin review and wallet disbursement.
 */
class FundService
{
    public function __construct(private readonly RankService $ranks)
    {
    }

    public function request(User $user, Fund $fund, string $amount, string $purpose, ?string $proofPath = null): FundRequest
    {
        $amount = Money::parse($amount);

        if (! $fund->enabled) {
            throw new RuntimeException('This fund is not currently accepting requests.');
        }

        if (Money::lt($amount, (string) $fund->min_amount) || Money::gt($amount, (string) $fund->max_amount)) {
            throw new RuntimeException("Amount must be between {$fund->min_amount} and {$fund->max_amount}.");
        }

        if ($fund->requires_proof && blank($proofPath)) {
            throw new RuntimeException('Supporting proof document is required for this fund.');
        }

        if (! $user->isActive() || ! $user->hasVerifiedEmail()) {
            throw new RuntimeException('Your account must be active with a verified email.');
        }

        $rank = $this->ranks->currentRank($user);

        if ($fund->minimum_rank_id && (! $rank || $rank->level < $fund->minimumRank->level)) {
            throw new RuntimeException("This fund requires the {$fund->minimumRank?->name} rank or higher.");
        }

        $openExists = FundRequest::query()
            ->where('user_id', $user->id)
            ->where('fund_id', $fund->id)
            ->whereIn('status', [FundRequestStatus::Pending->value, FundRequestStatus::Approved->value, FundRequestStatus::Processing->value])
            ->exists();

        if ($openExists) {
            throw new RuntimeException('You already have an open request for this fund.');
        }

        return DB::transaction(function () use ($user, $fund, $amount, $purpose, $proofPath) {
            $request = FundRequest::create([
                'reference' => ReferenceGenerator::generate('FND'),
                'user_id' => $user->id,
                'fund_id' => $fund->id,
                'requested_amount' => $amount,
                'purpose' => $purpose,
                'proof_path' => $proofPath,
                'status' => FundRequestStatus::Pending->value,
            ]);

            AuditLogService::log('fund.requested', $request, [], [
                'amount' => $amount,
                'fund' => $fund->name,
            ]);

            return $request;
        });
    }

    public function approve(FundRequest $request, User $approver, ?string $approvedAmount = null, ?string $note = null): FundRequest
    {
        return DB::transaction(function () use ($request, $approver, $approvedAmount, $note) {
            /** @var FundRequest $locked */
            $locked = FundRequest::query()->whereKey($request->getKey())->lockForUpdate()->firstOrFail();

            if ($locked->status !== FundRequestStatus::Pending) {
                throw new RuntimeException('Only pending requests can be approved.');
            }

            $approvedAmount ??= Money::parse((string) $locked->requested_amount);
            $approvedAmount = Money::parse($approvedAmount);

            if (Money::gt($approvedAmount, (string) $locked->requested_amount)) {
                throw new RuntimeException('Approved amount cannot exceed requested amount.');
            }

            $old = ['status' => $locked->status->value];

            $locked->forceFill([
                'status' => FundRequestStatus::Approved->value,
                'approved_amount' => $approvedAmount,
                'reviewed_by' => $approver->id,
                'reviewed_at' => now(),
                'decision_note' => $note,
            ])->save();

            AuditLogService::log('fund.approved', $locked, $old, [
                'status' => FundRequestStatus::Approved->value,
                'approved_amount' => $approvedAmount,
            ], $approver->id);

            return $locked;
        });
    }

    public function reject(FundRequest $request, User $actor, string $reason): FundRequest
    {
        return DB::transaction(function () use ($request, $actor, $reason) {
            /** @var FundRequest $locked */
            $locked = FundRequest::query()->whereKey($request->getKey())->lockForUpdate()->firstOrFail();

            if (! in_array($locked->status, [FundRequestStatus::Pending, FundRequestStatus::Approved], true)) {
                throw new RuntimeException('Request can no longer be rejected.');
            }

            $old = ['status' => $locked->status->value];
            $locked->forceFill([
                'status' => FundRequestStatus::Rejected->value,
                'reviewed_by' => $actor->id,
                'reviewed_at' => now(),
                'decision_note' => $reason,
            ])->save();

            AuditLogService::log('fund.rejected', $locked, $old, ['reason' => $reason], $actor->id);

            return $locked;
        });
    }

    public function startProcessing(FundRequest $request, User $actor): FundRequest
    {
        return DB::transaction(function () use ($request, $actor) {
            /** @var FundRequest $locked */
            $locked = FundRequest::query()->whereKey($request->getKey())->lockForUpdate()->firstOrFail();

            if ($locked->status !== FundRequestStatus::Approved) {
                throw new RuntimeException('Only approved requests can move to processing.');
            }

            $old = ['status' => $locked->status->value];
            $locked->forceFill(['status' => FundRequestStatus::Processing->value])->save();

            AuditLogService::log('fund.processing', $locked, $old, [], $actor->id);

            return $locked;
        });
    }

    /**
     * Disburse to the member's wallet + fund transaction record — atomically.
     */
    public function complete(FundRequest $request, User $actor): FundRequest
    {
        return DB::transaction(function () use ($request, $actor) {
            /** @var FundRequest $locked */
            $locked = FundRequest::query()->whereKey($request->getKey())->lockForUpdate()->firstOrFail();

            if ($locked->status !== FundRequestStatus::Processing && $locked->status !== FundRequestStatus::Approved) {
                throw new RuntimeException("Only approved/processing requests can be disbursed (current: {$locked->status->value}).");
            }

            $amount = Money::parse((string) ($locked->approved_amount ?? $locked->requested_amount));

            if (Money::lte($amount, '0')) {
                throw new RuntimeException('Disbursement amount must be positive.');
            }

            $walletTx = WalletService::credit(
                $locked->user_id,
                $amount,
                \App\Enums\WalletTransactionType::FundDisbursement,
                $locked,
                "Support fund {$locked->reference} disbursement",
            );

            $fundTx = $locked->transactions()->create([
                'reference' => ReferenceGenerator::generate('FTX'),
                'type' => 'disbursement',
                'amount' => $amount,
                'wallet_transaction_id' => $walletTx->id,
                'note' => 'Disbursed to wallet',
            ]);

            $old = ['status' => $locked->status->value];
            $locked->forceFill([
                'status' => FundRequestStatus::Completed->value,
                'disbursed_at' => now(),
            ])->save();

            AuditLogService::log('fund.disbursed', $locked, $old, [
                'amount' => $amount,
                'fund_transaction' => $fundTx->reference,
            ], $actor->id);

            $completed = $locked->refresh();
            FundDisbursed::dispatch($completed);

            return $completed;
        });
    }

    public function cancel(FundRequest $request, User $actor, string $reason): FundRequest
    {
        return DB::transaction(function () use ($request, $actor, $reason) {
            /** @var FundRequest $locked */
            $locked = FundRequest::query()->whereKey($request->getKey())->lockForUpdate()->firstOrFail();

            $isOwnerCancel = $locked->user_id === $actor->id;

            if ($isOwnerCancel && $locked->status !== FundRequestStatus::Pending) {
                throw new RuntimeException('You can only cancel requests that are still pending.');
            }

            if (in_array($locked->status, [FundRequestStatus::Completed, FundRequestStatus::Cancelled], true)) {
                throw new RuntimeException('Request already finalized.');
            }

            $old = ['status' => $locked->status->value];
            $locked->forceFill(['status' => FundRequestStatus::Cancelled->value])->save();

            AuditLogService::log('fund.cancelled', $locked, $old, ['reason' => $reason], $actor->id);

            return $locked;
        });
    }
}
