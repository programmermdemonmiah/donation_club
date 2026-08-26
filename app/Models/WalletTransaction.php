<?php

namespace App\Models;

use App\Enums\WalletDirection;
use App\Enums\WalletTransactionStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class WalletTransaction extends Model
{
    protected $fillable = [
        'reference',
        'user_id',
        'type',
        'direction',
        'amount',
        'balance_context',
        'balance_before',
        'balance_after',
        'status',
        'reference_type',
        'reference_id',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'direction' => WalletDirection::class,
            'status' => WalletTransactionStatus::class,
            'amount' => 'decimal:2',
            'balance_before' => 'decimal:2',
            'balance_after' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
