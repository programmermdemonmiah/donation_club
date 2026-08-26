<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\Withdrawal\StoreWithdrawalRequest;
use App\Models\Withdrawal;
use App\Services\Settings\SettingsService;
use App\Services\Withdrawal\WithdrawalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class WithdrawalController extends Controller
{
    public function __construct(
        private readonly WithdrawalService $withdrawals,
        private readonly SettingsService $settings,
    ) {
    }

    public function index(): Response
    {
        $user = Auth::user();
        $wallet = $user->wallet()->first();

        return Inertia::render('withdrawal/Index', [
            'availableBalance' => (string) ($wallet?->availableBalance() ?? '0.00'),
            'withdrawals' => Withdrawal::query()
                ->where('user_id', $user->id)
                ->latest()
                ->paginate(10)
                ->through(fn (Withdrawal $w) => [
                    'id' => $w->id,
                    'reference' => $w->reference,
                    'amount' => $w->amount,
                    'fee' => $w->fee,
                    'net_amount' => $w->net_amount,
                    'method' => $w->method,
                    'status' => $w->status->value,
                    'admin_note' => $w->admin_note,
                    'created_at' => $w->created_at->toIso8601String(),
                    'completed_at' => $w->completed_at?->toIso8601String(),
                ]),
            'rules' => [
                'min' => $this->settings->minWithdrawal(),
                'max' => $this->settings->maxWithdrawal(),
                'fee_percent' => $this->settings->withdrawalFeePercent(),
                'enabled' => $this->settings->withdrawalsEnabled(),
            ],
        ]);
    }

    public function store(StoreWithdrawalRequest $request): RedirectResponse
    {
        try {
            $this->withdrawals->request(
                $request->user(),
                (string) $request->input('amount'),
                (string) $request->input('method'),
                [
                    'account_name' => (string) $request->input('account_name'),
                    'account_details' => (string) $request->input('account_details'),
                ],
            );
        } catch (\RuntimeException $e) {
            return back()->withErrors(['amount' => $e->getMessage()]);
        }

        return redirect()->route('withdrawals.index')->with('success', 'Withdrawal request submitted.');
    }

    public function cancel(Withdrawal $withdrawal): RedirectResponse
    {
        try {
            $this->withdrawals->cancel(Auth::user(), $withdrawal);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['cancel' => $e->getMessage()]);
        }

        return back()->with('success', 'Withdrawal cancelled and funds released.');
    }
}
