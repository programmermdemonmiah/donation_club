<?php

namespace App\Services\Audit;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

/**
 * Append-only audit trail. Financial records are never deleted; use reversal
 * entries instead.
 */
class AuditLogService
{
    public static function log(
        string $action,
        ?Model $model = null,
        array $oldValues = [],
        array $newValues = [],
        ?int $userId = null,
    ): AuditLog {
        $user = Auth::user();

        return AuditLog::create([
            'user_id' => $userId ?? $user?->id,
            'action' => $action,
            'model_type' => $model?->getMorphClass(),
            'model_id' => $model?->getKey(),
            'old_values' => $oldValues ?: null,
            'new_values' => $newValues ?: null,
            'ip_address' => Request::ip(),
            'user_agent' => substr((string) Request::userAgent(), 0, 500),
        ]);
    }

    /**
     * Diff helper: logs only the attributes that changed between old and new.
     */
    public static function logChanges(string $action, Model $model, array $oldValues, array $newValues): AuditLog
    {
        $changed = [];

        foreach ($newValues as $key => $value) {
            if (($oldValues[$key] ?? null) !== $value || ! array_key_exists($key, $oldValues)) {
                $changed[$key] = $value;
            }
        }

        return self::log($action, $model, array_intersect_key($oldValues, $changed), $changed);
    }
}
