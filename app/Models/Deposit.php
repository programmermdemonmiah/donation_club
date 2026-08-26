<?php

namespace App\Models;

use App\Enums\DepositStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Deposit extends Model
{
    protected $fillable = [
        'reference',
        'user_id',
        'amount',
        'status',
        'eligibility_snapshot',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'status' => DepositStatus::class,
            'eligibility_snapshot' => 'array',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function sequence(): HasOne
    {
        return $this->hasOne(DepositSequence::class);
    }

    public function memberReturn()
    {
        return $this->hasOne(MemberReturn::class);
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', DepositStatus::Completed->value);
    }

    /**
     * Public display number e.g. #000001.
     */
    public function getSequenceNumberAttribute(): ?int
    {
        return $this->sequence?->sequence_number;
    }
}
