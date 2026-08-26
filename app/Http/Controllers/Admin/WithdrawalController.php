<?php

namespace App\Http\Controllers\Admin;

use App\Enums\WithdrawalStatus;
use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use App\Services\Audit\AuditLogService;
use App\Services\Withdrawal\WithdrawalService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WithdrawalController extends Controller
{
    public function __construct(private readonly WithdrawalService $withdrawals)
    {
    }

    public function index(Request $request): Response
    {
        $withdrawals = Withdrawal::query()
            ->with('user:id,name,email')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->latest()
            ->paginate(15)
            ->through(fn (Withdrawal $w) => [
                'id' => $w->id,
                'reference' => $w->reference,
                'user' => $w->user?->only(['id', 'name', 'email']),
                'amount' => $w->amount,
                'fee' => $w->fee,
                'net_amount' => $w->net_amount,
                'method' => $w->method,
                'status' => $w->status->value,
                'created_at' => $w->created_at->toIso8601String(),
            ]);

        return Inertia::render('admin/withdrawals/Index', [
            'withdrawals' => $withdrawals,
            'filters' => $request->only('status'),
        ]);
    }

    public function show(Withdrawal $withdrawal): Response
    {
        $withdrawal->load('user');

        return Inertia::render('admin/withdrawals/Show', [
            'withdrawal' => [
                'id' => $withdrawal->id,
                'reference' => $withdrawal->reference,
                'amount' => $withdrawal->amount,
                'fee' => $withdrawal->fee,
                'net_amount' => $withdrawal->net_amount,
                'method' => $withdrawal->method,
                // account info shown to admin only, on demand — never to the public.
                'account_information' => $withdrawal->account_information,
                'status' => $withdrawal->status->value,
                'admin_note' => $withdrawal->admin_note,
                'requested_at' => $withdrawal->requested_at?->toIso8601String(),
                'completed_at' => $withdrawal->completed_at?->toIso8601String(),
                'user' => $withdrawal->user?->only(['id', 'name', 'email']),
            ],
        ]);
    }

    public function approve(Request $request, Withdrawal $withdrawal)
    {
        return $this->act(fn () => $this->withdrawals->approve($withdrawal, $request->user()), 'Withdrawal approved.');
    }

    public function process(Request $request, Withdrawal $withdrawal)
    {
        return $this->act(fn () => $this->withdrawals->startProcessing($withdrawal, $request->user()), 'Withdrawal moved to processing.');
    }

    public function complete(Request $request, Withdrawal $withdrawal)
    {
        return $this->act(fn () => $this->withdrawals->complete($withdrawal, $request->user()), 'Withdrawal completed; wallet debited.');
    }

    public function reject(Request $request, Withdrawal $withdrawal)
    {
        $data = $request->validate(['reason' => ['required', 'string', 'min:5', 'max:500']]);

        return $this->act(fn () => $this->withdrawals->reject($withdrawal, $request->user(), $data['reason']), 'Withdrawal rejected; funds released back to member.');
    }

    public function fail(Request $request, Withdrawal $withdrawal)
    {
        $data = $request->validate(['reason' => ['required', 'string', 'min:5', 'max:500']]);

        return $this->act(fn () => $this->withdrawals->fail($withdrawal, $request->user(), $data['reason']), 'Withdrawal marked failed; funds released back to member.');
    }

    private function act(callable $fn, string $message)
    {
        try {
            $fn();
        } catch (\RuntimeException $e) {
            return back()->withErrors(['decision' => $e->getMessage()]);
        }

        return back()->with('success', $message);
    }
}
