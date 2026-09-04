<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\MemberReturn;
use App\Models\ReturnRule;
use App\Services\Return\EligibilityService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ReturnController extends Controller
{
    public function __construct(private readonly EligibilityService $eligibility) {}

    public function index(): Response
    {
        $user = Auth::user();

        $evaluation = $this->eligibility->evaluate($user);

        return Inertia::render('return/Index', [
            'returns' => MemberReturn::query()
                ->where('user_id', $user->id)
                ->with('deposit:id,reference,amount', 'deposit.sequence')
                ->orderBy('id', 'asc')
                ->paginate(10)
                ->through(fn (MemberReturn $r) => [
                    'id' => $r->id,
                    'reference' => $r->reference,
                    'deposit_reference' => $r->deposit?->reference,
                    'sequence_number' => $r->deposit?->sequence?->sequence_number,
                    'base_amount' => $r->base_amount,
                    'rate' => $r->rate,
                    'payout_amount' => $r->payout_amount,
                    'status' => $r->status->value,
                    'completed_at' => $r->completed_at?->toIso8601String(),
                    'created_at' => $r->created_at->toIso8601String(),
                ]),
            'eligibility' => [
                'eligible' => $evaluation['eligible'],
                'failed' => collect($evaluation['failed'])->map(fn ($f, $key) => [
                    'requirement' => str_replace('_', ' ', ucfirst($key)),
                    'required' => $f['required'],
                    'actual' => $f['actual'],
                ])->values(),
            ],
            'termsNote' => ReturnRule::query()->value('terms_note'),
        ]);
    }
}
