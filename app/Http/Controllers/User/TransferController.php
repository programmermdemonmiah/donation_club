<?php

namespace App\Http\Controllers\User;

use App\Enums\WalletTransactionType;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Wallet\WalletService;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

class TransferController extends Controller
{
    public function create(): Response
    {
        $wallet = request()->user()->wallet()->first();
        
        return Inertia::render('wallet/Transfer', [
            'balance' => $wallet ? (string) $wallet->availableBalance() : '0.00',
            'is_agent' => request()->user()->isAgent(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'identifier' => ['required', 'string'],
            'amount' => ['required', 'numeric', 'min:1'],
        ]);

        $sender = $request->user();
        $amount = Money::parse((string) $validated['amount']);

        $receiver = User::query()
            ->where('email', $validated['identifier'])
            ->orWhere('username', $validated['identifier'])
            ->first();

        if (! $receiver) {
            throw ValidationException::withMessages([
                'identifier' => 'No user found with that email or username.',
            ]);
        }

        if ($receiver->id === $sender->id) {
            throw ValidationException::withMessages([
                'identifier' => 'You cannot transfer funds to yourself.',
            ]);
        }
        
        $wallet = $sender->wallet()->first();
        if (! $wallet || ! Money::gte($wallet->availableBalance(), $amount)) {
            throw ValidationException::withMessages([
                'amount' => 'Insufficient available balance.',
            ]);
        }

        DB::transaction(function () use ($sender, $receiver, $amount) {
            WalletService::debit(
                user: $sender,
                amount: $amount,
                type: WalletTransactionType::Adjustment,
                reference: $receiver,
                description: "Transfer to {$receiver->name}"
            );

            WalletService::credit(
                user: $receiver,
                amount: $amount,
                type: WalletTransactionType::Adjustment,
                reference: $sender,
                description: "Transfer received from {$sender->name}"
            );
        });

        return redirect()->route('transactions.index')->with('success', "Successfully transferred " . Money::parse($amount) . " to {$receiver->name}.");
    }
}
