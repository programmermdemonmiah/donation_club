<?php

namespace App\Http\Controllers;

use App\Models\Commission;
use App\Models\CommissionRule;
use App\Models\Deposit;
use App\Models\DepositSequence;
use App\Models\MemberReturn;
use App\Models\ReturnRule;
use App\Models\User;
use App\Services\Settings\SettingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Public pages. Public donation ledger exposes donor name, sequence and amount
 * in permanent order for transparency — as requested.
 */
class PublicController extends Controller
{
    public function __construct(private readonly SettingsService $settings) {}

    public function home(): Response
    {
        $commissionRules = CommissionRule::query()
            ->where('enabled', true)
            ->orderBy('generation')
            ->get(['generation', 'name', 'percentage', 'trigger_event', 'scope']);

        return Inertia::render('public/Home', [
            'depositRules' => [
                'min' => $this->settings->minDeposit(),
                'max' => $this->settings->maxDeposit(),
            ],
            'stats' => [
                'deposits' => Deposit::query()->completed()->count(),
                'paid_out' => Commission::query()->where('status', 'credited')->sum('amount') + MemberReturn::query()->where('status', 'completed')->sum('payout_amount'),
                'members' => User::query()->where('is_admin', false)->count(),
                'countries' => 12, // Placeholder or User::distinct('country')->count() if country exists
            ],
            'latestDeposits' => Deposit::query()
                ->with('user:id,name')
                ->completed()
                ->latest('completed_at')
                ->take(7)
                ->get()
                ->map(fn ($d) => [
                    'reference' => $d->reference,
                    'amount' => (string) $d->amount,
                    'created_at' => $d->completed_at?->diffForHumans() ?? $d->created_at->diffForHumans(),
                ]),
            'commissionLevels' => $commissionRules->map(fn ($r) => [
                'generation' => $r->generation,
                'name' => $r->name,
                'rate' => rtrim(rtrim((string) $r->percentage, '0'), '.').'%',
                'trigger' => $r->trigger_event,
                'is_direct' => $r->scope === 'direct',
            ])->values(),
            'returnRate' => (string) (ReturnRule::query()->value('return_percent') ?? '0'),
        ]);
    }

    public function deposits(Request $request): Response
    {
        $sequences = DepositSequence::query()
            ->join('deposits', 'deposits.id', '=', 'deposit_sequences.deposit_id')
            ->join('users', 'users.id', '=', 'deposits.user_id')
            ->where('deposits.status', 'completed')
            ->orderByDesc('deposit_sequences.sequence_number')
            ->select('deposit_sequences.sequence_number', 'deposits.amount', 'deposits.completed_at', 'users.name as donor_name')
            ->paginate(20);

        return Inertia::render('public/PublicDeposits', [
            'deposits' => $sequences->through(fn ($row) => [
                'sequence_number' => $row->sequence_number,
                'formatted' => sprintf('#%06d', $row->sequence_number),
                'amount' => (string) $row->amount,
                'completed_at' => optional($row->completed_at)?->toIso8601String(),
                'donor_name' => (string) $row->donor_name,
                'donor_initial' => strtoupper(mb_substr((string) $row->donor_name, 0, 1)),
            ]),
        ]);
    }

    public function page(string $slug): Response
    {
        $views = [
            'about' => 'public/About',
            'how-it-works' => 'public/HowItWorks',
            'faq' => 'public/Faq',
            'contact' => 'public/Contact',
            'terms' => 'public/Terms',
            'privacy' => 'public/Privacy',
            'risk-disclosure' => 'public/RiskDisclosure',
        ];

        abort_unless(isset($views[$slug]), 404);

        return Inertia::render($views[$slug]);
    }
}
