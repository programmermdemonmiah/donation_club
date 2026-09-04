<?php

namespace App\Models;

use App\Enums\UserRankStatus;
use App\Enums\UserStatus;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'email',
        'email_verified_at',
        'password',
        'referral_code',
        'referred_by',
        'is_admin',
        'is_agent',
        'status',
        'kyc_status',
        'google2fa_secret',
        'google2fa_enabled',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'google2fa_secret',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_admin' => 'boolean',
            'is_agent' => 'boolean',
            'status' => UserStatus::class,
        ];
    }

    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    public function wallet(): HasOne
    {
        return $this->hasOne(Wallet::class);
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_by');
    }

    public function referralRelationship()
    {
        return $this->hasOne(ReferralRelationship::class);
    }

    public function directReferrals(): HasMany
    {
        return $this->hasMany(User::class, 'referred_by');
    }

    public function deposits(): HasMany
    {
        return $this->hasMany(Deposit::class);
    }

    public function walletTransactions(): HasMany
    {
        return $this->hasMany(WalletTransaction::class);
    }

    public function commissions(): HasMany
    {
        return $this->hasMany(Commission::class);
    }

    public function returns(): HasMany
    {
        return $this->hasMany(MemberReturn::class);
    }

    public function withdrawals(): HasMany
    {
        return $this->hasMany(Withdrawal::class);
    }

    public function fundRequests(): HasMany
    {
        return $this->hasMany(FundRequest::class);
    }

    public function activeRank()
    {
        return $this->belongsToMany(Rank::class, 'user_ranks')
            ->withPivot(['status', 'achieved_at', 'metrics_snapshot'])
            ->wherePivot('status', UserRankStatus::Active->value)
            ->withTimestamps();
    }

    public function rankHistories(): HasMany
    {
        return $this->hasMany(RankHistory::class);
    }

    public function kycDocuments(): HasMany
    {
        return $this->hasMany(KycDocument::class);
    }

    public function latestKyc(): HasOne
    {
        return $this->hasOne(KycDocument::class)->latestOfMany();
    }

    public function isAdmin(): bool
    {
        return (bool) $this->is_admin;
    }

    public function isAgent(): bool
    {
        return (bool) $this->is_agent;
    }

    public function isActive(): bool
    {
        return $this->status === UserStatus::Active || $this->status?->value === UserStatus::Active->value;
    }

    public function hasVerifiedEmail(): bool
    {
        return $this->email_verified_at !== null;
    }

    public function isKycVerified(): bool
    {
        return $this->kyc_status === 'verified';
    }

    public function is2faEnabled(): bool
    {
        return (bool) $this->google2fa_enabled;
    }
}
