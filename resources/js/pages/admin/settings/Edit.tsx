import AdminLayout from '@/layouts/AdminLayout';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps } from '@/types';

interface CommissionRule {
    id: number;
    name: string;
    scope: string;
    generation: number;
    percentage: string;
    trigger_event: string;
    enabled: boolean;
}

interface Settings {
    company_name: string;
    company_registration: string;
    company_address: string;
    company_phone: string;
    company_email: string;
    deposit_min_amount: string;
    deposit_max_amount: string;
    deposit_required_sequence_gap: number;
    deposit_max_per_account_cycle: number;
    commission_enabled: boolean;
    commission_rules: CommissionRule[];
    return_enabled: boolean;
    return_percent: string;
    return_min_direct_referrals: number;
    return_rank_requirement_id?: number | null;
    return_deposit_requirement: string;
    return_sequence_requirement: number;
    return_terms_note?: string | null;
    withdrawal_enabled: boolean;
    withdrawal_min_amount: string;
    withdrawal_max_amount: string;
    withdrawal_fee_percent: string;
    chat_widget_code: string;
}

export default function AdminSettings() {
    const page = usePage<PageProps & { settings: Settings; ranks: Array<{ id: number; name: string; level: number }> }>();
    const [rules, setRules] = useState<CommissionRule[]>(page.props.settings.commission_rules);
    const s = page.props.settings;

    const updateRule = (id: number, patch: Partial<CommissionRule>) => {
        setRules(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    };

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        fd.append('_method', 'PUT');
        rules.forEach((rule, index) => {
            fd.append(`commission_rules[${index}][id]`, String(rule.id));
            fd.append(`commission_rules[${index}][percentage]`, rule.percentage);
            fd.append(`commission_rules[${index}][enabled]`, rule.enabled ? '1' : '0');
            fd.append(`commission_rules[${index}][trigger_event]`, rule.trigger_event);
        });
        router.post(route('admin.settings.update'), fd, { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <h1 className="text-xl font-bold text-gray-900">Business Settings</h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                All financial rules live here — nothing is hard-coded. Return and multi-level payout modules must remain disabled until
                the business model is confirmed legal in your operating jurisdiction.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <Card>
                    <CardHeader title="Company Branding" subtitle="This information is displayed on About, Contact, Terms pages and footer" />
                    <CardBody className="grid gap-4 sm:grid-cols-2">
                        <Input label="Company Name" name="company_name" defaultValue={s.company_name} required />
                        <Input label="Registration Number" name="company_registration" defaultValue={s.company_registration} />
                        <Input label="Address" name="company_address" defaultValue={s.company_address} className="sm:col-span-2" />
                        <Input label="Phone" name="company_phone" defaultValue={s.company_phone} />
                        <Input label="Support Email" name="company_email" type="email" defaultValue={s.company_email} />
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader title="Deposit rules" subtitle="Per-deposit limits and sequence-based eligibility" />
                    <CardBody className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Input label="Minimum deposit ($)" name="deposit_min_amount" type="number" step="0.01" min="0.01" defaultValue={s.deposit_min_amount} required />
                        <Input label="Maximum deposit ($)" name="deposit_max_amount" type="number" step="0.01" min="0.01" defaultValue={s.deposit_max_amount} required />
                        <Input label="Required sequence gap" name="deposit_required_sequence_gap" type="number" min="0" defaultValue={String(s.deposit_required_sequence_gap)} required />
                        <Input label="Deposits per account cycle" name="deposit_max_per_account_cycle" type="number" min="1" defaultValue={String(s.deposit_max_per_account_cycle)} required />
                        <p className="text-xs leading-relaxed text-gray-400 sm:col-span-2 lg:col-span-4">
                            After an account completes its per-cycle limit, it becomes eligible again only once this many additional
                            club-wide deposits (sequence positions) have passed.
                        </p>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader title="Referral commissions" subtitle="Master switch + per-generation percentages" />
                    <CardBody className="space-y-4">
                        <label className="flex items-center gap-3 rounded-lg bg-indigo-50/60 p-3 ring-1 ring-inset ring-indigo-600/10">
                            <input type="checkbox" name="commission_enabled" value="1" defaultChecked={s.commission_enabled} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
                            <span className="text-sm font-medium text-gray-800">Commissions module enabled</span>
                        </label>

                        <div className="overflow-x-auto rounded-lg border border-gray-100">
                            <table className="min-w-full divide-y divide-gray-100 text-sm">
                                <thead>
                                    <tr className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                                        <th className="px-3 py-2">Level</th>
                                        <th className="px-3 py-2">Percentage (%)</th>
                                        <th className="px-3 py-2">Trigger event</th>
                                        <th className="px-3 py-2">Enabled</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {rules.map((rule) => (
                                        <tr key={rule.id}>
                                            <td className="px-3 py-2 font-medium capitalize text-gray-800">
                                                {rule.scope === 'direct' ? 'Direct referral' : `Generation ${rule.generation}`}
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="number"
                                                    step="0.001"
                                                    min="0"
                                                    max="100"
                                                    value={rule.percentage}
                                                    onChange={(e) => updateRule(rule.id, { percentage: e.target.value })}
                                                    className="w-24 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                />
                                            </td>
                                            <td className="px-3 py-2">
                                                <select
                                                    value={rule.trigger_event}
                                                    onChange={(e) => updateRule(rule.id, { trigger_event: e.target.value })}
                                                    className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm capitalize focus:border-indigo-500 focus:ring-indigo-500"
                                                >
                                                    <option value="deposit">On member deposit</option>
                                                    <option value="return_payout">On member return</option>
                                                </select>
                                            </td>
                                            <td className="px-3 py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={rule.enabled}
                                                    onChange={(e) => updateRule(rule.id, { enabled: e.target.checked })}
                                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader title="Return / reward rules" subtitle="No fixed dates are promised to members; payouts require explicit admin approval" />
                    <CardBody className="space-y-4">
                        <label className="flex items-center gap-3 rounded-lg bg-amber-50/70 p-3 ring-1 ring-inset ring-amber-600/20">
                            <input type="checkbox" name="return_enabled" value="1" defaultChecked={s.return_enabled} className="h-4 w-4 rounded border-gray-300 text-amber-600" />
                            <span className="text-sm font-medium text-amber-900">Returns module enabled (legal review required before enabling)</span>
                        </label>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            <Input label="Return (% of deposit)" name="return_percent" type="number" step="0.001" min="0" defaultValue={s.return_percent} />
                            <Input label="Min direct referrals" name="return_min_direct_referrals" type="number" min="0" defaultValue={String(s.return_min_direct_referrals)} />
                            <Select label="Rank requirement" name="return_rank_requirement_id" defaultValue={s.return_rank_requirement_id ?? ''}>
                                <option value="">None</option>
                                {page.props.ranks.map((rank) => (
                                    <option key={rank.id} value={rank.id}>{rank.name}</option>
                                ))}
                            </Select>
                            <Input label="Total deposit requirement ($)" name="return_deposit_requirement" type="number" step="0.01" min="0" defaultValue={s.return_deposit_requirement} />
                            <Input label="Sequence requirement (#)" name="return_sequence_requirement" type="number" min="0" defaultValue={String(s.return_sequence_requirement)} />
                        </div>
                        <Textarea label="Public terms note (shown on member returns page)" name="return_terms_note" rows={2} defaultValue={s.return_terms_note ?? ''} />
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader title="Withdrawal rules" />
                    <CardBody className="space-y-4">
                        <label className="flex items-center gap-3 rounded-lg bg-emerald-50/60 p-3 ring-1 ring-inset ring-emerald-600/10">
                            <input type="checkbox" name="withdrawal_enabled" value="1" defaultChecked={s.withdrawal_enabled} className="h-4 w-4 rounded border-gray-300 text-emerald-600" />
                            <span className="text-sm font-medium text-gray-800">Withdrawals enabled</span>
                        </label>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <Input label="Minimum withdrawal ($)" name="withdrawal_min_amount" type="number" step="0.01" min="0.01" defaultValue={s.withdrawal_min_amount} required />
                            <Input label="Maximum withdrawal ($)" name="withdrawal_max_amount" type="number" step="0.01" min="0.01" defaultValue={s.withdrawal_max_amount} required />
                            <Input label="Fee (%)" name="withdrawal_fee_percent" type="number" step="0.01" min="0" max="50" defaultValue={s.withdrawal_fee_percent} required />
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader title="Live Chat Widget" subtitle="Paste your live chat embed code (e.g. Tawk.to, Crisp). Leave empty to disable." />
                    <CardBody>
                        <Textarea label="Chat Widget Code (HTML/JS)" name="chat_widget_code" rows={4} defaultValue={s.chat_widget_code} />
                    </CardBody>
                </Card>

                <div className="flex justify-end pb-6">
                    <Button type="submit">Save all settings</Button>
                </div>
            </form>
        </AdminLayout>
    );
}
