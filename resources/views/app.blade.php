<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="h-full">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Donation Club') }}</title>

        <link rel="icon" href="{{ app(\App\Services\Settings\SettingsService::class)->get('company.favicon', '/favicon.ico') }}" type="image/x-icon">

        @routes
        @viteReactRefresh
        @vite(['resources/css/app.css', "resources/js/app.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased h-full bg-gray-50 text-gray-900">
        @inertia
    </body>
</html>
