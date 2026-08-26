<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DepositSequence extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'sequence_number',
        'deposit_id',
        'allocated_at',
    ];

    protected function casts(): array
    {
        return [
            'allocated_at' => 'datetime',
        ];
    }

    public function deposit(): BelongsTo
    {
        return $this->belongsTo(Deposit::class);
    }

    public function formatted(): string
    {
        return sprintf('#%06d', $this->sequence_number);
    }
}
