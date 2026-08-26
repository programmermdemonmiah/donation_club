<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RankHistory extends Model
{
    protected $fillable = [
        'user_id',
        'old_rank_id',
        'new_rank_id',
        'reason',
        'changed_by',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function oldRank(): BelongsTo
    {
        return $this->belongsTo(Rank::class, 'old_rank_id');
    }

    public function newRank(): BelongsTo
    {
        return $this->belongsTo(Rank::class, 'new_rank_id');
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
