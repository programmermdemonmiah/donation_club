<?php

namespace App\Console\Commands;

use App\Services\Deposit\DepositEligibilityService;
use App\Models\Payment;
use App\Services\Payment\PaymentManager;
use Illuminate\Console\Command;

class CheckPendingPayments extends Command
{
    protected $signature = 'payments:check-pending {--timeout=120 : minutes after which stale pending payments are marked failed}';

    protected $description = 'Verify pending payments with their gateway; expire stale ones';

    public function handle(PaymentManager $manager): int
    {
        $timeoutMinutes = (int) $this->option('timeout');

        Payment::query()
            ->where('status', 'pending')
            ->where('created_at', '<', now()->subMinutes($timeoutMinutes))
            ->chunkById(100, function ($payments) use ($manager) {
                foreach ($payments as $payment) {
                    $gateway = $manager->gateway($payment->gateway);
                    $status = $gateway->verify($payment);

                    if ($status === 'successful') {
                        app(\App\Services\Deposit\DepositService::class)->complete($payment, $payment->gateway_reference);
                        $this->info("Completed payment {$payment->reference}");
                    }
                }
            });

        // Expire stale manual payments that never got a transaction id.
        $stale = Payment::query()
            ->where('status', 'pending')
            ->whereNull('gateway_reference')
            ->where('created_at', '<', now()->subDays(3))
            ->get();

        foreach ($stale as $payment) {
            app(\App\Services\Deposit\DepositService::class)->markFailed($payment, 'Expired: no payment submitted');
        }

        $this->info("Checked pending payments. Expired {$stale->count()}.");

        return self::SUCCESS;
    }
}
