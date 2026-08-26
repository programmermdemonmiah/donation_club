<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Audit\AuditLogService;
use App\Services\Referral\ReferralService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('referral_code', 'like', "%{$search}%");
                });
            })
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->when($request->filled('verified'), fn ($q) => $q
                ->whereNotNull('email_verified_at')
                ->when($request->boolean('verified') === false, fn ($qq) => $qq->orWhereNull('email_verified_at')))
            ->withCount('directReferrals as direct_referrals_count')
            ->latest()
            ->paginate(15)
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status->value,
                'is_admin' => $user->is_admin,
                'email_verified' => $user->hasVerifiedEmail(),
                'referral_code' => $user->referral_code,
                'referred_by' => $user->referred_by,
                'direct_referrals' => $user->direct_referrals_count,
                'joined_at' => $user->created_at->toDateString(),
            ]);

        return Inertia::render('admin/users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function show(User $user): Response
    {
        $wallet = $user->wallet()->first();

        return Inertia::render('admin/users/Show', [
            'member' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'status' => $user->status->value,
                'is_admin' => $user->is_admin,
                'referral_code' => $user->referral_code,
                'joined_at' => $user->created_at->toIso8601String(),
                'email_verified' => $user->hasVerifiedEmail(),
                'profile' => $user->profile?->only(['phone', 'city', 'country', 'address']),
                'rank' => $user->activeRank->first()?->only(['name', 'level']),
                'wallet' => $wallet ? [
                    'balance' => (string) $wallet->balance,
                    'locked' => (string) $wallet->locked_balance,
                    'available' => (string) $wallet->availableBalance(),
                ] : null,
                'referrer' => $user->referrer?->only(['id', 'name', 'email']),
                'stats' => [
                    'total_deposits' => (string) $user->deposits()->completed()->sum('amount'),
                    'deposits_count' => $user->deposits()->completed()->count(),
                    'direct_referrals' => ReferralService::directReferralCount($user),
                    'team_size' => ReferralService::teamSize($user),
                    'team_volume' => ReferralService::teamVolume($user),
                ],
            ],
            'recentDeposits' => $user->deposits()->with('sequence')->latest()->limit(10)->get()
                ->map(fn ($d) => [
                    'reference' => $d->reference,
                    'amount' => $d->amount,
                    'status' => $d->status->value,
                    'sequence_number' => $d->sequence?->sequence_number,
                    'completed_at' => $d->completed_at?->toIso8601String(),
                ]),
            'recentTransactions' => $user->walletTransactions()->latest()->limit(10)->get()
                ->map(fn ($t) => [
                    'reference' => $t->reference,
                    'type' => $t->type,
                    'direction' => $t->direction->value,
                    'amount' => $t->amount,
                    'status' => $t->status->value,
                    'created_at' => $t->created_at->toIso8601String(),
                ]),
        ]);
    }

    public function block(Request $request, User $user)
    {
        abort_if($user->isAdmin(), 403, 'Administrators cannot be blocked.');

        if ($user->status === \App\Enums\UserStatus::Active) {
            AuditLogService::logChanges('user.blocked', $user, ['status' => 'active'], ['status' => 'blocked']);
            $user->forceFill(['status' => \App\Enums\UserStatus::Blocked->value])->save();
        }

        return back()->with('success', 'User blocked.');
    }

    public function activate(Request $request, User $user)
    {
        if ($user->status === \App\Enums\UserStatus::Blocked) {
            AuditLogService::logChanges('user.activated', $user, ['status' => 'blocked'], ['status' => 'active']);
            $user->forceFill(['status' => \App\Enums\UserStatus::Active->value])->save();
        }

        return back()->with('success', 'User activated.');
    }
}
