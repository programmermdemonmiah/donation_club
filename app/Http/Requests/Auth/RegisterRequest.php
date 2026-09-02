<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'username' => ['required', 'string', 'max:100', 'unique:users,username', 'alpha_dash'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:190', 'unique:users,email'],
            'password' => ['required', 'string', 'confirmed', Password::defaults()],
            'referral_code' => ['required', 'string', 'max:16'],
        ];
    }
}
