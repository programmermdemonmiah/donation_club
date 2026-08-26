<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\PasswordUpdateRequest;
use App\Http\Requests\Auth\ProfileUpdateRequest;
use App\Services\Audit\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function edit(): Response
    {
        $user = request()->user()->loadMissing('profile');

        return Inertia::render('profile/Edit', [
            'auth' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'referral_code' => $user->referral_code,
                ],
            ],
            'profile' => $user->profile,
            'status' => session('status'),
        ]);
    }

    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();

        DB::transaction(function () use ($user, $data) {
            $oldName = $user->name;
            $user->update(['name' => $data['name']]);

            $profileData = collect($data)->except('name')->all();

            if (! $user->profile) {
                $user->profile()->create($profileData);
            } else {
                $user->profile->update($profileData);
            }

            AuditLogService::logChanges('profile.updated', $user, ['name' => $oldName], ['name' => $data['name']]);
        });

        return back()->with('success', 'Profile updated.');
    }

    public function updatePassword(PasswordUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();

        $user->update(['password' => $request->validated('password')]);

        AuditLogService::log('password.changed', $user);

        return back()->with('success', 'Password changed successfully.');
    }
}
