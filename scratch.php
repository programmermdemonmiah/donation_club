<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$user = \App\Models\User::first(); // User 1

echo "Volumes before deposit:\n";
echo "Gen 1: " . \App\Services\Referral\ReferralService::generationVolume($user, 1) . "\n";
echo "Gen 2: " . \App\Services\Referral\ReferralService::generationVolume($user, 2) . "\n";
echo "Gen 3: " . \App\Services\Referral\ReferralService::generationVolume($user, 3) . "\n";

// User 2 is in Gen 1
$user2 = \App\Models\User::find(2);
$user2->deposits()->create([
    'amount' => 100,
    'status' => 'completed',
    'reference' => 'TESTDEP1'
]);

echo "Volumes AFTER deposit from Gen 1 (User 2):\n";
echo "Gen 1: " . \App\Services\Referral\ReferralService::generationVolume($user, 1) . "\n";
echo "Gen 2: " . \App\Services\Referral\ReferralService::generationVolume($user, 2) . "\n";
echo "Gen 3: " . \App\Services\Referral\ReferralService::generationVolume($user, 3) . "\n";

$user2->deposits()->where('reference', 'TESTDEP1')->delete();
