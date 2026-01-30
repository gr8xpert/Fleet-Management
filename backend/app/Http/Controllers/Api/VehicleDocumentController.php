<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Vehicle;
use App\Models\VehicleDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VehicleDocumentController extends Controller
{
    public function index(Vehicle $vehicle)
    {
        $documents = $vehicle->documents()
            ->orderBy('document_type')
            ->orderBy('expiry_date', 'desc')
            ->get();

        return response()->json($documents);
    }

    public function store(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'document_type' => 'required|in:mulkiya,registration,insurance,permit,fitness,other',
            'document_number' => 'nullable|string|max:100',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'required|date',
            'cost' => 'nullable|numeric|min:0',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'notes' => 'nullable|string',
        ]);

        // Deactivate previous documents of same type
        $vehicle->documents()
            ->where('document_type', $validated['document_type'])
            ->where('is_active', true)
            ->update(['is_active' => false]);

        // Handle file upload
        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('documents/vehicles/' . $vehicle->id, 'public');
        }

        $document = $vehicle->documents()->create([
            'document_type' => $validated['document_type'],
            'document_number' => $validated['document_number'],
            'issue_date' => $validated['issue_date'],
            'expiry_date' => $validated['expiry_date'],
            'cost' => $validated['cost'],
            'file_path' => $filePath,
            'notes' => $validated['notes'],
            'is_active' => true,
        ]);

        AuditLog::log('created', $document, null, $validated);

        return response()->json($document, 201);
    }

    public function show(VehicleDocument $document)
    {
        $document->load('vehicle');
        return response()->json($document);
    }

    public function update(Request $request, VehicleDocument $document)
    {
        $validated = $request->validate([
            'document_type' => 'required|in:mulkiya,registration,insurance,permit,fitness,other',
            'document_number' => 'nullable|string|max:100',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'required|date',
            'cost' => 'nullable|numeric|min:0',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'notes' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $oldValues = $document->toArray();

        // Handle file upload
        if ($request->hasFile('file')) {
            // Delete old file
            if ($document->file_path) {
                Storage::disk('public')->delete($document->file_path);
            }
            $validated['file_path'] = $request->file('file')->store(
                'documents/vehicles/' . $document->vehicle_id,
                'public'
            );
        }

        $document->update($validated);

        AuditLog::log('updated', $document, $oldValues, $validated);

        return response()->json($document);
    }

    public function destroy(VehicleDocument $document)
    {
        // Delete file
        if ($document->file_path) {
            Storage::disk('public')->delete($document->file_path);
        }

        $oldValues = $document->toArray();
        $document->delete();

        AuditLog::log('deleted', $document, $oldValues, null);

        return response()->json(null, 204);
    }

    public function expiring(Request $request)
    {
        $days = $request->input('days', 30);
        $type = $request->input('type'); // mulkiya, insurance, etc.

        $query = VehicleDocument::with('vehicle')
            ->where('is_active', true)
            ->expiring($days)
            ->orderBy('expiry_date');

        if ($type) {
            $query->where('document_type', $type);
        }

        return response()->json($query->get());
    }
}
