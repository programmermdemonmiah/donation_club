<?php

namespace App\Services\Payment;

use App\Enums\PaymentStatus;
use App\Models\Deposit;
use App\Models\Payment;
use App\Support\Money;
use App\Support\ReferenceGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Manual gateway: the member sends a bank/mobile transfer and an admin
 * verifies the transaction. Webhook = admin verification submission.
 */
class ManualGateway implements PaymentGatewayInterface
{
    public function identifier(): string
    {
        return 'manual';
    }

    public function label(): string
    {
        return 'Manual / Bank Transfer';
    }

    public function createPayment(Deposit $deposit, array $meta = []): Payment
    {
        return DB::transaction(function () use ($deposit, $meta) {
            $payment = $deposit->payments()->create([
                'reference' => ReferenceGenerator::generate('PAY'),
                'gateway' => $this->identifier(),
                'amount' => Money::parse((string) $deposit->amount),
                'currency' => config('app.currency', 'USD'),
                'status' => PaymentStatus::Pending->value,
                'meta' => $meta,
            ]);

            $payment->transactions()->create([
                'type' => 'created',
                'payload' => ['gateway' => $this->identifier()],
                'processed' => true,
            ]);

            return $payment;
        });
    }

    public function initiate(Payment $payment): array
    {
        return [
            'type' => 'instructions',
            'reference' => $payment->reference,
            'instructions' => (string) config('services.manual.payment_instructions', 'Transfer the exact amount to the club account and submit the transaction id for verification.'),
            'account_name' => (string) config('services.manual.account_name', ''),
            'account_number' => (string) config('services.manual.account_number', ''),
        ];
    }

    public function verify(Payment $payment): string
    {
        // Manual payments only become successful through explicit admin review.
        return $payment->status === PaymentStatus::Pending
            ? PaymentStatus::Pending->value
            : $payment->status->value;
    }

    public function handleWebhook(Request $request): array
    {
        throw ValidationException::withMessages([
            'gateway' => 'Manual payments do not support automated webhooks.',
        ]);
    }
}
