<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CommissionController extends Controller
{
    public function index(Request $request): Response
    {
        $commissions = Commission::query()
            ->with(['user:id,name,email', 'sourceUser:id,name,email'])
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->when($request->filled('generation'), fn ($q) => $q->where('generation', $request->input('generation')))
            ->latest()
            ->paginate(20)
            ->through(fn (Commission $c) => [
                'id' => $c->id,
                'reference' => $c->reference,
                'user' => $c->user?->only(['id', 'name', 'email']),
                'from_user' => $c->sourceUser?->only(['id', 'name', 'email']),
                'generation' => $c->generation,
                'rate' => $c->rate,
                'base_amount' => $c->base_amount,
                'amount' => $c->amount,
                'status' => $c->status->value,
                'credited_at' => $c->credited_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/commissions/Index', [
            'commissions' => $commissions,
            'filters' => $request->only(['status', 'generation']),
        ]);
    }
}
