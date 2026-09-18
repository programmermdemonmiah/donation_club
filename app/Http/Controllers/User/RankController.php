<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Rank;
use App\Services\Rank\RankService;
use App\Support\Money;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RankController extends Controller
{
    public function __construct(private readonly RankService $ranks) {}

    public function index(): Response
    {
        $user = Auth::user();

        $this->ranks->promoteIfEligible($user);
        $user->unsetRelation('activeRank');

        $metrics = $this->ranks->metrics($user);
        $current = $this->ranks->currentRank($user);

        $baselines = [];
        $ladder = [];

        foreach (Rank::query()->where('active', true)->with('requirements')->orderBy('level')->get() as $rank) {
            $requirements = $rank->requirements->map(function ($requirement) use ($metrics, $baselines) {
                $baseline = $baselines[$requirement->key] ?? '0.00';

                return $this->ranks->presentRequirement($requirement, $metrics, $baseline);
            });

            foreach ($rank->requirements as $requirement) {
                $baselines[$requirement->key] = Money::add(
                    $baselines[$requirement->key] ?? '0.00',
                    (string) $requirement->value,
                );
            }

            $ladder[] = [
                'id' => $rank->id,
                'name' => $rank->name,
                'level' => $rank->level,
                'color' => $rank->color,
                'is_current' => $current?->id === $rank->id,
                'requirements' => $requirements,
            ];
        }

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
