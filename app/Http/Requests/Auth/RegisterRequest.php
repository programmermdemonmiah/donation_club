<?php

namespace App\Http\Requests\Auth;

use App\Models\Pin;
use App\Models\User;
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
            'username' => ['required', 'string', 'max:100', 'alpha_dash', function (string $attribute, mixed $value, \Closure $fail): void {
                $exists = User::query()
                    ->whereRaw('LOWER(username) = ?', [mb_strtolower(trim((string) $value))])
                    ->exists();

                if ($exists) {
                    $fail('The username has already been taken.');
                }
            }],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:190', 'unique:users,email'],
            'password' => ['required', 'string', 'confirmed', Password::defaults()],
            'referral_code' => ['required', 'string', 'max:16'],
            'secret_code' => ['required', 'string', 'size:6', function ($attribute, $value, $fail) {
                $pin = Pin::where('pin_code', strtoupper($value))->first();
                if (! $pin || $pin->is_used) {
                    $fail('The secret code is invalid.');
                }
            }],
        ];
    }
}
