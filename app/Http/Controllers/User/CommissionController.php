<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class CommissionController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        $totals = Commission::query()
            ->where('user_id', $user->id)
            ->selectRaw("COALESCE(SUM(CASE WHEN status = 'completed' THEN amount END), 0) as total_completed")
            ->selectRaw('COALESCE(SUM(amount), 0) as total_all')
            ->first();

        $byGeneration = Commission::query()
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->groupBy('generation')
            ->selectRaw('generation, COALESCE(SUM(amount),0) as total')
            ->pluck('total', 'generation');

        return Inertia::render('commission/Index', [
            'totals' => [
                'completed' => (string) $totals->total_completed,
                'all_time' => (string) $totals->total_all,
            ],
            'byGeneration' => $byGeneration,
            'commissions' => Commission::query()
                ->where('user_id', $user->id)
                ->with('sourceUser:id,name')
                ->latest()
                ->paginate(15)
                ->through(fn (Commission $c) => [
                    'id' => $c->id,
                    'reference' => $c->reference,
                    'generation' => $c->generation,
                    'rate' => $c->rate,
                    'base_amount' => $c->base_amount,
                    'amount' => $c->amount,
                    'status' => $c->status->value,
                    'from_user' => $c->sourceUser?->only(['name']),
                    'credited_at' => $c->credited_at?->toIso8601String(),
                    'created_at' => $c->created_at->toIso8601String(),
                ]),
        ]);
    }
}
