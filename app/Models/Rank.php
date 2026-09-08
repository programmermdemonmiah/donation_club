<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Rank extends Model
{
    protected $fillable = ['name', 'slug', 'level', 'color', 'description', 'active', 'incentive_amount'];

    protected function casts(): array
    {
        return [
            'active' => 'boolean',
            'incentive_amount' => 'decimal:2',
        ];
    }

    public function requirements(): HasMany
    {
        return $this->hasMany(RankRequirement::class);
    }
}
