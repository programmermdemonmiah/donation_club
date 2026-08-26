<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Models\Deposit;
use App\Models\Fund;
use App\Models\FundRequest;
use App\Models\MemberReturn;
use App\Models\User;
use App\Models\Withdrawal;
use App\Services\Settings\SettingsService;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private readonly SettingsService $settings)
    {
    }

    public function index(): Response
    {
        $userStats = User::query()
            ->selectRaw('COUNT(*) as total')
            ->selectRaw("SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active")
            ->selectRaw("SUM(CASE WHEN status = 'blocked' THEN 1 ELSE 0 END) as blocked")
            ->first();

        $depositAgg = Deposit::query()->completed()
            ->selectRaw('COALESCE(SUM(amount),0) as total')
            ->selectRaw('COUNT(*) as count')
            ->first();

        $todayDeposits = (string) Deposit::query()->completed()->whereDate('completed_at', today())->sum('amount');
        $pendingPayments = \App\Models\Payment::query()->whereIn('status', ['pending', 'processing'])->count();

        $returnsAgg = MemberReturn::query()
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'completed' THEN payout_amount END),0) as total_completed")
            ->selectRaw("COUNT(*) as total_count")
            ->selectRaw("SUM(CASE WHEN status IN ('pending','eligible','approved','processing') THEN 1 ELSE 0 END) as pending_count")
            ->first();

        $commissionAgg = Commission::query()
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'completed' THEN amount END),0) as total")
            ->selectRaw("SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_count")
            ->first();

        $withdrawalAgg = Withdrawal::query()
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'completed' THEN amount END),0) as total")
            ->selectRaw("COUNT(*) as total_count")
            ->selectRaw("SUM(CASE WHEN status IN ('pending','approved','processing') THEN 1 ELSE 0 END) as pending_count")
            ->first();

        // last 14 days deposit chart
        $chart = Deposit::query()->completed()
            ->where('completed_at', '>=', now()->subDays(13)->startOfDay())
            ->groupBy('day')
            ->orderBy('day')
            ->selectRaw('DATE(completed_at) as day, SUM(amount) as total, COUNT(*) as count')
            ->get();

        return Inertia::render('admin/Dashboard', [
            'stats' => [
                'users' => [
                    'total' => (int) ($userStats->total ?? 0),
                    'active' => (int) ($userStats->active ?? 0),
                    'blocked' => (int) ($userStats->blocked ?? 0),
                ],
                'deposits' => [
                    'total_amount' => (string) ($depositAgg->total ?? '0'),
                    'count' => (int) ($depositAgg->count ?? 0),
                    'today_amount' => $todayDeposits,
                    'pending_payments' => $pendingPayments,
                ],
                'returns' => [
                    'total_payout' => (string) ($returnsAgg->total_completed ?? '0'),
                    'count' => (int) ($returnsAgg->total_count ?? 0),
                    'pending' => (int) ($returnsAgg->pending_count ?? 0),
                ],
                'commissions' => [
                    'total' => (string) ($commissionAgg->total ?? '0'),
                    'pending' => (int) ($commissionAgg->pending_count ?? 0),
                ],
                'withdrawals' => [
                    'total' => (string) ($withdrawalAgg->total ?? '0'),
                    'count' => (int) ($withdrawalAgg->total_count ?? 0),
                    'pending' => (int) ($withdrawalAgg->pending_count ?? 0),
                ],
                'referrals' => [
                    'relationships' => DB::table('referral_relationships')->count(),
                ],
                'ranks' => [
                    'distributed' => DB::table('user_ranks')->where('status', 'active')->count(),
                ],
                'funds' => [
                    'requests' => FundRequest::query()->count(),
                    'disbursed' => (string) (FundRequest::query()->whereIn('status', ['completed'])->sum('approved_amount') ?? '0'),
                ],
            ],
            'chart' => $chart,
            'moduleFlags' => [
                'returns_enabled' => $this->settings->returnsEnabled(),
                'commissions_enabled' => $this->settings->commissionsEnabled(),
                'withdrawals_enabled' => $this->settings->withdrawalsEnabled(),
            ],
        ]);
    }
}
