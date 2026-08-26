# Donation Club

A community contribution platform built with **Laravel 13 (PHP 8.5)**, **Inertia.js + React + TypeScript**, and **Tailwind CSS 4** on **MySQL/MariaDB**. No Redis. Only two account types: `User` and `Admin` — no staff/moderator/sub-admin roles.

## Modules

| Module | Notes |
| --- | --- |
| Auth | Register (+referral code), login, logout, forgot/reset password, email verification, change password, profile |
| Deposits | $1–$10 default limits, DB-safe sequential numbering (`#000001`), public ledger at `/ledger` (amounts only) |
| Payments | `PaymentGatewayInterface` abstraction; manual bank-transfer gateway included; idempotent completion |
| Wallet | Append-only double-context ledger (`wallets`, `wallet_transactions`); holds for withdrawals; DECIMAL(16,2) + bcmath only |
| Referrals | Materialized-path tree, max 10 generations, self-referral & cycle prevention |
| Commissions | Configurable direct (5% default, deposit-triggered) + generation rules (return-triggered); master legal switch |
| Returns/Rewards | Eligibility service, admin-driven approve→process→complete pipeline, reversals; disabled until legally approved |
| Ranks | Bronze→Diamond ladder with configurable requirements; automated promotion scheduler |
| Support Fund | Rank-gated requests → admin review → wallet disbursement with fund transaction records |
| Withdrawals | Min/max/fee configurable, wallet locking, full lifecycle with hold release on reject/fail/cancel |
| Admin Panel | Single full-access administrator: users, deposits, wallets, commissions, returns, ranks, funds, withdrawals, settings, audit logs |
| Audit | Append-only `audit_logs`; financial rows are never deleted — use reversal records |

## Local development

```bash
composer install
npm install

cp .env.example .env          # then edit DB_*, APP_URL
php artisan key:generate
php artisan migrate --seed    # creates tables + baseline data

npm run dev                   # Vite dev server
php artisan serve             # or your local web server
```

Default seeded admin: `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env` (defaults `admin@donationclub.test` / `ChangeMe!2026`). **Change these immediately in any real environment.**

### Tests

```bash
php artisan test
```

Tests run against the `donation_club_testing` MySQL database (see `phpunit.xml`) and cover referral integrity, sequence allocation, wallet ledger invariants, withdrawal locking, commission math, return eligibility/reversal, rank promotion, fund disbursement, money math, and admin authorization.

## Business rule configuration

All financial rules live in the database and are editable at `/admin/settings`:

- Deposit min/max, per-account cycle limit, required sequence gap
- Commission master switch + per-generation percentage/trigger/enable
- Return module enable flag (legal gate), percent, minimum direct referrals, rank/deposit/sequence requirements
- Withdrawal enable/min/max/fee

Nothing business-critical is hard-coded in controllers or the frontend.

### Legal safeguard

The returns/rewards module and multi-generation commissions ship **disabled**. Enable them only after confirming the exact business model is permitted in your operating jurisdiction, and always represent the real legal entity and country of operation. Never promise guaranteed returns or fixed payout dates to members.

## Production deployment (Nginx + PHP-FPM 8.5 + MariaDB + Supervisor)

```bash
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan storage:link
php artisan optimize            # config:cache + route:cache + view:cache
npm ci && npm run build         # build assets locally or in CI
```

Queue worker (database driver) via Supervisor:

```ini
[program:donation-queue]
command=php /var/www/donation_club/artisan queue:work --sleep=1 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopwaitsecs=30
user=www-data
```

Scheduler (cron entry):

```cron
* * * * * cd /var/www/donation_club && php artisan schedule:run >> /dev/null 2>&1
```

Scheduled tasks (see `routes/console.php`): pending payment verification (hourly), rank evaluation (daily), return eligibility scan (daily — marks eligible only; payouts always require explicit admin approval).

## Architecture notes

- Controllers stay thin; all business logic lives in domain services under `app/Services/<Domain>/`.
- Every wallet mutation happens inside `DB::transaction()` with `lockForUpdate()` row locking and produces exactly one immutable ledger entry.
- Payment completion is idempotent: replays never double-credit or re-allocate sequences.
- Sequence numbers come from a locked counter row inside the completing transaction — rollback restores it, so no gaps and no duplicates.
- All monetary math uses `App\Support\Money` (bcmath). Floats are never used for money.
# donation_club
