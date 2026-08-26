<?php

namespace App\Models;

use App\Enums\UserRankStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserRank extends Model
{
    protected $fillable = [
        'user_id',
        'rank_id',
        'status',
        'metrics_snapshot',
        'achieved_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => UserRankStatus::class,
            'metrics_snapshot' => 'array',
            'achieved_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function rank(): BelongsTo
    {
        return $this->belongsTo(Rank::class);
    }
}
