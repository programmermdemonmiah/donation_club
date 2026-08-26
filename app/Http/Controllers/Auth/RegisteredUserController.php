<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\Auth\RegistrationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function __construct(private readonly RegistrationService $registration)
    {
    }

    public function create(): Response
    {
        return Inertia::render('auth/Register', [
            'referralCode' => request()->query('ref'),
        ]);
    }

    public function store(RegisterRequest $request): RedirectResponse
    {
        $user = $this->registration->register($request->validated());

        Auth::login($user);

        $user->sendEmailVerificationNotification();

        return redirect()->route('verification.notice');
    }
}
