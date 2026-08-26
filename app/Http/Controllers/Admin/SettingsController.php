<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CommissionRule;
use App\Models\Rank;
use App\Services\Audit\AuditLogService;
use App\Services\Settings\SettingsService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function __construct(private readonly SettingsService $settings)
    {
    }

    public function edit(): Response
    {
        return Inertia::render('admin/settings/Edit', [
            'settings' => [
                // deposits
                'deposit_min_amount' => $this->settings->minDeposit(),
                'deposit_max_amount' => $this->settings->maxDeposit(),
                'deposit_required_sequence_gap' => $this->settings->requiredSequenceGap(),
                'deposit_max_per_account_cycle' => (int) ($this->settings->get('deposit.max_per_account_cycle') ?? 1),
                // commissions (master switch + rules table)
                'commission_enabled' => $this->settings->commissionsEnabled(),
                'commission_rules' => CommissionRule::query()->orderBy('generation')->get()->map(fn ($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                    'scope' => $r->scope,
                    'generation' => $r->generation,
                    'percentage' => (string) $r->percentage,
                    'trigger_event' => $r->trigger_event,
                    'enabled' => $r->enabled,
                ]),
                // returns
                'return_enabled' => (bool) (\App\Models\ReturnRule::query()->value('enabled')),
                'return_percent' => (string) (\App\Models\ReturnRule::query()->value('return_percent') ?? ''),
                'return_min_direct_referrals' => (int) (\App\Models\ReturnRule::query()->value('minimum_direct_referrals') ?? 2),
                'return_rank_requirement_id' => \App\Models\ReturnRule::query()->value('rank_requirement_id'),
                'return_deposit_requirement' => (string) (\App\Models\ReturnRule::query()->value('deposit_requirement') ?? '0'),
                'return_sequence_requirement' => (int) (\App\Models\ReturnRule::query()->value('sequence_requirement') ?? 0),
                'return_terms_note' => \App\Models\ReturnRule::query()->value('terms_note'),
                // withdrawals
                'withdrawal_enabled' => $this->settings->withdrawalsEnabled(),
                'withdrawal_min_amount' => $this->settings->minWithdrawal(),
                'withdrawal_max_amount' => $this->settings->maxWithdrawal(),
                'withdrawal_fee_percent' => $this->settings->withdrawalFeePercent(),
            ],
            'ranks' => Rank::query()->orderBy('level')->get(['id', 'name', 'level']),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            // deposits
            'deposit_min_amount' => ['required', 'numeric', 'min:0.01', 'max:100000'],
            'deposit_max_amount' => ['required', 'numeric', 'min:0.01', 'max:100000', 'gte:deposit_min_amount'],
            'deposit_required_sequence_gap' => ['required', 'integer', 'min:0', 'max:10000'],
            'deposit_max_per_account_cycle' => ['required', 'integer', 'min:1', 'max:100'],
            // commissions
            'commission_enabled' => ['boolean'],
            'commission_rules' => ['array'],
            'commission_rules.*.id' => ['required', 'integer', 'exists:commission_rules,id'],
            'commission_rules.*.percentage' => ['required', 'numeric', 'min:0', 'max:100'],
            'commission_rules.*.enabled' => ['boolean'],
            'commission_rules.*.trigger_event' => ['required', 'in:deposit,return_payout'],
            // returns
            'return_enabled' => ['boolean'],
            'return_percent' => ['nullable', 'numeric', 'min:0', 'max:10000'],
            'return_min_direct_referrals' => ['required', 'integer', 'min:0', 'max:1000'],
            'return_rank_requirement_id' => ['nullable', 'integer', 'exists:ranks,id'],
            'return_deposit_requirement' => ['nullable', 'numeric', 'min:0', 'max:1000000000'],
            'return_sequence_requirement' => ['nullable', 'integer', 'min:0', 'max:99999999'],
            'return_terms_note' => ['nullable', 'string', 'max:2000'],
            // withdrawals
            'withdrawal_enabled' => ['boolean'],
            'withdrawal_min_amount' => ['required', 'numeric', 'min:0.01'],
            'withdrawal_max_amount' => ['required', 'numeric', 'gte:withdrawal_min_amount'],
            'withdrawal_fee_percent' => ['required', 'numeric', 'min:0', 'max:50'],
        ]);

        DB::transaction(function () use ($validated, $request) {
            $old = [
                'deposit' => [$this->settings->minDeposit(), $this->settings->maxDeposit(), $this->settings->requiredSequenceGap()],
            ];

            $this->settings->setMany([
                'deposit.min_amount' => \App\Support\Money::parse((string) $validated['deposit_min_amount']),
                'deposit.max_amount' => \App\Support\Money::parse((string) $validated['deposit_max_amount']),
                'deposit.required_sequence_gap' => (int) $validated['deposit_required_sequence_gap'],
                'deposit.max_per_account_cycle' => (int) $validated['deposit_max_per_account_cycle'],
                'commission.enabled' => (bool) ($validated['commission_enabled'] ?? false),
                'withdrawal.enabled' => (bool) ($validated['withdrawal_enabled'] ?? false),
                'withdrawal.min_amount' => \App\Support\Money::parse((string) $validated['withdrawal_min_amount']),
                'withdrawal.max_amount' => \App\Support\Money::parse((string) $validated['withdrawal_max_amount']),
                'withdrawal.fee_percent' => (string) $validated['withdrawal_fee_percent'],
            ], 'business');

            foreach (($validated['commission_rules'] ?? []) as $ruleData) {
                CommissionRule::whereKey($ruleData['id'])->update([
                    'percentage' => number_format((float) $ruleData['percentage'], 3, '.', ''),
                    'enabled' => (bool) ($ruleData['enabled'] ?? false),
                    'trigger_event' => $ruleData['trigger_event'],
                ]);
            }

            \App\Models\ReturnRule::query()->updateOrCreate([], [
                'enabled' => (bool) ($validated['return_enabled'] ?? false),
                'return_percent' => filled($validated['return_percent'] ?? null) ? number_format((float) $validated['return_percent'], 3, '.', '') : null,
                'minimum_direct_referrals' => (int) ($validated['return_min_direct_referrals'] ?? 2),
                'rank_requirement_id' => $validated['return_rank_requirement_id'] ?? null,
                'deposit_requirement' => (string) ($validated['return_deposit_requirement'] ?? '0'),
                'sequence_requirement' => (int) ($validated['return_sequence_requirement'] ?? 0),
                'terms_note' => $validated['return_terms_note'] ?? null,
            ]);

            AuditLogService::log('settings.updated', null, ['old_deposit' => $old], collect($validated)->except('commission_rules')->all(), $request->user()->id);
        });

        return back()->with('success', 'Settings updated.');
    }
}
