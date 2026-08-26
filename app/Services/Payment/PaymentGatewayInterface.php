<?php

namespace App\Services\Payment;

use App\Models\Deposit;
use App\Models\Payment;
use Illuminate\Http\Request;

/**
 * Contract every payment gateway must fulfil.
 *
 * Implementations MUST be idempotent: a payment that already reached a
 * terminal state can never be moved back or processed twice.
 */
interface PaymentGatewayInterface
{
    /**
     * Unique gateway identifier stored on payments.gateway.
     */
    public function identifier(): string;

    /**
     * Human readable name.
     */
    public function label(): string;

    /**
     * Create the payment record for a deposit and return it.
     */
    public function createPayment(Deposit $deposit, array $meta = []): Payment;

    /**
     * Data needed by the frontend to initiate/complete the payment
     * (redirect url, transfer instructions, etc.).
     */
    public function initiate(Payment $payment): array;

    /**
     * Verify current status with the gateway (or manual review) and return
     * one of PaymentStatus::Successful|Failed|Pending.
     */
    public function verify(Payment $payment): string;

    /**
     * Handle a callback/webhook request. Must validate the signature and
     * return [Payment, bool processed] — never trust unverified payloads.
     */
    public function handleWebhook(Request $request): array;
}
