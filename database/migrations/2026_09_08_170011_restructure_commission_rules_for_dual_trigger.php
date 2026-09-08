<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Step 1: Update existing Gen 1-10 rules → all become "deposit" trigger, scope="generation", enabled=true
        $depositRules = [
            1 => ['percentage' => '5.000',  'name' => 'Generation 1 – Deposit'],
            2 => ['percentage' => '2.000',  'name' => 'Generation 2 – Deposit'],
            3 => ['percentage' => '1.000',  'name' => 'Generation 3 – Deposit'],
            4 => ['percentage' => '0.500',  'name' => 'Generation 4 – Deposit'],
            5 => ['percentage' => '0.400',  'name' => 'Generation 5 – Deposit'],
            6 => ['percentage' => '0.300',  'name' => 'Generation 6 – Deposit'],
            7 => ['percentage' => '0.200',  'name' => 'Generation 7 – Deposit'],
            8 => ['percentage' => '0.100',  'name' => 'Generation 8 – Deposit'],
            9 => ['percentage' => '0.100',  'name' => 'Generation 9 – Deposit'],
            10 => ['percentage' => '0.100',  'name' => 'Generation 10 – Deposit'],
        ];

        foreach ($depositRules as $gen => $data) {
            DB::table('commission_rules')
                ->where('generation', $gen)
                ->where('trigger_event', 'deposit')
                ->update([
                    'trigger_event' => 'deposit',
                    'scope' => 'generation',
                    'name' => $data['name'],
                    'percentage' => $data['percentage'],
                    'enabled' => true,
                    'updated_at' => now(),
                ]);

            // For Gen 2-10 that are currently return_payout, update them to deposit
            DB::table('commission_rules')
                ->where('generation', $gen)
                ->where('trigger_event', 'return_payout')
                ->update([
                    'trigger_event' => 'deposit',
                    'scope' => 'generation',
                    'name' => $data['name'],
                    'percentage' => $data['percentage'],
                    'enabled' => true,
                    'updated_at' => now(),
                ]);
        }

        // Step 2: Insert 10 new rules for "return_payout" trigger (Gen 1-10)
        $returnRules = [
            ['generation' => 1,  'percentage' => '5.000', 'name' => 'Generation 1 – Return'],
            ['generation' => 2,  'percentage' => '2.000', 'name' => 'Generation 2 – Return'],
            ['generation' => 3,  'percentage' => '1.000', 'name' => 'Generation 3 – Return'],
            ['generation' => 4,  'percentage' => '0.500', 'name' => 'Generation 4 – Return'],
            ['generation' => 5,  'percentage' => '0.400', 'name' => 'Generation 5 – Return'],
            ['generation' => 6,  'percentage' => '0.300', 'name' => 'Generation 6 – Return'],
            ['generation' => 7,  'percentage' => '0.200', 'name' => 'Generation 7 – Return'],
            ['generation' => 8,  'percentage' => '0.100', 'name' => 'Generation 8 – Return'],
            ['generation' => 9,  'percentage' => '0.100', 'name' => 'Generation 9 – Return'],
            ['generation' => 10, 'percentage' => '0.100', 'name' => 'Generation 10 – Return'],
        ];

        foreach ($returnRules as $rule) {
            // Only insert if not already exists
            $exists = DB::table('commission_rules')
                ->where('generation', $rule['generation'])
                ->where('trigger_event', 'return_payout')
                ->exists();

            if (! $exists) {
                DB::table('commission_rules')->insert([
                    'name' => $rule['name'],
                    'generation' => $rule['generation'],
                    'scope' => 'generation',
                    'trigger_event' => 'return_payout',
                    'percentage' => $rule['percentage'],
                    'enabled' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        // Remove the return_payout rules we added
        DB::table('commission_rules')
            ->where('trigger_event', 'return_payout')
            ->delete();

        // Restore Gen 2-10 deposit rules back to return_payout (rough rollback)
        DB::table('commission_rules')
            ->where('trigger_event', 'deposit')
            ->where('generation', '>', 1)
            ->update(['trigger_event' => 'return_payout', 'updated_at' => now()]);
    }
};
