<?php

namespace App\Models;

use App\Enums\ReturnStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A return/reward record for a completed deposit. (Table: returns)
 */
class MemberReturn extends Model
{
    protected $table = 'returns';

    protected $fillable = [
        'reference',
        'user_id',
        'deposit_id',
        'base_amount',
        'rate',
        'payout_amount',
        'status',
        'eligible_at',
        'approved_by',
        'approved_at',
        'processed_at',
        'completed_at',
        'cancelled_at',
        'reversal_of_return_id',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'base_amount' => 'decimal:2',
            'rate' => 'decimal:3',
            'payout_amount' => 'decimal:2',
            'status' => ReturnStatus::class,
            'eligible_at' => 'datetime',
            'approved_at' => 'datetime',
            'processed_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function deposit(): BelongsTo
    {
        return $this->belongsTo(Deposit::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function reversalOf(): BelongsTo
    {
        return $this->belongsTo(self::class, 'reversal_of_return_id');
    }
}
