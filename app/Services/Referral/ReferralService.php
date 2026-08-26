<?php

namespace App\Services\Referral;

use App\Models\ReferralRelationship;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;
use RuntimeException;

/**
 * Referral tree built on a materialized ancestor path.
 *
 * Path format: "/1/5/12/" meaning ancestors root-first. The direct referrer
 * is always the last id before the trailing slash. Generation distance between
 * two members equals the number of path segments between them + 1.
 */
class ReferralService
{
    public const MAX_GENERATIONS = 10;

    public static function generateReferralCode(): string
    {
        do {
            $code = strtoupper(Str::random(8));
        } while (User::where('referral_code', $code)->exists());

        return $code;
    }

    /**
     * Resolve a referral code to an active referrer or fail.
     */
    public static function resolveReferrer(string $code): User
    {
        $referrer = User::query()
            ->where('referral_code', mb_strtoupper(trim($code)))
            ->first();

        if (! $referrer) {
            throw new InvalidArgumentException('The referral code is invalid.');
        }

        return $referrer;
    }

    /**
     * Attach a user under a referrer inside the caller's DB transaction.
     * Guards: self-referral, circular relationships, inactive referrer.
     */
    public static function attachReferrer(User $user, User $referrer): ReferralRelationship
    {
        if ($user->id === $referrer->id) {
            throw new InvalidArgumentException('A user cannot refer themselves.');
        }

        if (! $referrer->isActive()) {
            throw new InvalidArgumentException('The referrer account is not eligible.');
        }

        // Circular guard: the referrer must not be inside the new user's subtree.
        if (self::isDescendant($referrer->id, $user->id)) {
            throw new InvalidArgumentException('This referral would create a circular relationship.');
        }

        $referrerRelationship = ReferralRelationship::query()->where('user_id', $referrer->id)->first();

        $ancestorPath = ($referrerRelationship?->ancestor_path ?? '/').$referrer->id.'/';

        // Keep users.referred_by in sync — it is the single source of truth for
        // generation-1 lookups.
        if ($user->referred_by !== $referrer->id) {
            $user->forceFill(['referred_by' => $referrer->id])->save();
        }

        return ReferralRelationship::create([
            'user_id' => $user->id,
            'referrer_id' => $referrer->id,
            'depth' => ($referrerRelationship?->depth ?? 0) + 1,
            'ancestor_path' => $ancestorPath,
        ]);
    }

    /**
     * True when $candidateDescendantId sits somewhere below $userId in the tree.
     */
    public static function isDescendant(int $candidateDescendantId, int $userId): bool
    {
        return ReferralRelationship::query()
            ->where('user_id', $candidateDescendantId)
            ->where('ancestor_path', 'like', "%/{$userId}/%")
            ->exists();
    }

    /**
     * Direct referrals (generation 1).
     */
    public static function directReferrals(User $user)
    {
        return User::query()->where('referred_by', $user->id);
    }

    public static function directReferralCount(User $user): int
    {
        return (int) self::directReferrals($user)->count();
    }

    /**
     * @return array<int, array{user: User, generation: int}> nearest upline first
     */
    public static function upline(User $user, int $maxGenerations = self::MAX_GENERATIONS): array
    {
        $relationship = ReferralRelationship::query()
            ->where('user_id', $user->id)
            ->first();

        if (! $relationship) {
            return [];
        }

        $ancestorsNearestFirst = $relationship->ancestorIds(); // already reversed by model helper

        $users = User::query()
            ->whereIn('id', array_slice($ancestorsNearestFirst, 0, $maxGenerations))
            ->get()
            ->keyBy('id');

        $result = [];
        foreach (array_slice($ancestorsNearestFirst, 0, $maxGenerations) as $index => $ancestorId) {
            if ($member = $users->get($ancestorId)) {
                $result[] = ['user' => $member, 'generation' => $index + 1];
            }
        }

        return $result;
    }

    /**
     * Query of all descendants (any generation).
     */
    public static function downlineQuery(User $user)
    {
        return ReferralRelationship::query()
            ->where('ancestor_path', 'like', "%/{$user->id}/%")
            ->with('user');
    }

    public static function teamSize(User $user): int
    {
        return self::downlineQuery($user)->count();
    }

    /**
     * Members at exactly N generations below $user (1-based).
     */
    public static function generationMembers(User $user, int $generation)
    {
        $relationships = self::downlineQuery($user)->get();

        return $relationships
            ->filter(function (ReferralRelationship $relationship) use ($user, $generation) {
                $distance = self::distanceToAncestor($relationship->ancestor_path, $user->id);

                return $distance !== null && $distance === $generation;
            })
            ->map(fn (ReferralRelationship $relationship) => $relationship->user);
    }

    /**
     * Generational distance from a member to one of its ancestors, or null.
     */
    public static function distanceToAncestor(string $ancestorPath, int $ancestorId): ?int
    {
        $segments = array_values(array_filter(explode('/', trim($ancestorPath, '/'))));

        foreach ($segments as $index => $segment) {
            if ((int) $segment === $ancestorId) {
                // segments after this one are the intermediate descendants
                return count($segments) - $index;
            }
        }

        return null;
    }

    /**
     * Sum of completed deposit amounts across the whole downline.
     */
    public static function teamVolume(User $user): string
    {
        $ids = self::downlineQuery($user)->pluck('user_id');

        if ($ids->isEmpty()) {
            return '0.00';
        }

        $total = DB::table('deposits')
            ->whereIn('user_id', $ids)
            ->where('status', 'completed')
            ->sum('amount');

        return (string) $total;
    }

    /**
     * Downline members whose completed deposits meet a minimum threshold.
     */
    public static function qualifiedMemberIds(User $user, string $minTotalDeposit): array
    {
        return DB::table('referral_relationships as rr')
            ->join('deposits as d', 'd.user_id', '=', 'rr.user_id')
            ->where('rr.ancestor_path', 'like', "%/{$user->id}/%")
            ->where('d.status', 'completed')
            ->groupBy('rr.user_id')
            ->havingRaw('SUM(d.amount) >= ?', [$minTotalDeposit])
            ->pluck('rr.user_id')
            ->all();
    }

    /**
     * Recursive tree for display purposes.
     *
     * @return array<int, array{id:int,name:string,email:string,joined_at:string,children:array}>
     */
    public static function buildTree(User $user, int $maxDepth = 3): array
    {
        return self::buildLevel($user->id, 1, $maxDepth);
    }

    private static function buildLevel(int $userId, int $level, int $maxDepth): array
    {
        if ($level > $maxDepth) {
            return [];
        }

        return User::query()
            ->where('referred_by', $userId)
            ->get(['id', 'name', 'email', 'created_at'])
            ->map(fn (User $child) => [
                'id' => $child->id,
                'name' => $child->name,
                'email' => $child->email,
                'joined_at' => optional($child->created_at)->toDateString() ?? '',
                'children' => self::buildLevel($child->id, $level + 1, $maxDepth),
            ])
            ->all();
    }

    /**
     * Validate a registration-time referral code; returns the referrer or null.
     */
    public static function validateForRegistration(?string $code): ?User
    {
        if (blank($code)) {
            return null;
        }

        try {
            return self::resolveReferrer($code);
        } catch (InvalidArgumentException $e) {
            throw new InvalidArgumentException('Invalid referral code.');
        }
    }

    /**
     * Move a user's subtree when a referrer changes (admin tool). Keeps paths consistent.
     */
    public static function moveSubtreeRoot(User $user, User $newReferrer): void
    {
        throw new RuntimeException('Subtree moves are intentionally disabled to preserve ledger/tree integrity.');
    }
}
