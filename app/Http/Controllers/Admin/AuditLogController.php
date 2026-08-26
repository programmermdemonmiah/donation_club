<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    public function index(Request $request): Response
    {
        $logs = AuditLog::query()
            ->with('user:id,name,email')
            ->when($request->filled('action'), fn ($q) => $q->where('action', 'like', '%'.$request->input('action').'%'))
            ->when($request->input('search'), function ($q, $s) {
                $q->where(function ($qq) use ($s) {
                    $qq->where('action', 'like', "%{$s}%")
                        ->orWhere('model_type', 'like', "%{$s}%");
                });
            })
            ->latest()
            ->paginate(25)
            ->through(fn (AuditLog $log) => [
                'id' => $log->id,
                'actor' => $log->user?->only(['id', 'name', 'email']),
                'action' => $log->action,
                'model_type' => $log->model_type,
                'model_id' => $log->model_id,
                'old_values' => $log->old_values,
                'new_values' => $log->new_values,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at->toIso8601String(),
            ]);

        return Inertia::render('admin/AuditLogs', [
            'logs' => $logs,
            'filters' => $request->only(['search', 'action']),
        ]);
    }
}
