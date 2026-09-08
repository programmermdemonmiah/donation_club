<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\Audit\AuditLogService;
use App\Services\Settings\SettingsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class HeroController extends Controller
{
    public function __construct(private readonly SettingsService $settings) {}

    public function edit(): Response
    {
        $images = json_decode($this->settings->get('hero.images', '[]'), true) ?? [];

        return Inertia::render('admin/hero/Edit', [
            'hero' => [
                'title' => $this->settings->get('hero.title', 'Donate Together. Grow Together.'),
                'description' => $this->settings->get('hero.description', 'A transparent, member-governed community contribution platform registered in England & Wales. Make voluntary donations, build your community network, and support one another.'),
                'images' => $images,
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
        $request->validate([
            'image' => ['required', 'image', 'max:5120'], // Max 5MB
        ]);

        $file = $request->file('image');
        $filename = 'hero_' . time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        $file->move(public_path('assets/images/hero'), $filename);

        $path = '/assets/images/hero/' . $filename;

        $images = json_decode($this->settings->get('hero.images', '[]'), true) ?? [];
        $images[] = $path;

        $this->settings->set('hero.images', json_encode($images), null, 'business');

        AuditLogService::log('hero.image_uploaded', null, [], ['path' => $path], $request->user()->id);

        return back()->with('success', 'Image uploaded successfully.');
    }

    public function deleteImage(Request $request)
    {
        $request->validate([
            'index' => ['required', 'integer', 'min:0'],
        ]);

        $index = $request->input('index');
        $images = json_decode($this->settings->get('hero.images', '[]'), true) ?? [];

        if (isset($images[$index])) {
            $path = $images[$index];
            $fullPath = public_path(ltrim($path, '/'));

            if (file_exists($fullPath)) {
                @unlink($fullPath);
            }

            array_splice($images, $index, 1);
            $this->settings->set('hero.images', json_encode($images), null, 'business');

            AuditLogService::log('hero.image_deleted', null, ['path' => $path], [], $request->user()->id);
        }

        return back()->with('success', 'Image deleted successfully.');
    }
}
