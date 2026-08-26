<?php

namespace App\Models;

use App\Enums\CommissionStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class Commission extends Model
{
    protected $fillable = [
        'reference',
        'user_id',
        'source_user_id',
        'commission_rule_id',
        'generation',
        'rate',
        'base_amount',
        'amount',
        'source_type',
        'source_id',
        'status',
        'credited_at',
    ];

    protected function casts(): array
    {
        return [
            'rate' => 'decimal:3',
            'base_amount' => 'decimal:2',
            'amount' => 'decimal:2',
            'status' => CommissionStatus::class,
            'credited_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sourceUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'source_user_id');
    }

    public function rule(): BelongsTo
    {
        return $this->belongsTo(CommissionRule::class, 'commission_rule_id');
    }

    public function source(): MorphTo
    {
        return $this->morphTo();
    }
}
