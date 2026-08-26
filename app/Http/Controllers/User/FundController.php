<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Fund;
use App\Models\FundRequest;
use App\Services\Rank\RankService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class FundController extends Controller
{
    public function __construct(private readonly RankService $ranks)
    {
    }

    public function index(): Response
    {
        $user = Auth::user();
        $rank = $this->ranks->currentRank($user);

        return Inertia::render('fund/Index', [
            'currentRank' => $rank?->only(['name', 'level']),
            'funds' => Fund::query()->where('enabled', true)->with('minimumRank:id,name,level')->get()
                ->map(fn (Fund $fund) => [
                    'id' => $fund->id,
                    'name' => $fund->name,
                    'description' => $fund->description,
                    'min_amount' => $fund->min_amount,
                    'max_amount' => $fund->max_amount,
                    'requires_proof' => $fund->requires_proof,
                    'minimum_rank' => $fund->minimumRank?->only(['name', 'level']),
                    'eligible' => ! $fund->minimum_rank_id || ($rank && $rank->level >= $fund->minimumRank->level),
                ]),
            'requests' => $user->fundRequests()->with('fund:id,name')->latest()->paginate(10)->through(fn (FundRequest $fr) => [
                'id' => $fr->id,
                'reference' => $fr->reference,
                'fund' => $fr->fund?->name,
                'requested_amount' => $fr->requested_amount,
                'approved_amount' => $fr->approved_amount,
                'status' => $fr->status->value,
                'decision_note' => $fr->decision_note,
                'created_at' => $fr->created_at->toIso8601String(),
            ]),
        ]);
    }
}
