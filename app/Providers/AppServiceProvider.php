<?php

namespace App\Providers;

use App\Events\CommissionCredited;
use App\Events\DepositCompleted;
use App\Events\FundDisbursed;
use App\Events\RankAchieved;
use App\Events\ReturnCompleted;
use App\Events\ReturnStatusChanged;
use App\Events\WithdrawalStatusChanged;
use App\Listeners\OnDepositCompleted;
use App\Listeners\OnFundDisbursed;
use App\Listeners\OnRankAchieved;
use App\Listeners\OnReturnStatusChanged;
use App\Listeners\OnWithdrawalStatusChanged;
use App\Listeners\SendCommissionCreditedNotification;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(\App\Services\Settings\SettingsService::class);

        // Resolve the active gateway from configuration.
        $this->app->bind(\App\Services\Payment\PaymentGatewayInterface::class, function ($app) {
            return $app->make(\App\Services\Payment\PaymentManager::class)->defaultGateway();
        });
    }

    public function boot(): void
    {
        Event::listen(DepositCompleted::class, OnDepositCompleted::class);
        Event::listen(CommissionCredited::class, SendCommissionCreditedNotification::class);
        Event::listen([ReturnStatusChanged::class, ReturnCompleted::class], OnReturnStatusChanged::class);
        Event::listen(WithdrawalStatusChanged::class, OnWithdrawalStatusChanged::class);
        Event::listen(RankAchieved::class, OnRankAchieved::class);
        Event::listen(FundDisbursed::class, OnFundDisbursed::class);
    }
}
