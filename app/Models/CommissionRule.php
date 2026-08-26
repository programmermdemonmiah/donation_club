<?php

namespace App\Models;

use App\Enums\CommissionStatus;
use App\Enums\CommissionTrigger;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CommissionRule extends Model
{
    protected $fillable = [
        'name',
        'scope',
        'generation',
        'percentage',
        'trigger_event',
        'enabled',
    ];

    protected function casts(): array
    {
        return [
            'percentage' => 'decimal:3',
            'enabled' => 'boolean',
        ];
    }

    public function scopeLabel(): string
    {
        return $this->generation === 1 && $this->scope === \App\Enums\CommissionScope::Direct->value
            ? 'Direct Referral'
            : "Generation {$this->generation}";
    }
}
