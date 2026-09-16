<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\User;
use App\Services\Auth\RegistrationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function __construct(private readonly RegistrationService $registration) {}

    public function usernameAvailability(Request $request): JsonResponse
    {
        $username = trim((string) $request->query('username', ''));

        $validator = Validator::make(
            ['username' => $username],
            ['username' => ['required', 'string', 'max:100', 'alpha_dash']],
        );

        if ($validator->fails()) {
            return response()->json(['status' => 'invalid']);
        }

        $taken = User::query()
            ->whereRaw('LOWER(username) = ?', [mb_strtolower($username)])
            ->exists();

        return response()->json([
            'status' => $taken ? 'taken' : 'available',
        ]);
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

        return redirect()->route('dashboard');
    }
}
