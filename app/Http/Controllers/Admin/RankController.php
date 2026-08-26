<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Rank;
use App\Services\Audit\AuditLogService;
use App\Services\Rank\RankService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RankController extends Controller
{
    public function __construct(private readonly RankService $ranks)
    {
    }

    public function index(): Response
    {
        return Inertia::render('admin/ranks/Index', [
            'ranks' => Rank::query()->withCount('requirements')->orderBy('level')->get()
                ->map(fn (Rank $rank) => [
                    'id' => $rank->id,
                    'name' => $rank->name,
                    'slug' => $rank->slug,
                    'level' => $rank->level,
                    'color' => $rank->color,
                    'active' => $rank->active,
                    'requirements_count' => $rank->requirements_count,
                    'holders' => DB::table('user_ranks')->where('rank_id', $rank->id)->where('status', 'active')->count(),
                ]),
            'requirementKeys' => RankService::requirementKeyLabels(),
        ]);
    }

    public function edit(Rank $rank): Response
    {
        return Inertia::render('admin/ranks/Edit', [
            'rank' => [
                'id' => $rank->id,
                'name' => $rank->name,
                'level' => $rank->level,
                'color' => $rank->color,
                'description' => $rank->description,
                'active' => $rank->active,
                'requirements' => $rank->requirements()->get()->map(fn ($req) => [
                    'key' => $req->key,
                    'value' => (string) $req->value,
                ]),
            ],
            'requirementKeys' => RankService::requirementKeyLabels(),
        ]);
    }

    public function update(Request $request, Rank $rank)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:60'],
            'color' => ['required', 'string', 'max:20'],
            'active' => ['boolean'],
            'description' => ['nullable', 'string', 'max:1000'],
            'requirements' => ['array'],
            'requirements.*.key' => ['required', 'string', 'in:'.implode(',', \App\Models\RankRequirement::KEYS)],
            'requirements.*.value' => ['required', 'numeric', 'min:0', 'max:9999999999'],
        ]);

        DB::transaction(function () use ($rank, $data, $request) {
            $old = $rank->only(['name', 'color', 'active', 'description']);

            $rank->update([
                'name' => $data['name'],
                'color' => $data['color'],
                'active' => (bool) ($data['active'] ?? true),
                'description' => $data['description'] ?? null,
            ]);

            // Replace requirement set atomically.
            $rank->requirements()->delete();

            foreach (($data['requirements'] ?? []) as $requirement) {
                if ((float) $requirement['value'] > 0) {
                    $rank->requirements()->create([
                        'key' => $requirement['key'],
                        'value' => (string) $requirement['value'],
                    ]);
                }
            }

            AuditLogService::logChanges('rank.updated', $rank, $old, collect($rank->only(['name', 'color', 'active']))->all());
        });

        return redirect()->route('admin.ranks.index')->with('success', "Rank {$rank->name} updated.");
    }
}
