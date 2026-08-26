<?php

namespace App\Http\Controllers\Admin;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Deposit;
use App\Services\Audit\AuditLogService;
use App\Services\Deposit\DepositService;
use App\Services\Settings\SettingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DepositController extends Controller
{
    public function __construct(
        private readonly DepositService $deposits,
        private readonly SettingsService $settings,
    ) {
    }

    public function index(Request $request): Response
    {
        $deposits = Deposit::query()
            ->with(['user:id,name,email', 'sequence:deposit_id,sequence_number', 'payments'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->when($request->input('search'), function ($q, $search) {
                $q->where(function ($qq) use ($search) {
                    $qq->where('reference', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($u) => $u->where('email', 'like', "%{$search}%")->orWhere('name', 'like', "%{$search}%"));
                });
            })
            ->latest()
            ->paginate(15)
            ->through(fn (Deposit $d) => [
                'id' => $d->id,
                'reference' => $d->reference,
                'amount' => $d->amount,
                'status' => $d->status->value,
                'sequence_number' => $d->sequence?->sequence_number,
                'user' => $d->user?->only(['id', 'name', 'email']),
                'created_at' => $d->created_at->toIso8601String(),
                'completed_at' => $d->completed_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/deposits/Index', [
            'deposits' => $deposits,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function show(Deposit $deposit): Response
    {
        $deposit->load(['user', 'sequence', 'payments.transactions']);

        return Inertia::render('admin/deposits/Show', [
            'deposit' => [
                'id' => $deposit->id,
                'reference' => $deposit->reference,
                'amount' => $deposit->amount,
                'status' => $deposit->status->value,
                'sequence_number' => $deposit->sequence?->sequence_number,
                'eligibility_snapshot' => $deposit->eligibility_snapshot,
                'created_at' => $deposit->created_at->toIso8601String(),
                'completed_at' => $deposit->completed_at?->toIso8601String(),
                'user' => $deposit->user?->only(['id', 'name', 'email']),
                'payments' => $deposit->payments->map(fn ($p) => [
                    'id' => $p->id,
                    'reference' => $p->reference,
                    'gateway' => $p->gateway,
                    'status' => $p->status->value,
                    'gateway_reference' => $p->gateway_reference,
                    'transactions' => $p->transactions->map(fn ($t) => [
                        'id' => $t->id,
                        'type' => $t->type,
                        'external_reference' => $t->external_reference,
                        'processed' => $t->processed,
                        'created_at' => $t->created_at->toIso8601String(),
                    ]),
                ]),
            ],
        ]);
    }

    /**
     * Admin verification of a manual payment → completes the deposit atomically.
     */
    public function verifyPayment(Request $request, Deposit $deposit)
    {
        $validated = $request->validate([
            'payment_id' => ['required', 'integer'],
            'decision' => ['required', 'in:approve,reject'],
        ]);

        $payment = $deposit->payments()->findOrFail($validated['payment_id']);

        if ($validated['decision'] === 'approve') {
            // Idempotent completion: sequence + audit + events happen inside.
            $this->deposits->complete($payment);

            return back()->with('success', "Deposit {$deposit->reference} verified and completed.");
        }

        $this->deposits->markFailed($payment, 'Rejected by admin review');

        return back()->with('success', 'Payment rejected.');
    }
}
