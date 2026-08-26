<?php

namespace App\Models;

use App\Enums\FundRequestStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FundRequest extends Model
{
    protected $fillable = [
        'reference',
        'user_id',
        'fund_id',
        'requested_amount',
        'approved_amount',
        'purpose',
        'proof_path',
        'status',
        'reviewed_by',
        'reviewed_at',
        'decision_note',
        'disbursed_at',
    ];

    protected function casts(): array
    {
        return [
            'requested_amount' => 'decimal:2',
            'approved_amount' => 'decimal:2',
            'status' => FundRequestStatus::class,
            'reviewed_at' => 'datetime',
            'disbursed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function fund(): BelongsTo
    {
        return $this->belongsTo(Fund::class);
    }

    public function reviewedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(FundTransaction::class);
    }
}
