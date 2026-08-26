<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReturnRule extends Model
{
    protected $fillable = [
        'enabled',
        'return_percent',
        'minimum_direct_referrals',
        'rank_requirement_id',
        'deposit_requirement',
        'sequence_requirement',
        'terms_note',
    ];

    protected function casts(): array
    {
        return [
            'enabled' => 'boolean',
            'return_percent' => 'decimal:3',
            'deposit_requirement' => 'decimal:2',
        ];
    }

    public function rankRequirement(): BelongsTo
    {
        return $this->belongsTo(Rank::class, 'rank_requirement_id');
    }
}
