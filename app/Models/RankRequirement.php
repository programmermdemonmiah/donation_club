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

    public const GEN1_VOLUME = 'gen1_volume';

    public const GEN2_VOLUME = 'gen2_volume';

    public const GEN3_VOLUME = 'gen3_volume';

    public const KEYS = [
        self::DIRECT_REFERRALS,
        self::TEAM_SIZE,
        self::TEAM_VOLUME,
        self::QUALIFIED_MEMBERS,
        self::MIN_DEPOSIT,
        self::GEN1_VOLUME,
        self::GEN2_VOLUME,
        self::GEN3_VOLUME,
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
            self::TEAM_VOLUME => 'Team Volume ($)',
            self::QUALIFIED_MEMBERS => 'Qualified Members',
            self::MIN_DEPOSIT => 'Minimum Own Deposit ($)',
            self::GEN1_VOLUME => '1st Hand Volume ($)',
            self::GEN2_VOLUME => '2nd Hand Volume ($)',
            self::GEN3_VOLUME => '3rd Hand Volume ($)',
            default => ucwords(str_replace('_', ' ', $this->key)),
        };
    }
}
