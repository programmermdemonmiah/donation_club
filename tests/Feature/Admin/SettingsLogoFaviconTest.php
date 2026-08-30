<?php

namespace Tests\Feature\Admin;

use App\Services\Settings\SettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class SettingsLogoFaviconTest extends TestCase
{
    use RefreshDatabase;

    private array $uploadedFiles = [];

    protected function tearDown(): void
    {
        // Clean up any files uploaded during testing
        foreach ($this->uploadedFiles as $file) {
            if (file_exists($file)) {
                @unlink($file);
            }
        }

        parent::tearDown();
    }

    public function test_admin_can_upload_logo_and_favicon(): void
    {
        $admin = $this->createUser(['is_admin' => true]);
        $settingsService = app(SettingsService::class);

        // Verify initial defaults
        $this->assertEquals('/assets/images/logo.jpeg', $settingsService->get('company.logo', '/assets/images/logo.jpeg'));
        $this->assertEquals('/favicon.ico', $settingsService->get('company.favicon', '/favicon.ico'));

        $logoFile = UploadedFile::fake()->image('test_logo.png');
        $faviconFile = UploadedFile::fake()->create('test_favicon.ico', 10, 'image/x-icon');

        $response = $this->actingAs($admin)
            ->post(route('admin.settings.update'), [
                '_method' => 'PUT',
                'company_name' => 'Donation Club Test',
                'company_registration' => '12345678',
                'company_address' => '123 Test Street',
                'company_phone' => '1234567890',
                'company_email' => 'test@donationclub.eu',
                'deposit_min_amount' => '2.00',
                'deposit_max_amount' => '200.00',
                'deposit_required_sequence_gap' => '10',
                'deposit_max_per_account_cycle' => '2',
                'return_enabled' => false,
                'return_min_direct_referrals' => 2,
                'withdrawal_enabled' => true,
                'withdrawal_min_amount' => '10.00',
                'withdrawal_max_amount' => '1000.00',
                'withdrawal_fee_percent' => '5.00',
                'logo' => $logoFile,
                'favicon' => $faviconFile,
            ]);

        $response->assertRedirect();
        $response->assertSessionHasNoErrors();

        $updatedLogo = $settingsService->get('company.logo');
        $updatedFavicon = $settingsService->get('company.favicon');

        $this->assertNotNull($updatedLogo);
        $this->assertNotNull($updatedFavicon);

        $this->assertStringStartsWith('/assets/images/logo_', $updatedLogo);
        $this->assertStringStartsWith('/assets/images/favicon_', $updatedFavicon);

        $logoPath = public_path(ltrim($updatedLogo, '/'));
        $faviconPath = public_path(ltrim($updatedFavicon, '/'));

        $this->uploadedFiles[] = $logoPath;
        $this->uploadedFiles[] = $faviconPath;

        $this->assertFileExists($logoPath);
        $this->assertFileExists($faviconPath);
    }
}
