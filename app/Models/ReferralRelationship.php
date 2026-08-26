<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * One row per user (except the root/referral-less user) describing the
 * position in the referral tree via a materialized ancestor path.
 */
class ReferralRelationship extends Model
{
    protected $fillable = [
        'user_id',
        'referrer_id',
        'depth',
        'ancestor_path',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referrer_id');
    }

    /**
     * Ancestor ids ordered from direct referrer to root.
     */
    public function ancestorIds(): array
    {
        $ids = array_filter(array_map('intval', explode('/', trim($this->ancestor_path, '/'))));

        // stored root-first; reverse so nearest upline comes first
        return array_reverse($ids);
    }
}
