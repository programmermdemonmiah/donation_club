<?php

namespace App\Http\Middleware;

use App\Services\Settings\SettingsService;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $settings = app(SettingsService::class);

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],
            'company' => [
                'name' => $settings->get('company.name', 'Donation Club LTD'),
                'registration' => $settings->get('company.registration', '13589920'),
                'address' => $settings->get('company.address', '71-75 Shelton Street, London, UK'),
                'phone' => $settings->get('company.phone', '+44 20 7946 0958'),
                'email' => $settings->get('company.email', 'support@donationclub.eu'),
            ],
            'chat' => [
                'widget_code' => $settings->get('chat.widget_code', ''),
            ],
            'flash' => [
                'message' => fn () => $request->session()->get('message'),
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
