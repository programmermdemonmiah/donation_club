<?php

namespace App\Models;

use App\Enums\FundRequestStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Fund extends Model
{
    protected $fillable = [
        'name',
        'description',
        'minimum_rank_id',
        'min_amount',
        'max_amount',
        'requires_proof',
        'enabled',
    ];

    protected function casts(): array
    {
        return [
            'min_amount' => 'decimal:2',
            'max_amount' => 'decimal:2',
            'requires_proof' => 'boolean',
            'enabled' => 'boolean',
        ];
    }

    public function minimumRank(): BelongsTo
    {
        return $this->belongsTo(Rank::class, 'minimum_rank_id');
    }

    public function requests(): HasMany
    {
        return $this->hasMany(FundRequest::class);
    }
}
