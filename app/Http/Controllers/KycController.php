<?php

namespace App\Http\Controllers;

use App\Models\KycDocument;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KycController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $documents = $user->kycDocuments()->latest()->get()->map(fn (KycDocument $doc) => [
            'id' => $doc->id,
            'document_type' => $doc->document_type,
            'document_number' => $doc->document_number,
            'status' => $doc->status,
            'rejection_reason' => $doc->rejection_reason,
            'reviewed_at' => $doc->reviewed_at?->toIso8601String(),
            'created_at' => $doc->created_at->toIso8601String(),
        ]);

        return Inertia::render('security/Kyc', [
            'kycStatus' => $user->kyc_status,
            'documents' => $documents,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'document_type' => ['required', 'in:passport,national_id,driving_license'],
            'document_number' => ['required', 'string', 'max:100'],
            'document_file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        $path = $request->file('document_file')->store('kyc-documents', 'local');

        $request->user()->kycDocuments()->create([
            'document_type' => $validated['document_type'],
            'document_number' => $validated['document_number'],
            'file_path' => $path,
            'status' => 'pending',
        ]);

        $request->user()->update(['kyc_status' => 'pending']);

        return back()->with('success', 'KYC document submitted successfully. It will be reviewed shortly.');
    }
}
