import AppLayout from '@/layouts/AppLayout';
import Card, { CardBody, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Input';
import { useForm, usePage } from '@inertiajs/react';
import type { PageProps } from '@/types';

export default function Profile() {
    const page = usePage<PageProps & { auth: { user: { name: string; email: string; referral_code?: string } }; profile: Record<string, unknown> }>();
    const user = page.props.auth.user;

    const profile = useForm({
        name: user.name,
        phone: (page.props.profile?.phone as string) ?? '',
        address: (page.props.profile?.address as string) ?? '',
        city: (page.props.profile?.city as string) ?? '',
        country: (page.props.profile?.country as string) ?? '',
        date_of_birth: (page.props.profile?.date_of_birth as string) ?? '',
        bio: (page.props.profile?.bio as string) ?? '',
    });

    const password = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    return (
        <AppLayout>
            <h1 className="text-xl font-bold text-gray-900">Profile & Security</h1>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader title="Profile information" subtitle={`Referral code: ${user.referral_code ?? '—'}`} />
                    <CardBody>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                profile.put(route('profile.update'));
                            }}
                            className="space-y-4"
                        >
                            <Input label="Full name" value={profile.data.name} onChange={(e) => profile.setData('name', e.target.value)} error={profile.errors.name} required />
                            <Input label="Email (read-only)" value={user.email} disabled />
                            <div className="grid gap-4 sm:grid-cols-2">
                                <Input label="Phone" value={profile.data.phone} onChange={(e) => profile.setData('phone', e.target.value)} error={profile.errors.phone} />
                                <Input label="City" value={profile.data.city} onChange={(e) => profile.setData('city', e.target.value)} />
                                <Input label="Country" value={profile.data.country} onChange={(e) => profile.setData('country', e.target.value)} />
                                <Input label="Date of birth" type="date" value={profile.data.date_of_birth} onChange={(e) => profile.setData('date_of_birth', e.target.value)} />
                            </div>
                            <Input label="Address" value={profile.data.address} onChange={(e) => profile.setData('address', e.target.value)} />
                            <Textarea label="Bio" value={profile.data.bio} onChange={(e) => profile.setData('bio', e.target.value)} />
                            <Button type="submit" loading={profile.processing}>
                                Save changes
                            </Button>
                        </form>
                    </CardBody>
                </Card>

                <div className="space-y-6">
                    <Card>
                        <CardHeader title="Change password" />
                        <CardBody>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    password.put(route('password.change'), {
                                        onSuccess: () => password.reset(),
                                    });
                                }}
                                className="space-y-4"
                            >
                                <Input label="Current password" type="password" value={password.data.current_password} onChange={(e) => password.setData('current_password', e.target.value)} error={password.errors.current_password} required />
                                <Input label="New password" type="password" value={password.data.password} onChange={(e) => password.setData('password', e.target.value)} error={password.errors.password} required />
                                <Input label="Confirm new password" type="password" value={password.data.password_confirmation} onChange={(e) => password.setData('password_confirmation', e.target.value)} error={password.errors.password_confirmation} required />
                                <Button type="submit" loading={password.processing}>
                                    Update password
                                </Button>
                            </form>
                        </CardBody>
                    </Card>

                    <Card>
                        <CardHeader title="Sessions" subtitle="Database-backed secure sessions with CSRF protection" />
                        <CardBody>
                            <p className="text-sm text-gray-500">
                                Logging out invalidates your session everywhere on this device. For security questions contact club support.
                            </p>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
