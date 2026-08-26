<?php

namespace App\Services\Settings;

use App\Enums\SettingType;
use App\Models\Setting;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Throwable;

class SettingsService
{
    private const CACHE_KEY = 'settings:all';

    public function get(string $key, mixed $default = null): mixed
    {
        return $this->all()[$key] ?? $default;
    }

    public function all(): array
    {
        return Cache::rememberForever(self::CACHE_KEY, function () {
            return Setting::query()
                ->pluck('value', 'key')
                ->map(fn ($value, $key) => $this->decode($value, Setting::find($key)?->type ?? SettingType::String))
                ->all();
        });
    }

    public function set(string $key, mixed $value, ?SettingType $type = null, string $group = 'general'): void
    {
        $type ??= $this->inferType($value);

        DB::table('settings')->updateOrInsert(
            ['key' => $key],
            ['value' => $this->encode($value), 'type' => $type->value, 'group' => $group, 'updated_at' => now()],
        );

        $this->flush();
    }

    /**
     * Persist multiple settings atomically.
     */
    public function setMany(array $values, string $group = 'general'): void
    {
        DB::transaction(function () use ($values, $group) {
            foreach ($values as $key => $value) {
                $existing = Setting::where('key', $key)->first();
                $type = $this->inferType($value);

                DB::table('settings')->updateOrInsert(
                    ['key' => $key],
                    [
                        'value' => $this->encode($value),
                        'type' => $existing?->type?->value ?? $type->value,
                        'group' => $existing?->group ?? $group,
                        'updated_at' => now(),
                    ],
                );
            }
        });

        $this->flush();
    }

    public function flush(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    // Convenience typed getters for frequently used settings -----------------

    public function minDeposit(): string
    {
        return (string) ($this->get('deposit.min_amount') ?? '1.00');
    }

    public function maxDeposit(): string
    {
        return (string) ($this->get('deposit.max_amount') ?? '10.00');
    }

    public function requiredSequenceGap(): int
    {
        return (int) ($this->get('deposit.required_sequence_gap') ?? 20);
    }

    public function withdrawalsEnabled(): bool
    {
        return (bool) ($this->get('withdrawal.enabled') ?? true);
    }

    public function minWithdrawal(): string
    {
        return (string) ($this->get('withdrawal.min_amount') ?? '5.00');
    }

    public function maxWithdrawal(): string
    {
        return (string) ($this->get('withdrawal.max_amount') ?? '1000.00');
    }

    public function withdrawalFeePercent(): string
    {
        return (string) ($this->get('withdrawal.fee_percent') ?? '0.00');
    }

    public function commissionsEnabled(): bool
    {
        return (bool) ($this->get('commission.enabled') ?? false);
    }

    public function returnsEnabled(): bool
    {
        return (bool) ($this->get('return.enabled') ?? false);
    }

    // -----------------------------------------------------------------------

    private function encode(mixed $value): string
    {
        return match (true) {
            is_bool($value) => $value ? '1' : '0',
            is_array($value) => json_encode($value),
            default => (string) $value,
        };
    }

    private function decode(mixed $raw, SettingType $type): mixed
    {
        if ($raw === null) {
            return null;
        }

        return match ($type) {
            SettingType::Boolean => in_array($raw, [1, true, '1', 'true'], true),
            SettingType::Integer => (int) $raw,
            SettingType::Decimal => (string) $raw,
            SettingType::Json => json_decode((string) $raw, true),
            default => $raw,
        };
    }

    private function inferType(mixed $value): SettingType
    {
        return match (true) {
            is_bool($value) => SettingType::Boolean,
            is_int($value) => SettingType::Integer,
            is_float($value) => SettingType::Decimal,
            is_array($value) => SettingType::Json,
            default => SettingType::String,
        };
    }
}
