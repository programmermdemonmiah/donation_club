<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRankStatus;
use App\Enums\WalletDirection;
use App\Enums\WalletTransactionStatus;
use App\Enums\WalletTransactionType;
use App\Http\Controllers\Controller;
use App\Models\Rank;
use App\Models\RankHistory;
use App\Models\RankRequirement;
use App\Models\UserRank;
use App\Models\WalletTransaction;
use App\Services\Audit\AuditLogService;
use App\Services\Rank\RankService;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RankController extends Controller
{
    public function __construct(private readonly RankService $ranks) {}

    public function index(): Response
    {
        try {
            $this->ranks->evaluateAll();
        } catch (\Throwable $e) {
            report($e);
        }

        $ranks = Rank::query()->withCount('requirements')->orderBy('level')->get();

        $holdersByRank = UserRank::query()
            ->toBase()
            ->where('status', UserRankStatus::Active->value)
            ->selectRaw('rank_id, COUNT(*) as aggregate')
            ->groupBy('rank_id')
            ->pluck('aggregate', 'rank_id');

        $achieversByRank = RankHistory::query()
            ->toBase()
            ->whereNotNull('new_rank_id')
            ->selectRaw('new_rank_id, COUNT(DISTINCT user_id) as aggregate')
            ->groupBy('new_rank_id')
            ->pluck('aggregate', 'new_rank_id');

        $incentivePaidByRank = WalletTransaction::query()
            ->toBase()
            ->where('type', WalletTransactionType::RankIncentive->value)
            ->where('direction', WalletDirection::Credit->value)
            ->where('status', WalletTransactionStatus::Completed->value)
            ->where('reference_type', (new Rank)->getMorphClass())
            ->selectRaw('reference_id, COALESCE(SUM(amount), 0) as aggregate')
            ->groupBy('reference_id')
            ->pluck('aggregate', 'reference_id');

        return Inertia::render('admin/ranks/Index', [
            'ranks' => $ranks->map(fn (Rank $rank) => [
                'id' => $rank->id,
                'name' => $rank->name,
                'slug' => $rank->slug,
                'level' => $rank->level,
                'color' => $rank->color,
                'active' => $rank->active,
                'incentive_amount' => (string) $rank->incentive_amount,
                'monthly_salary' => (string) $rank->monthly_salary,
                'requirements_count' => $rank->requirements_count,
                'holders' => (int) ($holdersByRank[$rank->id] ?? 0),
                'lifetime_achievers' => (int) ($achieversByRank[$rank->id] ?? 0),
                'incentive_paid' => Money::parse($incentivePaidByRank[$rank->id] ?? '0'),
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
                'incentive_amount' => (string) $rank->incentive_amount,
                'monthly_salary' => (string) $rank->monthly_salary,
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
            'incentive_amount' => ['required', 'numeric', 'min:0', 'max:9999999999'],
            'monthly_salary' => ['required', 'numeric', 'min:0', 'max:9999999999'],
            'description' => ['nullable', 'string', 'max:1000'],
            'requirements' => ['array'],
            'requirements.*.key' => ['required', 'string', 'in:'.implode(',', RankRequirement::KEYS)],
            'requirements.*.value' => ['required', 'numeric', 'min:0', 'max:9999999999'],
        ]);

        DB::transaction(function () use ($rank, $data) {
            $old = $rank->only(['name', 'color', 'active', 'description', 'incentive_amount', 'monthly_salary']);

            $rank->update([
                'name' => $data['name'],
                'color' => $data['color'],
                'active' => (bool) ($data['active'] ?? true),
                'incentive_amount' => number_format((float) $data['incentive_amount'], 2, '.', ''),
                'monthly_salary' => number_format((float) $data['monthly_salary'], 2, '.', ''),
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
