<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\Auth;
use App\Http\Controllers\PublicController;
use App\Http\Controllers\User;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public routes
|--------------------------------------------------------------------------
*/
Route::get('/', [PublicController::class, 'home'])->name('home');
Route::get('/ledger', [PublicController::class, 'deposits'])->name('public.deposits');

foreach (['about', 'how-it-works', 'faq', 'contact', 'terms', 'privacy', 'risk-disclosure'] as $page) {
    Route::get('/'.$page, [PublicController::class, 'page'])->defaults('slug', $page)->name('pages.'.$page);
}

/*
|--------------------------------------------------------------------------
| Guest auth
|--------------------------------------------------------------------------
*/
Route::middleware('guest')->group(function () {
    Route::get('/register', [Auth\RegisteredUserController::class, 'create'])->name('register');
    Route::post('/register', [Auth\RegisteredUserController::class, 'store']);

    Route::get('/login', [Auth\AuthenticatedSessionController::class, 'create'])->name('login');
    Route::post('/login', [Auth\AuthenticatedSessionController::class, 'store'])->middleware('throttle:auth');

    Route::get('/forgot-password', [Auth\PasswordResetLinkController::class, 'create'])->name('password.request');
    Route::post('/forgot-password', [Auth\PasswordResetLinkController::class, 'store'])->middleware('throttle:auth')->name('password.email');

    Route::get('/reset-password/{token}', [Auth\NewPasswordController::class, 'create'])->name('password.reset');
    Route::post('/reset-password', [Auth\NewPasswordController::class, 'store'])->middleware('throttle:auth')->name('password.update');
});

/*
|--------------------------------------------------------------------------
| Email verification (authenticated but possibly unverified)
|--------------------------------------------------------------------------
*/
Route::middleware('auth')->group(function () {
    Route::get('/verify-email', Auth\EmailVerificationPromptController::class)->name('verification.notice');
    Route::get('/verify-email/{id}/{hash}', Auth\VerifyEmailController::class)
        ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');
    Route::post('/email/verification-notification', [Auth\EmailVerificationNotificationController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    Route::post('/logout', [Auth\AuthenticatedSessionController::class, 'destroy'])->name('logout');
});

/*
|--------------------------------------------------------------------------
| Authenticated + verified user area
|--------------------------------------------------------------------------
*/
Route::middleware(['auth', 'verified', 'active'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [User\DashboardController::class, 'index'])->name('dashboard');

    // Deposits & payments
    Route::get('/deposits', [User\DepositController::class, 'index'])->name('deposits.index');
    Route::post('/deposits', [User\DepositController::class, 'store'])->middleware('throttle:deposits')->name('deposits.store');
    Route::get('/deposits/{deposit}', [User\DepositController::class, 'show'])->name('deposits.show');

    Route::get('/payments/{payment}', [User\PaymentController::class, 'show'])->name('payments.show');
    Route::post('/payments/{payment}/manual-proof', [User\PaymentController::class, 'submitManualProof'])
        ->middleware('throttle:6,1')->name('payments.manual-proof');

    // Wallet / transactions
    Route::get('/wallet', [User\WalletController::class, 'index'])->name('wallet.index');
    Route::get('/transactions', [User\WalletController::class, 'transactions'])->name('transactions.index');

    // Referrals & commissions
    Route::get('/referrals', [User\ReferralController::class, 'index'])->name('referrals.index');
    Route::get('/commissions', [User\CommissionController::class, 'index'])->name('commissions.index');

    // Returns / rewards
    Route::get('/returns', [User\ReturnController::class, 'index'])->name('returns.index');

    // Rank
    Route::get('/rank', [User\RankController::class, 'index'])->name('rank.index');

    // Funds
    Route::get('/funds', [User\FundController::class, 'index'])->name('fund.index');
    Route::post('/fund-requests', [User\FundRequestStoreController::class, 'store'])->name('fund-requests.store');

    // Withdrawals
    Route::get('/withdrawals', [User\WithdrawalController::class, 'index'])->name('withdrawals.index');
    Route::post('/withdrawals', [User\WithdrawalController::class, 'store'])->middleware('throttle:6,1')->name('withdrawals.store');
    Route::delete('/withdrawals/{withdrawal}', [User\WithdrawalController::class, 'cancel'])->name('withdrawals.cancel');

    // Profile & security
    Route::get('/profile', [Auth\ProfileController::class, 'edit'])->name('profile.edit');
    Route::put('/profile', [Auth\ProfileController::class, 'update'])->name('profile.update');
    Route::put('/password', [Auth\ProfileController::class, 'updatePassword'])->name('password.change');

    // Notifications
    Route::get('/notifications', [User\NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{id}/read', [User\NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('/notifications/read-all', [User\NotificationController::class, 'markAllRead'])->name('notifications.read-all');
});

/*
|--------------------------------------------------------------------------
| Admin area — single full-access administrator
|--------------------------------------------------------------------------
*/
Route::prefix('admin')
    ->name('admin.')
    ->middleware(['auth', 'verified', 'active', 'admin'])
    ->group(function () {
        Route::get('/', [Admin\DashboardController::class, 'index'])->name('dashboard');

        Route::get('/users', [Admin\UserController::class, 'index'])->name('users.index');
        Route::get('/users/{user}', [Admin\UserController::class, 'show'])->name('users.show');
        Route::post('/users/{user}/block', [Admin\UserController::class, 'block'])->name('users.block');
        Route::post('/users/{user}/activate', [Admin\UserController::class, 'activate'])->name('users.activate');

        Route::get('/deposits', [Admin\DepositController::class, 'index'])->name('deposits.index');
        Route::get('/deposits/{deposit}', [Admin\DepositController::class, 'show'])->name('deposits.show');
        Route::post('/deposits/{deposit}/verify-payment', [Admin\DepositController::class, 'verifyPayment'])->name('deposits.verify-payment');

        Route::get('/wallets', [Admin\WalletController::class, 'index'])->name('wallets.index');
        Route::get('/wallet-transactions', [Admin\WalletController::class, 'transactions'])->name('wallets.transactions');
        Route::post('/wallets/adjust/{user}', [Admin\WalletController::class, 'adjust'])->name('wallets.adjust');

        Route::get('/commissions', [Admin\CommissionController::class, 'index'])->name('commissions.index');

        Route::get('/returns', [Admin\ReturnController::class, 'index'])->name('returns.index');
        Route::get('/returns/{return}', [Admin\ReturnController::class, 'show'])->name('returns.show');
        Route::post('/returns/{return}/approve', [Admin\ReturnController::class, 'approve'])->name('returns.approve');
        Route::post('/returns/{return}/process', [Admin\ReturnController::class, 'process'])->name('returns.process');
        Route::post('/returns/{return}/complete', [Admin\ReturnController::class, 'complete'])->name('returns.complete');
        Route::post('/returns/{return}/cancel', [Admin\ReturnController::class, 'cancel'])->name('returns.cancel');
        Route::post('/returns/{return}/reverse', [Admin\ReturnController::class, 'reverse'])->name('returns.reverse');

        Route::get('/ranks', [Admin\RankController::class, 'index'])->name('ranks.index');
        Route::get('/ranks/{rank}/edit', [Admin\RankController::class, 'edit'])->name('ranks.edit');
        Route::put('/ranks/{rank}', [Admin\RankController::class, 'update'])->name('ranks.update');

        Route::get('/funds', [Admin\FundController::class, 'index'])->name('funds.index');
        Route::get('/funds/{request_model}', [Admin\FundController::class, 'show'])->name('funds.show');
        Route::post('/funds/{request_model}/approve', [Admin\FundController::class, 'approve'])->name('funds.approve');
        Route::post('/funds/{request_model}/reject', [Admin\FundController::class, 'reject'])->name('funds.reject');
        Route::post('/funds/{request_model}/process', [Admin\FundController::class, 'process'])->name('funds.process');
        Route::post('/funds/{request_model}/complete', [Admin\FundController::class, 'complete'])->name('funds.complete');

        Route::get('/withdrawals', [Admin\WithdrawalController::class, 'index'])->name('withdrawals.index');
        Route::get('/withdrawals/{withdrawal}', [Admin\WithdrawalController::class, 'show'])->name('withdrawals.show');
        Route::post('/withdrawals/{withdrawal}/approve', [Admin\WithdrawalController::class, 'approve'])->name('withdrawals.approve');
        Route::post('/withdrawals/{withdrawal}/process', [Admin\WithdrawalController::class, 'process'])->name('withdrawals.process');
        Route::post('/withdrawals/{withdrawal}/complete', [Admin\WithdrawalController::class, 'complete'])->name('withdrawals.complete');
        Route::post('/withdrawals/{withdrawal}/reject', [Admin\WithdrawalController::class, 'reject'])->name('withdrawals.reject');
        Route::post('/withdrawals/{withdrawal}/fail', [Admin\WithdrawalController::class, 'fail'])->name('withdrawals.fail');

        Route::get('/settings', [Admin\SettingsController::class, 'edit'])->name('settings.edit');
        Route::put('/settings', [Admin\SettingsController::class, 'update'])->name('settings.update');

        Route::get('/audit-logs', [Admin\AuditLogController::class, 'index'])->name('audit-logs.index');
    });
