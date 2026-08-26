<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RankRequirement extends Model
{
    public const DIRECT_REFERRALS = 'direct_referrals';
    public const TEAM_SIZE = 'team_size';
    public const TEAM_VOLUME = 'team_volume';
    public const QUALIFIED_MEMBERS = 'qualified_members';
    public const MIN_DEPOSIT = 'min_deposit';

    public const KEYS = [
        self::DIRECT_REFERRALS,
        self::TEAM_SIZE,
        self::TEAM_VOLUME,
        self::QUALIFIED_MEMBERS,
        self::MIN_DEPOSIT,
    ];

    protected $fillable = ['rank_id', 'key', 'value'];

    protected function casts(): array
    {
        return [
            'value' => 'decimal:2',
        ];
    }

    public function rank(): BelongsTo
    {
        return $this->belongsTo(Rank::class);
    }

    public function keyLabel(): string
    {
        return match ($this->key) {
            self::DIRECT_REFERRALS => 'Direct Referrals',
            self::TEAM_SIZE => 'Team Size',
            self::TEAM_VOLUME => 'Team Volume',
            self::QUALIFIED_MEMBERS => 'Qualified Members',
            self::MIN_DEPOSIT => 'Minimum Deposit',
            default => ucwords(str_replace('_', ' ', $this->key)),
        };
    }
}
