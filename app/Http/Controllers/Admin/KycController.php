<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\KycDocument;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KycController extends Controller
{
    public function index(Request $request): Response
    {
        $documents = KycDocument::query()
            ->with('user:id,name,email')
            ->when($request->input('status'), fn ($q, $status) => $q->where('status', $status))
            ->when($request->input('search'), function ($q, $search) {
                $q->whereHas('user', fn ($u) => $u->where('email', 'like', "%{$search}%")->orWhere('name', 'like', "%{$search}%"));
            })
            ->latest()
            ->paginate(15)
            ->through(fn (KycDocument $doc) => [
                'id' => $doc->id,
                'user' => $doc->user?->only(['id', 'name', 'email']),
                'document_type' => $doc->document_type,
                'document_number' => $doc->document_number,
                'status' => $doc->status,
                'rejection_reason' => $doc->rejection_reason,
                'reviewed_at' => $doc->reviewed_at?->toIso8601String(),
                'created_at' => $doc->created_at->toIso8601String(),
            ]);

        return Inertia::render('admin/kyc/Index', [
            'documents' => $documents,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function show(KycDocument $kycDocument): Response
    {
        $kycDocument->load('user:id,name,email');

        return Inertia::render('admin/kyc/Show', [
            'document' => [
                'id' => $kycDocument->id,
                'user' => $kycDocument->user?->only(['id', 'name', 'email']),
                'document_type' => $kycDocument->document_type,
                'document_number' => $kycDocument->document_number,
                'file_url' => route('admin.kyc.download', $kycDocument),
                'status' => $kycDocument->status,
                'rejection_reason' => $kycDocument->rejection_reason,
                'reviewed_at' => $kycDocument->reviewed_at?->toIso8601String(),
                'created_at' => $kycDocument->created_at->toIso8601String(),
            ],
        ]);
    }

    public function approve(Request $request, KycDocument $kycDocument)
    {
        $kycDocument->update([
            'status' => 'approved',
            'reviewed_at' => now(),
            'reviewed_by' => $request->user()->id,
        ]);

        $kycDocument->user->update(['kyc_status' => 'verified']);

        return back()->with('success', 'KYC document approved. User is now verified.');
    }

    public function reject(Request $request, KycDocument $kycDocument)
    {
        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:500'],
        ]);

        $kycDocument->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
            'reviewed_at' => now(),
            'reviewed_by' => $request->user()->id,
        ]);

        $kycDocument->user->update(['kyc_status' => 'rejected']);

        return back()->with('success', 'KYC document rejected.');
    }

    public function download(KycDocument $kycDocument)
    {
        $path = storage_path('app/private/'.$kycDocument->file_path);

        if (! file_exists($path)) {
            abort(404);
        }

        return response()->file($path);
    }
}
