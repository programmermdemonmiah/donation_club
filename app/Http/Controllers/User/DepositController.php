<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\Deposit\StoreDepositRequest;
use App\Models\Deposit;
use App\Services\Deposit\DepositEligibilityService;
use App\Services\Deposit\DepositService;
use App\Services\Payment\PaymentManager;
use App\Support\Money;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DepositController extends Controller
{
    public function __construct(
        private readonly DepositService $deposits,
        private readonly DepositEligibilityService $eligibility,
        private readonly PaymentManager $payments,
    ) {
    }

    public function index(): Response
    {
        $user = Auth::user();

        $check = $this->eligibility->check($user, $this->eligibilityMin());

        return Inertia::render('deposit/Index', [
            'deposits' => Deposit::query()
                ->where('user_id', $user->id)
                ->with('sequence:deposit_id,sequence_number')
                ->latest()
                ->paginate(10)
                ->through(fn (Deposit $d) => [
                    'id' => $d->id,
                    'reference' => $d->reference,
                    'amount' => $d->amount,
                    'status' => $d->status->value,
                    'sequence_number' => $d->sequence?->sequence_number,
                    'created_at' => $d->created_at->toIso8601String(),
                    'completed_at' => $d->completed_at?->toIso8601String(),
                ]),
            'eligibility' => $check['eligible'],
            'eligibilityReason' => $check['reason'],
            'rules' => [
                'min' => $this->minAmount(),
                'max' => $this->maxAmount(),
            ],
        ]);
    }

    public function store(StoreDepositRequest $request): RedirectResponse
    {
        $deposit = $this->deposits->initiateFromWallet(
            $request->user(),
            $request->input('amount'),
        );

        return back()
            ->with('success', "Donation {$deposit->reference} successfully completed from your wallet balance.");
    }

    public function show(Deposit $deposit): Response
    {
        $this->authorize('view', $deposit);

        $deposit->load(['sequence', 'payments']);

        return Inertia::render('deposit/Show', [
            'deposit' => [
                'id' => $deposit->id,
                'reference' => $deposit->reference,
                'amount' => $deposit->amount,
                'status' => $deposit->status->value,
                'sequence_number' => $deposit->sequence?->sequence_number,
                'completed_at' => $deposit->completed_at?->toIso8601String(),
                'created_at' => $deposit->created_at->toIso8601String(),
                'payments' => $deposit->payments->map(fn ($p) => [
                    'id' => $p->id,
                    'reference' => $p->reference,
                    'gateway' => $p->gateway,
                    'status' => $p->status->value,
                    'amount' => $p->amount,
                ]),
            ],
            'return' => $deposit->memberReturn ? [
                'status' => $deposit->memberReturn->status->value,
                'payout_amount' => $deposit->memberReturn->payout_amount,
            ] : null,
        ]);
    }

    private function eligibilityMin(): string
    {
        return app(\App\Services\Settings\SettingsService::class)->minDeposit();
    }

    private function minAmount(): string
    {
        return app(\App\Services\Settings\SettingsService::class)->minDeposit();
    }

    private function maxAmount(): string
    {
        return app(\App\Services\Settings\SettingsService::class)->maxDeposit();
    }
}
