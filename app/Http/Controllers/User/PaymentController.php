<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\Payment\PaymentManager;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentManager $payments)
    {
    }

    public function show(Payment $payment): Response
    {
        abort_unless($payment->deposit->user_id === Auth::id(), 403);

        $gateway = $this->payments->gateway($payment->gateway);
        $initiation = $payment->status === \App\Enums\PaymentStatus::Pending ? $gateway->initiate($payment) : null;

        return Inertia::render('wallet/PaymentShow', [
            'payment' => [
                'id' => $payment->id,
                'reference' => $payment->reference,
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'status' => $payment->status->value,
                'gateway' => $payment->gateway,
                'created_at' => $payment->created_at->toIso8601String(),
            ],
            'initiation' => $initiation,
            'depositReference' => $payment->deposit->reference,
        ]);
    }

    /**
     * Member submits the manual transfer transaction id → queues for admin verification.
     */
    public function submitManualProof(Request $request, Payment $payment): \Illuminate\Http\RedirectResponse
    {
        abort_unless($payment->deposit->user_id === Auth::id(), 403);

        if ($payment->status !== \App\Enums\PaymentStatus::Pending) {
            return back()->with('error', 'This payment can no longer be modified.');
        }

        $validated = $request->validate([
            'transaction_id' => ['required', 'string', 'min:4', 'max:120'],
        ]);

        $payment->transactions()->create([
            'type' => 'callback',
            'external_reference' => $validated['transaction_id'],
            'payload' => ['submitted_by' => Auth::id(), 'at' => now()->toIso8601String()],
            'signature_valid' => true,
            'processed' => false,
        ]);

        $payment->forceFill(['status' => \App\Enums\PaymentStatus::Processing->value])->save();

        return redirect()->route('deposits.index')->with('success', 'Transaction submitted. Verification is usually completed within 24 hours.');
    }
}
