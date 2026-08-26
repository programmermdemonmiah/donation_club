<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('security/TwoFactor', [
            'enabled' => $user->is2faEnabled(),
        ]);
    }

    public function setup(Request $request)
    {
        $user = $request->user();
        $google2fa = new Google2FA;

        if ($user->google2fa_secret) {
            $secret = $user->google2fa_secret;
        } else {
            $secret = $google2fa->generateSecretKey();
            $user->update(['google2fa_secret' => $secret]);
        }

        $qrCodeUrl = $google2fa->getQRCodeUrl(
            config('app.name', 'DonationClub'),
            $user->email,
            $secret
        );

        return Inertia::render('security/TwoFactorSetup', [
            'secret' => $secret,
            'qrCodeUrl' => $qrCodeUrl,
            'enabled' => $user->is2faEnabled(),
        ]);
    }

    public function enable(Request $request)
    {
        $validated = $request->validate([
            'otp' => ['required', 'digits:6'],
        ]);

        $user = $request->user();
        $google2fa = new Google2FA;

        $valid = $google2fa->verifyKey($user->google2fa_secret, $validated['otp']);

        if (! $valid) {
            return back()->withErrors(['otp' => 'The OTP code is invalid. Please try again.']);
        }

        $user->update(['google2fa_enabled' => true]);

        return redirect()->route('security.2fa.index')->with('success', 'Two-factor authentication enabled successfully!');
    }

    public function disable(Request $request)
    {
        $validated = $request->validate([
            'otp' => ['required', 'digits:6'],
        ]);

        $user = $request->user();
        $google2fa = new Google2FA;

        $valid = $google2fa->verifyKey($user->google2fa_secret, $validated['otp']);

        if (! $valid) {
            return back()->withErrors(['otp' => 'The OTP code is invalid.']);
        }

        $user->update([
            'google2fa_enabled' => false,
            'google2fa_secret' => null,
        ]);

        return redirect()->route('security.2fa.index')->with('success', 'Two-factor authentication disabled.');
    }
}
