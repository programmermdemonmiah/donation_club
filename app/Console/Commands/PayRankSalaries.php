<?php

namespace App\Console\Commands;

use App\Enums\WalletTransactionType;
use App\Models\Rank;
use App\Models\User;
use App\Services\Settings\SettingsService;
use App\Services\Wallet\WalletService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class PayRankSalaries extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ranks:pay-salary';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Pay monthly salaries to users holding eligible ranks.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting monthly rank salary payouts...');

        if (! app(SettingsService::class)->get('rank.salary_enabled', true)) {
            $this->info('Monthly salary payouts are disabled in settings. Skipping.');

            return;
        }

        $currentMonth = Carbon::now()->format('Y-m');
        $paidCount = 0;

        // Get all ranks that have a monthly salary
        $eligibleRanks = Rank::where('active', true)
            ->where('monthly_salary', '>', 0)
            ->get();

        if ($eligibleRanks->isEmpty()) {
            $this->info('No ranks have a monthly salary configured.');

            return;
        }

        foreach ($eligibleRanks as $rank) {
            $this->info("Processing rank: {$rank->name} (Salary: {$rank->monthly_salary})");

            // Find users who hold this rank actively
            $userIds = DB::table('user_ranks')
                ->where('rank_id', $rank->id)
                ->where('status', 'active')
                ->pluck('user_id');

            foreach ($userIds as $userId) {
                // Check if already paid this month
                $alreadyPaid = DB::table('salary_payouts')
                    ->where('user_id', $userId)
                    ->where('payout_month', $currentMonth)
                    ->exists();

                if ($alreadyPaid) {
                    continue;
                }

                $user = User::find($userId);
                if (! $user || ! $user->isActive()) {
                    continue;
                }

                DB::transaction(function () use ($user, $rank, $currentMonth, &$paidCount) {
                    // Create payout record
                    DB::table('salary_payouts')->insert([
                        'user_id' => $user->id,
                        'rank_id' => $rank->id,
                        'payout_month' => $currentMonth,
                        'amount' => $rank->monthly_salary,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    // Credit wallet
                    WalletService::credit(
                        $user,
                        (string) $rank->monthly_salary,
                        WalletTransactionType::MonthlySalary,
                        $rank,
                        "Monthly salary for holding {$rank->name} rank"
                    );

                    $paidCount++;
                });
            }
        }

        $this->info("Completed. {$paidCount} users were paid their monthly salary.");
    }
}
