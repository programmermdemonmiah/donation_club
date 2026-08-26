<?php

namespace App\Http\Requests\Withdrawal;

use Illuminate\Foundation\Http\FormRequest;

class StoreWithdrawalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $methods = implode(',', array_keys(config('withdrawals.methods', ['bank' => 'Bank Transfer'])));

        return [
            'amount' => ['required', 'numeric', 'min:0.01', 'max:999999', 'regex:/^\d+(\.\d{1,2})?$/'],
            'method' => ['required', 'string', 'in:'.$methods],
            'account_name' => ['required', 'string', 'max:120'],
            'account_details' => ['required', 'string', 'max:255'],
        ];
    }
}
