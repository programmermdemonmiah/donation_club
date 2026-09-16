<?php

namespace Tests\Feature;

use App\Enums\SettingType;
use App\Services\Settings\SettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GalleryTest extends TestCase
{
    use RefreshDatabase;

    /** @var list<string> */
    private array $uploadedFiles = [];

    protected function tearDown(): void
    {
        foreach ($this->uploadedFiles as $file) {
            if (is_file($file)) {
                @unlink($file);
            }
        }

        parent::tearDown();
    }

    public function test_gallery_page_lists_saved_photos_and_videos(): void
    {
        app(SettingsService::class)->set('hero.images', [
            '/assets/images/hero_existing.jpg',
            '/assets/videos/video_existing.mp4',
        ], SettingType::Json, 'business');

        $this->get(route('pages.gallery'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('public/Gallery')
                ->where('media.0.url', '/assets/images/hero_existing.jpg')
                ->where('media.0.type', 'image')
                ->where('media.1.type', 'video'));
    }

    public function test_admin_upload_adds_a_video_to_the_gallery(): void
    {
        $admin = $this->createUser(['is_admin' => true]);

        $this->actingAs($admin)
            ->post(route('admin.hero.images.store'), [
                'media' => UploadedFile::fake()->create('club.mp4', 200, 'video/mp4'),
            ])
            ->assertRedirect()
            ->assertSessionHas('success', 'Video added to the gallery.');

        $stored = app(SettingsService::class)->get('hero.images', []);
        $this->assertIsArray($stored);
        $this->assertCount(1, $stored);
        $this->assertStringStartsWith('/assets/videos/video_', $stored[0]);

        $absolute = public_path(ltrim($stored[0], '/'));
        $this->uploadedFiles[] = $absolute;
        $this->assertFileExists($absolute);
    }

    public function test_admin_cannot_upload_a_file_that_is_not_a_photo_or_video(): void
    {
        $admin = $this->createUser(['is_admin' => true]);

        $this->actingAs($admin)
            ->post(route('admin.hero.images.store'), [
                'media' => UploadedFile::fake()->create('notes.pdf', 20, 'application/pdf'),
            ])
            ->assertRedirect()
            ->assertSessionHas('error');

        $stored = app(SettingsService::class)->get('hero.images', []);
        $this->assertTrue($stored === null || $stored === [] || $stored === '[]');
    }

    public function test_member_cannot_upload_gallery_media(): void
    {
        $member = $this->createUser();

        $this->actingAs($member)
            ->post(route('admin.hero.images.store'), [
                'media' => UploadedFile::fake()->image('photo.jpg'),
            ])
            ->assertForbidden();
    }
}
