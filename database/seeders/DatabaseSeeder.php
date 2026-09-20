<?php

namespace Database\Seeders;

use App\Models\CommissionRule;
use App\Models\Fund;
use App\Models\Rank;
use App\Models\ReturnRule;
use App\Models\Setting;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed a production-safe baseline:
     *  - single admin account
     *  - configurable business defaults
     *  - commission rules matching the documented example
     *  - rank ladder
     *  - return module DISABLED until legally approved
     */
    public function run(): void
    {
        DB::transaction(function () {
            $this->seedSequenceCounter();
            $this->seedSettings();
            $this->seedAdmin();
            $this->seedCommissionRules();
            $this->seedRanks();
            $this->seedReturnRule();
            $this->seedFunds();
        });
    }

    private function seedSequenceCounter(): void
    {
        DB::table('sequence_counters')->updateOrInsert(
            ['name' => 'deposit'],
            ['current_value' => 0, 'created_at' => now(), 'updated_at' => now()],
        );
    }

    private function seedSettings(): void
    {
        $settings = [
            'deposit.min_amount' => '1.00',
            'deposit.max_amount' => '10.00',
            'deposit.required_sequence_gap' => 20,
            'deposit.max_per_account_cycle' => 1,
            'commission.enabled' => false, // master switch — enable only after legal review
            'withdrawal.enabled' => true,
            'withdrawal.min_amount' => '5.00',
            'withdrawal.max_amount' => '1000.00',
            'withdrawal.fee_percent' => '1.00',
            'rank.qualified_min_deposit' => '10.00',
        ];

        foreach ($settings as $key => $value) {
            Setting::query()->updateOrCreate(['key' => $key], [
                'value' => is_bool($value) ? ($value ? '1' : '0') : (string) $value,
                'type' => match (true) {
                    is_bool($value) => \App\Enums\SettingType::Boolean,
                    str_contains($key, '_percent') || str_contains($key, 'amount') => \App\Enums\SettingType::Decimal,
                    default => \App\Enums\SettingType::Integer,
                },
                'group' => 'business',
            ]);
        }
    }

    private function seedAdmin(): void
    {
        User::query()->firstOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@donationclub.com')],
            [
                'name' => 'Administrator',
                'password' => env('ADMIN_PASSWORD', '12345678'),
                'is_admin' => true,
                'username' => "admin",
                'status' => \App\Enums\UserStatus::Active->value,
                'referral_code' => \App\Services\Referral\ReferralService::generateReferralCode(),
                'email_verified_at' => now(),
            ],
        );

        if (! \App\Models\Wallet::where('user_id', User::where('is_admin', true)->value('id'))->exists()) {
            // wallets are created per user on demand; nothing to do for admin
        }
    }

    private function seedCommissionRules(): void
    {
        $ladder = [
            1 => '5.000',
            2 => '2.000',
            3 => '1.000',
            4 => '0.500',
            5 => '0.400',
            6 => '0.300',
            7 => '0.200',
            8 => '0.100',
            9 => '0.100',
            10 => '0.100',
        ];

        foreach ($ladder as $generation => $percentage) {
            CommissionRule::query()->updateOrCreate(
                [
                    'trigger_event' => 'deposit',
                    'generation' => $generation,
                ],
                [
                    'name' => "Generation {$generation} – Deposit",
                    'scope' => $generation === 1 ? 'direct' : 'generation',
                    'percentage' => $percentage,
                    'enabled' => true,
                ],
            );

            CommissionRule::query()->updateOrCreate(
                [
                    'trigger_event' => 'return_payout',
                    'generation' => $generation,
                ],
                [
                    'name' => "Generation {$generation} – Return",
                    'scope' => 'generation',
                    'percentage' => $percentage,
                    'enabled' => true,
                ],
            );
        }
    }

    private function seedRanks(): void
    {
        $this->call(RankSeeder::class);
    }

    private function seedReturnRule(): void
    {
        ReturnRule::query()->updateOrCreate([], [
            'enabled' => false, // LEGAL GATE: keep disabled until business model approved in operating jurisdiction
            'return_percent' => null,
            'minimum_direct_referrals' => 2,
            'deposit_requirement' => '0',
            'sequence_requirement' => 0,
            'terms_note' => 'Returns/rewards are discretionary and not guaranteed. Activation requires legal approval.',
        ]);
    }

    private function seedFunds(): void
    {
        $silver = Rank::query()->where('slug', 'silver')->value('id');

        Fund::query()->updateOrCreate(['name' => 'Employment Support Fund'], [
            'description' => 'Support fund for eligible members to start or grow income-generating activity.',
            'minimum_rank_id' => $silver,
            'min_amount' => '50.00',
            'max_amount' => '500.00',
            'requires_proof' => true,
            'enabled' => true,
        ]);
    }
}
