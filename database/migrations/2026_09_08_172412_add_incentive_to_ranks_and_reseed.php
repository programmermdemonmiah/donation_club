<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Add incentive_amount to ranks table
        Schema::table('ranks', function (Blueprint $table) {
            $table->decimal('incentive_amount', 16, 2)->default(0)->after('active');
        });

        // 2. Clear existing ranks + requirements
        DB::table('rank_requirements')->delete();
        DB::table('ranks')->delete();

        // 3. Insert 7 ranks with correct data
        $ranks = [
            [
                'name' => 'Bronze',
                'slug' => 'bronze',
                'level' => 1,
                'color' => '#cd7f32',
                'description' => 'Entry level rank',
                'active' => true,
                'incentive_amount' => '10.00',
                'created_at' => now(),
                'updated_at' => now(),
                'requirements' => [
                    ['key' => 'gen1_volume', 'value' => '100.00'],
                    ['key' => 'gen2_volume', 'value' => '100.00'],
                    ['key' => 'gen3_volume', 'value' => '100.00'],
                ],
            ],
            [
                'name' => 'Silver',
                'slug' => 'silver',
                'level' => 2,
                'color' => '#c0c0c0',
                'description' => 'Silver rank',
                'active' => true,
                'incentive_amount' => '50.00',
                'created_at' => now(),
                'updated_at' => now(),
                'requirements' => [
                    ['key' => 'gen1_volume', 'value' => '500.00'],
                    ['key' => 'gen2_volume', 'value' => '500.00'],
                    ['key' => 'gen3_volume', 'value' => '500.00'],
                ],
            ],
            [
                'name' => 'Gold',
                'slug' => 'gold',
                'level' => 3,
                'color' => '#ffd700',
                'description' => 'Gold rank',
                'active' => true,
                'incentive_amount' => '250.00',
                'created_at' => now(),
                'updated_at' => now(),
                'requirements' => [
                    ['key' => 'gen1_volume', 'value' => '2500.00'],
                    ['key' => 'gen2_volume', 'value' => '2500.00'],
                    ['key' => 'gen3_volume', 'value' => '2500.00'],
                ],
            ],
            [
                'name' => 'Platina',
                'slug' => 'platina',
                'level' => 4,
                'color' => '#e5e4e2',
                'description' => 'Platina rank',
                'active' => true,
                'incentive_amount' => '1000.00',
                'created_at' => now(),
                'updated_at' => now(),
                'requirements' => [
                    ['key' => 'gen1_volume', 'value' => '10000.00'],
                    ['key' => 'gen2_volume', 'value' => '10000.00'],
                    ['key' => 'gen3_volume', 'value' => '10000.00'],
                ],
            ],
            [
                'name' => 'Diamond',
                'slug' => 'diamond',
                'level' => 5,
                'color' => '#b9f2ff',
                'description' => 'Diamond rank',
                'active' => true,
                'incentive_amount' => '5000.00',
                'created_at' => now(),
                'updated_at' => now(),
                'requirements' => [
                    ['key' => 'gen1_volume', 'value' => '50000.00'],
                    ['key' => 'gen2_volume', 'value' => '50000.00'],
                    ['key' => 'gen3_volume', 'value' => '50000.00'],
                ],
            ],
            [
                'name' => 'Country Manager',
                'slug' => 'country-manager',
                'level' => 6,
                'color' => '#7c3aed',
                'description' => 'Country Manager rank',
                'active' => true,
                'incentive_amount' => '25000.00',
                'created_at' => now(),
                'updated_at' => now(),
                'requirements' => [
                    ['key' => 'gen1_volume', 'value' => '250000.00'],
                    ['key' => 'gen2_volume', 'value' => '250000.00'],
                    ['key' => 'gen3_volume', 'value' => '250000.00'],
                ],
            ],
            [
                'name' => 'Country Director',
                'slug' => 'country-director',
                'level' => 7,
                'color' => '#dc2626',
                'description' => 'Country Director rank',
                'active' => true,
                'incentive_amount' => '100000.00',
                'created_at' => now(),
                'updated_at' => now(),
                'requirements' => [
                    ['key' => 'gen1_volume', 'value' => '1000000.00'],
                    ['key' => 'gen2_volume', 'value' => '1000000.00'],
                    ['key' => 'gen3_volume', 'value' => '1000000.00'],
                ],
            ],
        ];

        foreach ($ranks as $rankData) {
            $requirements = $rankData['requirements'];
            unset($rankData['requirements']);

            $rankId = DB::table('ranks')->insertGetId($rankData);

            foreach ($requirements as $req) {
                DB::table('rank_requirements')->insert([
                    'rank_id' => $rankId,
                    'key' => $req['key'],
                    'value' => $req['value'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('ranks', function (Blueprint $table) {
            $table->dropColumn('incentive_amount');
        });
    }
};
