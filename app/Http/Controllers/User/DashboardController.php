<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\MemberReturn;
use App\Models\WalletTransaction;
use App\Services\Rank\RankService;
use App\Services\Referral\ReferralService;
use App\Services\Settings\SettingsService;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(
        private readonly SettingsService $settings,
        private readonly RankService $ranks,
    ) {
    }

    public function index(): Response
    {
        $user = request()->user();

        $wallet = $user->wallet()->first();

        $stats = [
            'balance' => (string) ($wallet?->balance ?? '0.00'),
            'locked_balance' => (string) ($wallet?->locked_balance ?? '0.00'),
            'total_deposit' => (string) $user->deposits()->completed()->sum('amount'),
            'total_return' => (string) MemberReturn::query()
                ->where('user_id', $user->id)
                ->where('status', \App\Enums\ReturnStatus::Completed->value)
                ->sum('payout_amount'),
            'total_commission' => (string) Commission::query()
                ->where('user_id', $user->id)
                ->where('status', \App\Enums\CommissionStatus::Completed->value)
                ->sum('amount'),
            'total_withdrawn' => (string) DB::table('withdrawals')
                ->where('user_id', $user->id)
                ->where('status', 'completed')
                ->sum('amount'),
            'pending_withdrawal' => (string) DB::table('withdrawals')
                ->where('user_id', $user->id)
                ->whereIn('status', ['pending', 'approved', 'processing'])
                ->sum('amount'),
            'direct_referrals' => ReferralService::directReferralCount($user),
            'team_size' => ReferralService::teamSize($user),
            'current_rank' => $this->ranks->currentRank($user)?->name,
        ];

        $recentTransactions = WalletTransaction::query()
            ->where('user_id', $user->id)
            ->latest()
            ->limit(8)
            ->get(['id', 'reference', 'type', 'direction', 'amount', 'status', 'description', 'created_at']);

        return Inertia::render('dashboard/Index', [
            'stats' => $stats,
            'recentTransactions' => $recentTransactions,
            'depositRules' => [
                'min' => $this->settings->minDeposit(),
                'max' => $this->settings->maxDeposit(),
            ],
        ]);
    }
}
