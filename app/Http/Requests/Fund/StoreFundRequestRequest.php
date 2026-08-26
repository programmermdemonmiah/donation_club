<?php

namespace App\Http\Requests\Fund;

use Illuminate\Foundation\Http\FormRequest;

class StoreFundRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'fund_id' => ['required', 'integer', 'exists:funds,id'],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:999999', 'regex:/^\d+(\.\d{1,2})?$/'],
            'purpose' => ['required', 'string', 'min:20', 'max:500'],
            'proof' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }
}
