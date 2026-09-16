<?php

namespace Tests\Unit;

use App\Support\GalleryMedia;
use PHPUnit\Framework\TestCase;

class GalleryMediaTest extends TestCase
{
    public function test_classifies_photos_and_videos_and_drops_unsafe_paths(): void
    {
        $media = GalleryMedia::fromStored([
            '/assets/images/hero_1.jpg',
            '/assets/videos/video_1.mp4',
            'https://evil.example/steal.jpg',
            '/assets/images/../.env',
            '/assets/images/notes.pdf',
        ]);

        $this->assertSame([
            ['url' => '/assets/images/hero_1.jpg', 'type' => 'image'],
            ['url' => '/assets/videos/video_1.mp4', 'type' => 'video'],
        ], $media);
    }

    public function test_admin_list_keeps_every_stored_index(): void
    {
        $media = GalleryMedia::forAdmin([
            '/assets/images/hero_1.png',
            'not-a-path',
            '/assets/videos/clip.webm',
        ]);

        $this->assertCount(3, $media);
        $this->assertSame('image', $media[0]['type']);
        $this->assertSame('file', $media[1]['type']);
        $this->assertSame('video', $media[2]['type']);
    }

    public function test_reads_php_size_limits_as_kilobytes(): void
    {
        $this->assertSame(2048, GalleryMedia::iniKilobytes('2M'));
        $this->assertSame(8192, GalleryMedia::iniKilobytes('8M'));
    }
}
