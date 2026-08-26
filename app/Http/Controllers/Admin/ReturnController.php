<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ReturnStatus;
use App\Http\Controllers\Controller;
use App\Models\MemberReturn;
use App\Services\Audit\AuditLogService;
use App\Services\Return\ReturnService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReturnController extends Controller
{
    public function __construct(private readonly ReturnService $returns)
    {
    }

    public function index(Request $request): Response
    {
        $returns = MemberReturn::query()
            ->with(['user:id,name,email', 'deposit:id,reference'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->latest()
            ->paginate(15)
            ->through(fn (MemberReturn $r) => [
                'id' => $r->id,
                'reference' => $r->reference,
                'user' => $r->user?->only(['id', 'name', 'email']),
                'deposit_reference' => $r->deposit?->reference,
                'base_amount' => $r->base_amount,
                'rate' => $r->rate,
                'payout_amount' => $r->payout_amount,
                'status' => $r->status->value,
                'created_at' => $r->created_at->toIso8601String(),
            ]);

        return Inertia::render('admin/returns/Index', [
            'returns' => $returns,
            'filters' => $request->only('status'),
            'moduleEnabled' => (bool) \App\Models\ReturnRule::query()->value('enabled'),
        ]);
    }

    public function show(MemberReturn $return): Response
    {
        $return->load(['user', 'deposit']);

        return Inertia::render('admin/returns/Show', [
            'return' => [
                'id' => $return->id,
                'reference' => $return->reference,
                'base_amount' => $return->base_amount,
                'rate' => $return->rate,
                'payout_amount' => $return->payout_amount,
                'status' => $return->status->value,
                'note' => $return->note,
                'approved_at' => $return->approved_at?->toIso8601String(),
                'completed_at' => $return->completed_at?->toIso8601String(),
                'user' => $return->user?->only(['id', 'name', 'email']),
                'deposit' => $return->deposit?->only(['id', 'reference', 'amount', 'completed_at']),
            ],
        ]);
    }

    public function approve(Request $request, MemberReturn $return)
    {
        $data = $request->validate(['note' => ['nullable', 'string', 'max:500']]);

        try {
            $this->returns->approve($return, $request->user(), $data['note'] ?? null);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['decision' => $e->getMessage()]);
        }

        return back()->with('success', 'Return approved.');
    }

    public function process(Request $request, MemberReturn $return)
    {
        try {
            $this->returns->startProcessing($return, $request->user());
        } catch (\RuntimeException $e) {
            return back()->withErrors(['decision' => $e->getMessage()]);
        }

        return back()->with('success', 'Return moved to processing.');
    }

    public function complete(Request $request, MemberReturn $return)
    {
        try {
            $this->returns->complete($return, $request->user());
        } catch (\RuntimeException $e) {
            return back()->withErrors(['decision' => $e->getMessage()]);
        }

        return back()->with('success', 'Return completed and payout credited.');
    }

    public function cancel(Request $request, MemberReturn $return)
    {
        $data = $request->validate(['reason' => ['required', 'string', 'min:5', 'max:500']]);

        try {
            $this->returns->cancel($return, $request->user(), $data['reason']);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['decision' => $e->getMessage()]);
        }

        return back()->with('success', 'Return cancelled.');
    }

    public function reverse(Request $request, MemberReturn $return)
    {
        $data = $request->validate(['reason' => ['required', 'string', 'min:5', 'max:500']]);

        try {
            $this->returns->reverse($return, $request->user(), $data['reason']);
        } catch (\RuntimeException $e) {
            return back()->withErrors(['decision' => $e->getMessage()]);
        }

        return back()->with('success', 'Return reversed; wallet debited and commissions reversed.');
    }
}
