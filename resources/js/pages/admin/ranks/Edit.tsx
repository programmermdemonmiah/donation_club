import AdminLayout from '@/layouts/AdminLayout';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import type { PageProps } from '@/types';

interface Requirement {
    key: string;
    value: string;
}

interface RankForm {
    id: number;
    name: string;
    level: number;
    color: string;
    description?: string | null;
    active: boolean;
    requirements: Requirement[];
}

export default function AdminRankEdit() {
    const page = usePage<PageProps & { rank: RankForm; requirementKeys: Record<string, string> }>();
    const [requirements, setRequirements] = useState<Requirement[]>(page.props.rank.requirements.length > 0 ? page.props.rank.requirements : []);

    const addRequirement = () => {
        const used = new Set(requirements.map((r) => r.key));
        const nextKey = Object.keys(page.props.requirementKeys).find((k) => !used.has(k));
        if (nextKey) setRequirements([...requirements, { key: nextKey, value: '' }]);
    };

    const updateRequirement = (index: number, patch: Partial<Requirement>) => {
        setRequirements(requirements.map((r, i) => (i === index ? { ...r, ...patch } : r)));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('name', (document.getElementById('rank-name') as HTMLInputElement).value);
        fd.append('color', (document.getElementById('rank-color') as HTMLInputElement).value);
        fd.append('description', (document.getElementById('rank-description') as HTMLTextAreaElement)?.value ?? '');
        fd.append('active', (document.getElementById('rank-active') as HTMLInputElement).checked ? '1' : '0');
        fd.append('_method', 'PUT');

        requirements.forEach((req) => {
            if (req.key && req.value !== '') {
                fd.append('requirements[][key]', req.key);
                fd.append('requirements[][value]', req.value);
            }
        });

        router.post(route('admin.ranks.update', page.props.rank.id), fd, { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <h1 className="text-xl font-bold text-gray-900">Edit rank — {page.props.rank.name}</h1>

            <form onSubmit={submit} className="mt-6 max-w-3xl">
                <Card>
                    <CardHeader title="Basics" />
                    <CardBody className="grid gap-4 sm:grid-cols-2">
                        <Input id="rank-name" label="Name" defaultValue={page.props.rank.name} required />
                        <Input id="rank-color" label="Color" type="color" defaultValue={page.props.rank.color} className="h-10" />
                        <div className="sm:col-span-2">
                            <label htmlFor="rank-description" className="mb-1.5 block text-sm font-medium text-gray-700">Description</label>
                            <textarea
                                id="rank-description"
                                rows={2}
                                defaultValue={page.props.rank.description ?? ''}
                                className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <label className="flex items-center gap-2 text-sm text-gray-700">
                            <input id="rank-active" type="checkbox" defaultChecked={page.props.rank.active} className="h-4 w-4 rounded border-gray-300 text-blue-600" />
                            Rank is active
                        </label>
                    </CardBody>
                </Card>

                <Card className="mt-6">
                    <CardHeader
                        title="Requirements"
                        subtitle="All listed requirements must be met simultaneously to hold this rank"
                        action={
                            <Button type="button" size="sm" variant="secondary" onClick={addRequirement}>
                                + Add requirement
                            </Button>
                        }
                    />
                    <CardBody className="space-y-3">
                        {requirements.length === 0 && (
                            <p className="text-sm italic text-gray-400">No requirements — this is an entry-level rank.</p>
                        )}
                        {requirements.map((req, index) => (
                            <div key={index} className="flex items-end gap-3">
                                <div className="w-56">
                                    <span className="mb-1.5 block text-sm font-medium text-gray-700">Metric</span>
                                    <select
                                        value={req.key}
                                        onChange={(e) => updateRequirement(index, { key: e.target.value })}
                                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        {Object.entries(page.props.requirementKeys).map(([key, label]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-40">
                                    <Input
                                        label="Required value"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={req.value}
                                        onChange={(e) => updateRequirement(index, { value: e.target.value })}
                                    />
                                </div>
                                <button type="button" onClick={() => setRequirements(requirements.filter((_, i) => i !== index))} className="pb-2.5 text-sm font-medium text-rose-600 hover:text-rose-500">
                                    Remove
                                </button>
                            </div>
                        ))}
                    </CardBody>
                </Card>

                <div className="mt-6 flex justify-end">
                    <Button type="submit" loading={false}>Save changes</Button>
                </div>
            </form>
        </AdminLayout>
    );
}
