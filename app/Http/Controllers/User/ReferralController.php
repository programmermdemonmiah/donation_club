<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Commission;
use App\Services\Referral\ReferralService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ReferralController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();

        return Inertia::render('referral/Index', [
            'referralCode' => $user->referral_code,
            'referralLink' => url('/register?ref='.$user->referral_code),
            'directCount' => ReferralService::directReferralCount($user),
            'teamSize' => ReferralService::teamSize($user),
            'directReferrals' => $user->directReferrals()
                ->with('activeRank:id,name')
                ->latest()
                ->paginate(15)
                ->through(fn ($r) => [
                    'id' => $r->id,
                    'name' => $r->name,
                    'joined_at' => $r->created_at->toDateString(),
                    'rank' => $r->activeRank->first()?->name,
                    'status' => $r->status->value,
                ]),
            'tree' => ReferralService::buildTree($user, 3),
        ]);
    }
}
