<?php

namespace App\Enums;

/**
 * Wallet ledger entry types. Every wallet mutation must map to one of these.
 */
enum WalletTransactionType: string
{
    case Deposit = 'deposit';                 // informational record of an external deposit (does not credit wallet)
    case Commission = 'commission';           // referral commission credited
    case ReturnPayout = 'return_payout';      // return/reward payout credited
    case FundDisbursement = 'fund_disbursement'; // support fund credited
    case WithdrawalHold = 'withdrawal_hold';  // amount locked for a pending withdrawal
    case Withdrawal = 'withdrawal';           // withdrawal finalized
    case WithdrawalRelease = 'withdrawal_release'; // locked amount released back
    case Adjustment = 'adjustment';           // admin manual adjustment (audited)
    case Refund = 'refund';                   // payment refund credited

    public function label(): string
    {
        return match ($this) {
            self::Deposit => 'Deposit',
            self::Commission => 'Commission',
            self::ReturnPayout => 'Return Payout',
            self::FundDisbursement => 'Fund Disbursement',
            self::WithdrawalHold => 'Withdrawal Hold',
            self::Withdrawal => 'Withdrawal',
            self::WithdrawalRelease => 'Withdrawal Release',
            self::Adjustment => 'Adjustment',
            self::Refund => 'Refund',
        };
    }

    /**
     * Types that increase the spendable balance when completed.
     */
    public function isCredit(): bool
    {
        return in_array($this, [
            self::Commission,
            self::ReturnPayout,
            self::FundDisbursement,
            self::Adjustment,
            self::Refund,
        ], true);
    }
}
