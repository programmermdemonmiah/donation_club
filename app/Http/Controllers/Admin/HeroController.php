<?php

namespace App\Http\Controllers\Admin;

use App\Enums\SettingType;
use App\Http\Controllers\Controller;
use App\Services\Audit\AuditLogService;
use App\Services\Settings\SettingsService;
use App\Support\GalleryMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class HeroController extends Controller
{
    public function __construct(private readonly SettingsService $settings) {}

    public function edit(): Response
    {
        $rawImages = $this->settings->get('hero.images', '[]');
        $images = is_string($rawImages) ? (json_decode($rawImages, true) ?? []) : (is_array($rawImages) ? $rawImages : []);

        return Inertia::render('admin/hero/Edit', [
            'hero' => [
                'title' => $this->settings->get('hero.title', 'Donate Together. Grow Together.'),
                'description' => $this->settings->get('hero.description', 'A transparent, member-governed community contribution platform registered in England & Wales. Make voluntary donations, build your community network, and support one another.'),
                'media' => GalleryMedia::forAdmin($images),
                'limits' => [
                    'photo_mb' => round(GalleryMedia::allowedKilobytes('image') / 1024, 1),
                    'video_mb' => round(GalleryMedia::allowedKilobytes('video') / 1024, 1),
                ],
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:1000'],
        ]);

        $old = [
            'hero.title' => $this->settings->get('hero.title'),
            'hero.description' => $this->settings->get('hero.description'),
        ];

        $this->settings->set('hero.title', $validated['title'], null, 'business');
        $this->settings->set('hero.description', $validated['description'], null, 'business');

        AuditLogService::log('hero.updated', null, $old, $validated, $request->user()->id);

        return back()->with('success', 'Hero text updated successfully.');
    }

    public function uploadImage(Request $request)
    {
        try {
            $contentLength = (int) $request->server('CONTENT_LENGTH');
            $serverBytes = GalleryMedia::serverUploadKilobytes() * 1024;

            if (! $request->hasFile('media') && $serverBytes > 0 && $contentLength > $serverBytes) {
                return back()->with('error', 'Upload failed: The file is larger than the server allows ('.ini_get('upload_max_filesize').').');
            }

            $request->validate([
                'media' => ['required', 'file', 'max:'.GalleryMedia::allowedKilobytes('video')],
            ]);

            $file = $request->file('media');

            if ($file === null || is_array($file)) {
                return back()->with('error', 'Upload failed: Choose one photo or video.');
            }

            $extension = strtolower($file->getClientOriginalExtension());
            $type = GalleryMedia::typeForExtension($extension);

            if ($type === null) {
                return back()->with('error', 'Upload failed: Only JPG, PNG, and WebP photos, or MP4, WebM, and MOV videos are allowed.');
            }

            $maxKilobytes = GalleryMedia::allowedKilobytes($type);

            if ($file->getSize() > ($maxKilobytes * 1024)) {
                $limit = rtrim(rtrim(number_format($maxKilobytes / 1024, 1), '0'), '.').'MB';
                $label = $type === 'video' ? 'Videos' : 'Photos';

                return back()->with('error', "Upload failed: {$label} must be {$limit} or smaller.");
            }

            if (! GalleryMedia::mimeAllowed($type, (string) $file->getMimeType())) {
                return back()->with('error', 'Upload failed: The file contents do not match an allowed photo or video.');
            }

            $folder = $type === 'video' ? 'assets/videos' : 'assets/images';
            $destinationPath = public_path($folder);

            if (! is_dir($destinationPath) && ! mkdir($destinationPath, 0755, true) && ! is_dir($destinationPath)) {
                return back()->with('error', 'Upload failed: The gallery folder could not be created.');
            }

            $prefix = $type === 'video' ? 'video' : 'hero';
            $filename = $prefix.'_'.time().'_'.uniqid().'.'.$extension;
            $file->move($destinationPath, $filename);

            $path = '/'.$folder.'/'.$filename;

            // SettingsService will return array if type is Json, but fallback defaults to string '[]'
            $rawImages = $this->settings->get('hero.images', '[]');
            $images = is_string($rawImages) ? (json_decode($rawImages, true) ?? []) : (is_array($rawImages) ? $rawImages : []);

            $images[] = $path;

            $this->settings->set('hero.images', $images, SettingType::Json, 'business');

            AuditLogService::log('hero.image_uploaded', null, [], ['path' => $path], $request->user()->id);

            $success = $type === 'video' ? 'Video added to the gallery.' : 'Photo added to the gallery.';

            return back()->with('success', $success);
        } catch (ValidationException $e) {
            throw $e; // Let Laravel handle standard validation errors
        } catch (\Throwable $e) {
            Log::error('Hero Image Upload Error: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return back()->with('error', 'Upload failed: '.$e->getMessage());
        }
    }

    public function deleteImage(Request $request)
    {
        $request->validate([
            'index' => ['required', 'integer', 'min:0'],
        ]);

        try {
            $index = $request->input('index');

            $rawImages = $this->settings->get('hero.images', '[]');
            $images = is_string($rawImages) ? (json_decode($rawImages, true) ?? []) : (is_array($rawImages) ? $rawImages : []);

            if (isset($images[$index])) {
                $path = $images[$index];
                $fullPath = is_string($path) ? GalleryMedia::deletableAbsolutePath($path) : null;

                if ($fullPath !== null) {
                    @unlink($fullPath);
                }

                array_splice($images, $index, 1);
                $this->settings->set('hero.images', $images, SettingType::Json, 'business');

                AuditLogService::log('hero.image_deleted', null, ['path' => $path], [], $request->user()->id);
            }

            return back()->with('success', 'Removed from the gallery.');
        } catch (\Throwable $e) {
            Log::error('Hero Image Delete Error: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return back()->with('error', 'Delete failed: '.$e->getMessage());
        }
    }
}
