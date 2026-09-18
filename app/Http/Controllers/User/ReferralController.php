<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Services\Rank\RankService;
use App\Services\Referral\ReferralService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ReferralController extends Controller
{
    public function __construct(private readonly RankService $ranks) {}

    public function index(): Response
    {
        $user = Auth::user();

        return Inertia::render('referral/Index', [
            'referralCode' => $user->referral_code,
            'referralLink' => url('/register?ref='.$user->referral_code),
            'directCount' => ReferralService::directReferralCount($user),
            'teamSize' => ReferralService::teamSize($user),
            'hands' => ReferralService::handLeaders($user),
            'handRanks' => $this->ranks->handCycleRows($user),
            'directReferrals' => $user->directReferrals()
                ->with('activeRank')
                ->latest()
                ->paginate(15)
                ->through(function ($referral) {
                    $rank = $referral->activeRank->first();

                    return [
                        'id' => $referral->id,
                        'username' => $referral->username,
                        'joined_at' => $referral->created_at->toDateString(),
                        'rank' => $rank ? [
                            'name' => $rank->name,
                            'color' => $rank->color,
                        ] : null,
                        'status' => $referral->status->value,
                    ];
                }),
        ]);
    }
}
