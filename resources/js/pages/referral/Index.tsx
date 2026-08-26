import AppLayout from '@/layouts/AppLayout';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

interface ReferralRow {
    id: number;
    name: string;
    joined_at: string;
    rank?: string;
    status: string;
}

interface TreeNode {
    id: number;
    name: string;
    joined_at: string;
    children: TreeNode[];
}

export default function Referrals() {
    const page = usePage<
        PageProps & {
            referralCode: string;
            referralLink: string;
            directCount: number;
            teamSize: number;
            directReferrals: { data: ReferralRow[]; current_page: number; last_page: number };
            tree: TreeNode[];
        }
    >();
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        await navigator.clipboard.writeText(page.props.referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AppLayout>
            <h1 className="text-xl font-bold text-gray-900">Referrals</h1>

            <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader title="Your referral link" subtitle={`Direct: ${page.props.directCount} · Team: ${page.props.teamSize}`} />
                    <CardBody className="space-y-4">
                        <div className="rounded-lg bg-indigo-50 p-3 text-center ring-1 ring-inset ring-indigo-600/10">
                            <span className="font-mono text-lg font-bold tracking-widest text-indigo-700">{page.props.referralCode}</span>
                        </div>
                        <Button variant="outline" onClick={copy} className="w-full">
                            {copied ? 'Copied!' : 'Copy invite link'}
                        </Button>
                    </CardBody>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader title="Referral tree" subtitle="Three generations deep" />
                    <CardBody className="max-h-80 overflow-auto">
                        {page.props.tree.length === 0 ? (
                            <p className="py-8 text-center text-sm text-gray-500">No referrals yet — share your link to start building your team.</p>
                        ) : (
                            <Tree nodes={page.props.tree} depth={0} />
                        )}
                    </CardBody>
                </Card>
            </div>

            <div className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 px-5 py-4">
                    <h2 className="text-sm font-semibold text-gray-900">Direct referrals</h2>
                </div>
                <Table<ReferralRow>
                    columns={[
                        { header: 'Name', render: (r) => r.name },
                        { header: 'Rank', render: (r) => r.rank ?? '—' },
                        { header: 'Status', render: (r) => <Badge value={r.status} /> },
                        { header: 'Joined', render: (r) => r.joined_at },
                    ]}
                    rows={page.props.directReferrals.data}
                    rowKey={(r) => r.id}
                />
                <Pagination currentPage={page.props.directReferrals.current_page} lastPage={page.props.directReferrals.last_page} />
            </div>
        </AppLayout>
    );
}

function Tree({ nodes, depth }: { nodes: TreeNode[]; depth: number }) {
    if (nodes.length === 0) return null;

    return (
        <ul className={depth === 0 ? '' : 'ml-5 border-l border-gray-100 pl-4'}>
            {nodes.map((node) => (
                <li key={node.id} className="py-1.5">
                    <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                            {node.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-sm font-medium text-gray-800">{node.name}</span>
                        <span className="text-xs text-gray-400">since {node.joined_at}</span>
                    </div>
                    {node.children.length > 0 && <Tree nodes={node.children} depth={depth + 1} />}
                </li>
            ))}
        </ul>
    );
}
