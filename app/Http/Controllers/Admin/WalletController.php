<?php

namespace App\Http\Controllers\Admin;

use App\Enums\WalletDirection;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WalletTransaction;
use App\Services\Audit\AuditLogService;
use App\Services\Settings\SettingsService;
use App\Services\Wallet\WalletService;
use App\Support\Money;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    public function __construct(private readonly SettingsService $settings)
    {
    }

    public function index(): Response
    {
        return Inertia::render('admin/wallets/Index', [
            'wallets' => \App\Models\Wallet::query()->with('user:id,name,email')->latest()->paginate(20)
                ->through(fn (\App\Models\Wallet $w) => [
                    'id' => $w->id,
                    'user' => $w->user?->only(['id', 'name', 'email']),
                    'balance' => (string) $w->balance,
                    'locked_balance' => (string) $w->locked_balance,
                    'available' => $w->availableBalance(),
                ]),
        ]);
    }

    public function transactions(Request $request): Response
    {
        $transactions = WalletTransaction::query()
            ->with('user:id,name,email')
            ->when($request->filled('type'), fn ($q) => $q->where('type', $request->input('type')))
            ->latest()
            ->paginate(25)
            ->through(fn (WalletTransaction $t) => [
                'id' => $t->id,
                'reference' => $t->reference,
                'user' => $t->user?->only(['id', 'name', 'email']),
                'type' => $t->type,
                'direction' => $t->direction->value,
                'amount' => $t->amount,
                'balance_after' => $t->balance_after,
                'status' => $t->status->value,
                'description' => $t->description,
                'created_at' => $t->created_at->toIso8601String(),
            ]);

        return Inertia::render('admin/wallets/Transactions', [
            'transactions' => $transactions,
            'filters' => $request->only('type'),
        ]);
    }

    /**
     * Audited manual adjustment. Never silent: ledger entry + audit log.
     */
    public function adjust(Request $request, User $user)
    {
        $validated = $request->validate([
            'direction' => ['required', 'in:credit,debit'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'reason' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        try {
            $tx = $validated['direction'] === 'credit'
                ? WalletService::credit($user, Money::parse((string) $validated['amount']), \App\Enums\WalletTransactionType::Adjustment, null, "Admin adjustment: {$validated['reason']}")
                : WalletService::debit($user, Money::parse((string) $validated['amount']), \App\Enums\WalletTransactionType::Adjustment, null, "Admin adjustment: {$validated['reason']}");

            AuditLogService::log('wallet.adjusted', $tx, [], $validated);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['adjustment' => $e->getMessage()]);
        }

        return back()->with('success', "Wallet adjusted for {$user->name}.");
    }
}
