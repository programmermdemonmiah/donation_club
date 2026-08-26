<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Rank;
use App\Services\Rank\RankService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RankController extends Controller
{
    public function __construct(private readonly RankService $ranks)
    {
    }

    public function index(): Response
    {
        $user = Auth::user();

        $metrics = $this->ranks->metrics($user);
        $current = $this->ranks->currentRank($user);

        $ladder = Rank::query()
            ->where('active', true)
            ->with('requirements')
            ->orderBy('level')
            ->get()
            ->map(fn (Rank $rank) => [
                'id' => $rank->id,
                'name' => $rank->name,
                'level' => $rank->level,
                'color' => $rank->color,
                'is_current' => $current?->id === $rank->id,
                'requirements' => $rank->requirements->map(fn ($req) => [
                    'key' => $req->key,
                    'label' => $req->keyLabel(),
                    'value' => (string) $req->value,
                    'actual' => (string) match ($req->key) {
                        \App\Models\RankRequirement::DIRECT_REFERRALS => $metrics['direct_referrals'],
                        \App\Models\RankRequirement::TEAM_SIZE => $metrics['team_size'],
                        \App\Models\RankRequirement::TEAM_VOLUME => $metrics['team_volume'],
                        \App\Models\RankRequirement::QUALIFIED_MEMBERS => $metrics['qualified_members'],
                        \App\Models\RankRequirement::MIN_DEPOSIT => $metrics['own_total_deposit'],
                        default => 0,
                    },
                    'met' => bccomp((string) match ($req->key) {
                        \App\Models\RankRequirement::DIRECT_REFERRALS => $metrics['direct_referrals'],
                        \App\Models\RankRequirement::TEAM_SIZE => $metrics['team_size'],
                        \App\Models\RankRequirement::TEAM_VOLUME => $metrics['team_volume'],
                        \App\Models\RankRequirement::QUALIFIED_MEMBERS => $metrics['qualified_members'],
                        \App\Models\RankRequirement::MIN_DEPOSIT => $metrics['own_total_deposit'],
                        default => 0,
                    }, (string) $req->value, 2) >= 0,
                ]),
            ]);

        return Inertia::render('rank/Index', [
            'currentRank' => $current ? ['name' => $current->name, 'color' => $current->color] : null,
            'metrics' => $metrics,
            'ladder' => $ladder,
            'history' => $user->rankHistories()->with(['oldRank:id,name', 'newRank:id,name'])->latest()->limit(20)->get()
                ->map(fn ($h) => [
                    'old' => $h->oldRank?->name,
                    'new' => $h->newRank?->name,
                    'reason' => $h->reason,
                    'at' => $h->created_at->toIso8601String(),
                ]),
        ]);
    }
}
