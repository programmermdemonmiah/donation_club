<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RankSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ranks = [
            [
                'name' => 'Bronze',
                'slug' => 'bronze',
                'level' => 1,
                'color' => '#cd7f32',
                'description' => 'Entry level rank',
                'active' => true,
                'incentive_amount' => '10.00',
                'monthly_salary' => '0.00',
                'requirements' => [],
            ],
            [
                'name' => 'Silver',
                'slug' => 'silver',
                'level' => 2,
                'color' => '#c0c0c0',
                'description' => 'Silver rank',
                'active' => true,
                'incentive_amount' => '50.00',
                'monthly_salary' => '0.00',
                'requirements' => [
                    'gen1_volume' => '100.00',
                    'gen2_volume' => '100.00',
                    'gen3_volume' => '100.00',
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
                'monthly_salary' => '0.00',
                'requirements' => [
                    'gen1_volume' => '500.00',
                    'gen2_volume' => '500.00',
                    'gen3_volume' => '500.00',
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
                'monthly_salary' => '0.00',
                'requirements' => [
                    'gen1_volume' => '2500.00',
                    'gen2_volume' => '2500.00',
                    'gen3_volume' => '2500.00',
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
                'monthly_salary' => '0.00',
                'requirements' => [
                    'gen1_volume' => '10000.00',
                    'gen2_volume' => '10000.00',
                    'gen3_volume' => '10000.00',
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
                'monthly_salary' => '0.00',
                'requirements' => [
                    'gen1_volume' => '50000.00',
                    'gen2_volume' => '50000.00',
                    'gen3_volume' => '50000.00',
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
                'monthly_salary' => '0.00',
                'requirements' => [
                    'gen1_volume' => '250000.00',
                    'gen2_volume' => '250000.00',
                    'gen3_volume' => '250000.00',
                ],
            ],
        ];

        foreach ($ranks as $rankData) {
            $requirements = $rankData['requirements'];
            unset($rankData['requirements']);

            $rank = \App\Models\Rank::updateOrCreate(
                ['slug' => $rankData['slug']],
                $rankData
            );

            foreach ($requirements as $key => $value) {
                \App\Models\RankRequirement::updateOrCreate(
                    [
                        'rank_id' => $rank->id,
                        'key' => $key,
                    ],
                    ['value' => $value]
                );
            }
        }
    }
}
