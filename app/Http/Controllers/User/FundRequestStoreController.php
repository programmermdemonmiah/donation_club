<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\Fund\StoreFundRequestRequest;
use App\Models\Fund;
use App\Services\Fund\FundService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class FundRequestStoreController extends Controller
{
    public function __construct(private readonly FundService $funds)
    {
    }

    public function store(StoreFundRequestRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $proofPath = null;

        if ($request->hasFile('proof')) {
            $proofPath = Storage::disk('private')->putFile('fund-proofs', $request->file('proof'));
        }

        $fund = Fund::findOrFail($data['fund_id']);

        try {
            $this->funds->request(
                $request->user(),
                $fund,
                (string) $data['amount'],
                (string) $data['purpose'],
                $proofPath,
            );
        } catch (\RuntimeException $e) {
            return back()->withErrors(['fund' => $e->getMessage()]);
        }

        return redirect()->route('fund.index')->with('success', 'Support fund request submitted for review.');
    }
}
