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
    company_logo: string;
    company_favicon: string;
    deposit_min_amount: string;
    deposit_max_amount: string;
    deposit_required_sequence_gap: number;
    deposit_max_per_account_cycle: number;
    commission_enabled: boolean;
    deposit_commission_rules: CommissionRule[];
    return_commission_rules: CommissionRule[];
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

function CommissionTable({
    rules,
    prefix,
    onUpdate,
    accentColor,
}: {
    rules: CommissionRule[];
    prefix: string;
    onUpdate: (id: number, patch: Partial<CommissionRule>) => void;
    accentColor: 'blue' | 'emerald';
}) {
    const accent = accentColor === 'emerald'
        ? 'text-emerald-700 bg-emerald-50'
        : 'text-blue-700 bg-blue-50';

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead>
                    <tr className="bg-gray-50 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                        <th className="px-4 py-3">Generation</th>
                        <th className="px-4 py-3">Percentage (%)</th>
                        <th className="px-4 py-3 text-center">Enabled</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {rules.map((rule) => (
                        <tr key={rule.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-4 py-3 font-semibold text-gray-800">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${accent}`}>
                                    Gen {rule.generation}
                                </span>
                                <span className="ml-2 text-xs text-gray-400">{rule.name}</span>
                            </td>
                            <td className="px-4 py-3">
                                <div className="relative w-28">
                                    <input
                                        type="number"
                                        step="0.001"
                                        min="0"
                                        max="100"
                                        value={rule.percentage}
                                        onChange={(e) => onUpdate(rule.id, { percentage: e.target.value })}
                                        className="w-full rounded-lg border border-gray-200 px-3 py-1.5 pr-8 text-sm font-semibold text-gray-800 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400/20"
                                    />
                                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">%</span>
                                </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        checked={rule.enabled}
                                        onChange={(e) => onUpdate(rule.id, { enabled: e.target.checked })}
                                        className="sr-only peer"
                                    />
                                    <div className="h-5 w-9 rounded-full bg-gray-200 transition peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition-all after:content-[''] peer-checked:after:translate-x-4"></div>
                                </label>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default function AdminSettings() {
    const page = usePage<PageProps & { settings: Settings; ranks: Array<{ id: number; name: string; level: number }> }>();
    const errors = (page.props.errors || {}) as Record<string, string>;
    const [depositRules, setDepositRules] = useState<CommissionRule[]>(page.props.settings.deposit_commission_rules ?? []);
    const [returnRules, setReturnRules] = useState<CommissionRule[]>(page.props.settings.return_commission_rules ?? []);
    const s = page.props.settings;

    const updateDepositRule = (id: number, patch: Partial<CommissionRule>) => {
        setDepositRules(depositRules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    };

    const updateReturnRule = (id: number, patch: Partial<CommissionRule>) => {
        setReturnRules(returnRules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    };

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        fd.append('_method', 'PUT');

        depositRules.forEach((rule, index) => {
            fd.append(`deposit_commission_rules[${index}][id]`, String(rule.id));
            fd.append(`deposit_commission_rules[${index}][percentage]`, rule.percentage);
            fd.append(`deposit_commission_rules[${index}][enabled]`, rule.enabled ? '1' : '0');
        });

        returnRules.forEach((rule, index) => {
            fd.append(`return_commission_rules[${index}][id]`, String(rule.id));
            fd.append(`return_commission_rules[${index}][percentage]`, rule.percentage);
            fd.append(`return_commission_rules[${index}][enabled]`, rule.enabled ? '1' : '0');
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

                        <div className="sm:col-span-2 border-t border-gray-100 pt-4 mt-2">
                            <label className="block text-sm font-semibold text-gray-700">Company Logo</label>
                            <div className="mt-2 flex items-center gap-4">
                                {s.company_logo && (
                                    <div className="h-16 w-16 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center shadow-sm">
                                        <img src={s.company_logo} alt="Current Logo" className="h-full w-full object-cover" />
                                    </div>
                                )}
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        name="logo"
                                        accept="image/*"
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                    />
                                    <p className="mt-1 text-xs text-gray-400 font-medium">Supported formats: JPEG, PNG, JPG, WebP, SVG. Max 2MB.</p>
                                    {errors.logo && (
                                        <p className="mt-1 text-xs font-semibold text-red-600">{errors.logo}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="sm:col-span-2 border-t border-gray-100 pt-4">
                            <label className="block text-sm font-semibold text-gray-700">Favicon</label>
                            <div className="mt-2 flex items-center gap-4">
                                {s.company_favicon && (
                                    <div className="h-10 w-10 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shadow-sm">
                                        {s.company_favicon.endsWith('.ico') ? (
                                            <span className="text-[10px] font-black text-gray-400 uppercase">ICO</span>
                                        ) : (
                                            <img src={s.company_favicon} alt="Current Favicon" className="h-full w-full object-contain p-1" />
                                        )}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        name="favicon"
                                        accept=".ico,image/png,image/x-icon,image/jpeg"
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                                    />
                                    <p className="mt-1 text-xs text-gray-400 font-medium">Supported formats: ICO, PNG, JPG. Max 1MB.</p>
                                    {errors.favicon && (
                                        <p className="mt-1 text-xs font-semibold text-red-600">{errors.favicon}</p>
                                    )}
                                </div>
                            </div>
                        </div>
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
                    <CardHeader title="Generation Commission" subtitle="Commission distributed to all upline generations when a member donates or receives a return" />
                    <CardBody className="space-y-6">
                        <label className="flex items-center gap-3 rounded-lg bg-blue-50/60 p-3 ring-1 ring-inset ring-blue-600/10">
                            <input type="checkbox" name="commission_enabled" value="1" defaultChecked={s.commission_enabled} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                            <span className="text-sm font-medium text-gray-800">Donation sharing enabled</span>
                        </label>

                        {/* Deposit Commission Table */}
                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white">1</span>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">On Donation (Deposit)</p>
                                    <p className="text-xs text-gray-500">When a member donates, their entire upline (Gen 1–10) receives commission immediately.</p>
                                </div>
                            </div>
                            <CommissionTable
                                rules={depositRules}
                                prefix="deposit"
                                onUpdate={updateDepositRule}
                                accentColor="blue"
                            />
                        </div>

                        {/* Return Commission Table */}
                        <div>
                            <div className="mb-3 flex items-center gap-2">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white">2</span>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">On Double Return (Return Payout)</p>
                                    <p className="text-xs text-gray-500">When a member receives their double return payout, their upline (Gen 1–10) also receives commission.</p>
                                </div>
                            </div>
                            <CommissionTable
                                rules={returnRules}
                                prefix="return"
                                onUpdate={updateReturnRule}
                                accentColor="emerald"
                            />
                        </div>
                    </CardBody>
                </Card>

                <Card>
                    <CardHeader title="Community support rules" subtitle="No fixed dates are promised to members; payouts require explicit admin approval" />
                    <CardBody className="space-y-4">
                        <label className="flex items-center gap-3 rounded-lg bg-blue-50/70 p-3 ring-1 ring-inset ring-blue-600/20">
                            <input type="checkbox" name="return_enabled" value="1" defaultChecked={s.return_enabled} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">Community support module enabled (legal review required before enabling)</span>
                        </label>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                            <Input label="Support (% of donation)" name="return_percent" type="number" step="0.001" min="0" defaultValue={s.return_percent} />
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
