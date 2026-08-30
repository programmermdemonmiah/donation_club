<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CommissionRule;
use App\Models\Rank;
use App\Models\ReturnRule;
use App\Services\Audit\AuditLogService;
use App\Services\Settings\SettingsService;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function __construct(private readonly SettingsService $settings) {}

    public function edit(): Response
    {
        return Inertia::render('admin/settings/Edit', [
            'settings' => [
                // company branding
                'company_name' => $this->settings->get('company.name', 'Donation Club LTD'),
                'company_registration' => $this->settings->get('company.registration', ''),
                'company_address' => $this->settings->get('company.address', ''),
                'company_phone' => $this->settings->get('company.phone', ''),
                'company_email' => $this->settings->get('company.email', ''),
                'company_logo' => $this->settings->get('company.logo', '/assets/images/logo.jpeg'),
                'company_favicon' => $this->settings->get('company.favicon', '/favicon.ico'),
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
                'return_enabled' => (bool) (ReturnRule::query()->value('enabled')),
                'return_percent' => (string) (ReturnRule::query()->value('return_percent') ?? ''),
                'return_min_direct_referrals' => (int) (ReturnRule::query()->value('minimum_direct_referrals') ?? 2),
                'return_rank_requirement_id' => ReturnRule::query()->value('rank_requirement_id'),
                'return_deposit_requirement' => (string) (ReturnRule::query()->value('deposit_requirement') ?? '0'),
                'return_sequence_requirement' => (int) (ReturnRule::query()->value('sequence_requirement') ?? 0),
                'return_terms_note' => ReturnRule::query()->value('terms_note'),
                // withdrawals
                'withdrawal_enabled' => $this->settings->withdrawalsEnabled(),
                'withdrawal_min_amount' => $this->settings->minWithdrawal(),
                'withdrawal_max_amount' => $this->settings->maxWithdrawal(),
                'withdrawal_fee_percent' => $this->settings->withdrawalFeePercent(),
                // chat
                'chat_widget_code' => $this->settings->get('chat.widget_code', ''),
            ],
            'ranks' => Rank::query()->orderBy('level')->get(['id', 'name', 'level']),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            // company branding
            'company_name' => ['required', 'string', 'max:200'],
            'company_registration' => ['nullable', 'string', 'max:100'],
            'company_address' => ['nullable', 'string', 'max:500'],
            'company_phone' => ['nullable', 'string', 'max:50'],
            'company_email' => ['nullable', 'email', 'max:200'],
            'logo' => ['nullable', 'file', 'max:2048'],
            'favicon' => ['nullable', 'file', 'max:1024'],
            // chat
            'chat_widget_code' => ['nullable', 'string', 'max:5000'],
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

        try {
            DB::transaction(function () use ($validated, $request) {
                $old = [
                    'deposit' => [$this->settings->minDeposit(), $this->settings->maxDeposit(), $this->settings->requiredSequenceGap()],
                ];

                $this->settings->setMany([
                    'company.name' => $validated['company_name'],
                    'company.registration' => $validated['company_registration'] ?? '',
                    'company.address' => $validated['company_address'] ?? '',
                    'company.phone' => $validated['company_phone'] ?? '',
                    'company.email' => $validated['company_email'] ?? '',
                    'chat.widget_code' => $validated['chat_widget_code'] ?? '',
                    'deposit.min_amount' => Money::parse((string) $validated['deposit_min_amount']),
                    'deposit.max_amount' => Money::parse((string) $validated['deposit_max_amount']),
                    'deposit.required_sequence_gap' => (int) $validated['deposit_required_sequence_gap'],
                    'deposit.max_per_account_cycle' => (int) $validated['deposit_max_per_account_cycle'],
                    'commission.enabled' => (bool) ($validated['commission_enabled'] ?? false),
                    'withdrawal.enabled' => (bool) ($validated['withdrawal_enabled'] ?? false),
                    'withdrawal.min_amount' => Money::parse((string) $validated['withdrawal_min_amount']),
                    'withdrawal.max_amount' => Money::parse((string) $validated['withdrawal_max_amount']),
                    'withdrawal.fee_percent' => (string) $validated['withdrawal_fee_percent'],
                ], 'business');

                if ($request->hasFile('logo')) {
                    $file = $request->file('logo');
                    $filename = 'logo_'.time().'.'.$file->getClientOriginalExtension();
                    $file->move(public_path('assets/images'), $filename);

                    $oldLogo = $this->settings->get('company.logo');
                    if ($oldLogo && $oldLogo !== '/assets/images/logo.jpeg') {
                        $oldPath = public_path(ltrim($oldLogo, '/'));
                        if (file_exists($oldPath)) {
                            @unlink($oldPath);
                        }
                    }

                    $this->settings->set('company.logo', '/assets/images/'.$filename, null, 'business');
                }

                if ($request->hasFile('favicon')) {
                    $file = $request->file('favicon');
                    $filename = 'favicon_'.time().'.'.$file->getClientOriginalExtension();
                    $file->move(public_path('assets/images'), $filename);

                    $oldFavicon = $this->settings->get('company.favicon');
                    if ($oldFavicon && $oldFavicon !== '/favicon.ico') {
                        $oldPath = public_path(ltrim($oldFavicon, '/'));
                        if (file_exists($oldPath)) {
                            @unlink($oldPath);
                        }
                    }

                    $this->settings->set('company.favicon', '/assets/images/'.$filename, null, 'business');
                }

                foreach (($validated['commission_rules'] ?? []) as $ruleData) {
                    CommissionRule::whereKey($ruleData['id'])->update([
                        'percentage' => number_format((float) $ruleData['percentage'], 3, '.', ''),
                        'enabled' => (bool) ($ruleData['enabled'] ?? false),
                        'trigger_event' => $ruleData['trigger_event'],
                    ]);
                }

                ReturnRule::query()->updateOrCreate([], [
                    'enabled' => (bool) ($validated['return_enabled'] ?? false),
                    'return_percent' => filled($validated['return_percent'] ?? null) ? number_format((float) $validated['return_percent'], 3, '.', '') : null,
                    'minimum_direct_referrals' => (int) ($validated['return_min_direct_referrals'] ?? 2),
                    'rank_requirement_id' => $validated['return_rank_requirement_id'] ?? null,
                    'deposit_requirement' => (string) ($validated['return_deposit_requirement'] ?? '0'),
                    'sequence_requirement' => (int) ($validated['return_sequence_requirement'] ?? 0),
                    'terms_note' => $validated['return_terms_note'] ?? null,
                ]);

                AuditLogService::log('settings.updated', null, ['old_deposit' => $old], collect($validated)->except(['commission_rules', 'logo', 'favicon'])->all(), $request->user()->id);
            });

            return back()->with('success', 'Settings updated.');
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Settings update failed: ' . $e->getMessage(), [
                'exception' => $e
            ]);
            return back()->withErrors(['logo' => 'Settings update failed: ' . $e->getMessage()]);
        }
    }
}
