<?php

namespace App\Http\Controllers;

use App\Models\Deposit;
use App\Models\DepositSequence;
use App\Services\Settings\SettingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Public pages. Only intentionally public information is exposed:
 * deposit sequence + amount — never personal data.
 */
class PublicController extends Controller
{
    public function __construct(private readonly SettingsService $settings)
    {
    }

    public function home(): Response
    {
        return Inertia::render('public/Home', [
            'depositRules' => [
                'min' => $this->settings->minDeposit(),
                'max' => $this->settings->maxDeposit(),
            ],
            'stats' => [
                'total_deposits' => Deposit::query()->completed()->count(),
                'total_amount' => (string) Deposit::query()->completed()->sum('amount'),
                'members' => \App\Models\User::query()->where('is_admin', false)->count(),
            ],
        ]);
    }

    public function deposits(Request $request): Response
    {
        $sequences = DepositSequence::query()
            ->join('deposits', 'deposits.id', '=', 'deposit_sequences.deposit_id')
            ->where('deposits.status', 'completed')
            ->orderByDesc('deposit_sequences.sequence_number')
            ->select('deposit_sequences.sequence_number', 'deposits.amount', 'deposits.completed_at')
            ->paginate(20);

        return Inertia::render('public/PublicDeposits', [
            'deposits' => $sequences->through(fn ($row) => [
                'sequence_number' => $row->sequence_number,
                'formatted' => sprintf('#%06d', $row->sequence_number),
                'amount' => (string) $row->amount,
                'completed_at' => optional($row->completed_at)?->toIso8601String(),
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
