<?php

namespace App\Http\Controllers\Admin;

use App\Enums\FundRequestStatus;
use App\Http\Controllers\Controller;
use App\Models\Fund;
use App\Models\FundRequest;
use App\Services\Fund\FundService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FundController extends Controller
{
    public function __construct(private readonly FundService $funds)
    {
    }

    public function index(Request $request): Response
    {
        $requests = FundRequest::query()
            ->with(['user:id,name,email', 'fund:id,name'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->latest()
            ->paginate(15)
            ->through(fn (FundRequest $fr) => [
                'id' => $fr->id,
                'reference' => $fr->reference,
                'user' => $fr->user?->only(['id', 'name', 'email']),
                'fund' => $fr->fund?->only(['id', 'name']),
                'requested_amount' => $fr->requested_amount,
                'approved_amount' => $fr->approved_amount,
                'purpose' => str($fr->purpose)->limit(80),
                'status' => $fr->status->value,
                'created_at' => $fr->created_at->toIso8601String(),
            ]);

        return Inertia::render('admin/funds/Index', [
            'requests' => $requests,
            'filters' => $request->only('status'),
        ]);
    }

    public function show(FundRequest $request_model): Response
    {
        return Inertia::render('admin/funds/Show', [
            'request' => [
                'id' => $request_model->id,
                'reference' => $request_model->reference,
                'requested_amount' => $request_model->requested_amount,
                'approved_amount' => $request_model->approved_amount,
                'purpose' => $request_model->purpose,
                'status' => $request_model->status->value,
                'decision_note' => $request_model->decision_note,
                'created_at' => $request_model->created_at->toIso8601String(),
                'disbursed_at' => $request_model->disbursed_at?->toIso8601String(),
                'user' => $request_model->user?->only(['id', 'name', 'email']),
                'fund' => $request_model->fund?->only(['id', 'name']),
            ],
        ]);
    }

    public function approve(\Illuminate\Http\Request $http, FundRequest $request_model)
    {
        $data = $http->validate([
            'approved_amount' => ['nullable', 'numeric', 'min:0.01'],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        try {
            $this->funds->approve($request_model, $http->user(), isset($data['approved_amount']) ? (string) $data['approved_amount'] : null, $data['note'] ?? null);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['decision' => $e->getMessage()]);
        }

        return back()->with('success', 'Fund request approved.');
    }

    public function reject(\Illuminate\Http\Request $http, FundRequest $request_model)
    {
        $data = $http->validate(['reason' => ['required', 'string', 'min:5', 'max:500']]);

        try {
            $this->funds->reject($request_model, $http->user(), $data['reason']);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['decision' => $e->getMessage()]);
        }

        return back()->with('success', 'Fund request rejected.');
    }

    public function process(\Illuminate\Http\Request $http, FundRequest $request_model)
    {
        try {
            $this->funds->startProcessing($request_model, $http->user());
        } catch (\RuntimeException $e) {
            return back()->withErrors(['decision' => $e->getMessage()]);
        }

        return back()->with('success', 'Moved to processing.');
    }

    public function complete(\Illuminate\Http\Request $http, FundRequest $request_model)
    {
        try {
            $this->funds->complete($request_model, $http->user());
        } catch (\RuntimeException $e) {
            return back()->withErrors(['decision' => $e->getMessage()]);
        }

        return back()->with('success', 'Fund disbursed to member wallet.');
    }
}
