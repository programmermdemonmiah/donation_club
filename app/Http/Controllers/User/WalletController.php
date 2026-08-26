<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\WalletTransaction;
use App\Services\Settings\SettingsService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends Controller
{
    public function index(SettingsService $settings): Response
    {
        $user = Auth::user();
        $wallet = $user->wallet()->first();

        return Inertia::render('wallet/Index', [
            'balance' => (string) ($wallet?->balance ?? '0.00'),
            'lockedBalance' => (string) ($wallet?->locked_balance ?? '0.00'),
            'availableBalance' => (string) ($wallet?->availableBalance() ?? '0.00'),
            'transactions' => WalletTransaction::query()
                ->where('user_id', $user->id)
                ->latest()
                ->paginate(15)
                ->through(fn (WalletTransaction $t) => [
                    'id' => $t->id,
                    'reference' => $t->reference,
                    'type' => $t->type,
                    'direction' => $t->direction->value,
                    'amount' => $t->amount,
                    'status' => $t->status->value,
                    'balance_after' => $t->balance_after,
                    'description' => $t->description,
                    'created_at' => $t->created_at->toIso8601String(),
                ]),
            'withdrawalRules' => [
                'min' => $settings->minWithdrawal(),
                'max' => $settings->maxWithdrawal(),
                'fee_percent' => $settings->withdrawalFeePercent(),
                'enabled' => $settings->withdrawalsEnabled(),
            ],
        ]);
    }

    public function transactions(): Response
    {
        $user = Auth::user();

        return Inertia::render('transaction/Index', [
            'transactions' => WalletTransaction::query()
                ->where('user_id', $user->id)
                ->when(request('type'), fn ($q, $type) => $q->where('type', $type))
                ->latest()
                ->paginate(20)
                ->through(fn (WalletTransaction $t) => [
                    'id' => $t->id,
                    'reference' => $t->reference,
                    'type' => $t->type,
                    'direction' => $t->direction->value,
                    'amount' => $t->amount,
                    'status' => $t->status->value,
                    'description' => $t->description,
                    'created_at' => $t->created_at->toIso8601String(),
                ]),
            'filters' => request()->only('type'),
        ]);
    }
}
