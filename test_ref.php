<?php
use App\Models\User;
use App\Services\Referral\ReferralService;

$referrer = User::factory()->create([
    'username' => 'testuser' . rand(1000, 9999), 
    'referral_code' => 'TESTCODE' . rand(1000, 9999)
]);
echo 'Created referrer: ' . $referrer->id . PHP_EOL;

for ($i = 1; $i <= 3; $i++) {
    $user = User::factory()->create(['username' => 'testuser' . rand(10000, 99999)]);
    ReferralService::attachReferrer($user, $referrer);
    echo 'Attached user ' . $user->id . ' to referrer' . PHP_EOL;
}

echo 'Total direct referrals: ' . ReferralService::directReferrals($referrer)->count() . PHP_EOL;

try {
    ReferralService::validateForRegistration($referrer->referral_code);
    echo 'FAIL: validateForRegistration allowed 4th user!' . PHP_EOL;
} catch (\InvalidArgumentException $e) {
    echo 'SUCCESS (validateForRegistration): ' . $e->getMessage() . PHP_EOL;
}

try {
    $user4 = User::factory()->create(['username' => 'testuser' . rand(10000, 99999)]);
    ReferralService::attachReferrer($user4, $referrer);
    echo 'FAIL: attachReferrer allowed 4th user!' . PHP_EOL;
} catch (\InvalidArgumentException $e) {
    echo 'SUCCESS (attachReferrer): ' . $e->getMessage() . PHP_EOL;
}
