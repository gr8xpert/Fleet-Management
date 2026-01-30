<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Employee;
use App\Models\Visa;
use App\Models\VisaApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class VisaController extends Controller
{
    public function index(Request $request)
    {
        $query = Visa::with('employee');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('visa_type')) {
            $query->where('visa_type', $request->visa_type);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('employee', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%");
            })->orWhere('visa_number', 'like', "%{$search}%");
        }

        $query->orderBy('expiry_date');

        $perPage = $request->input('per_page', 15);

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'visa_number' => 'nullable|string|max:50',
            'uid_number' => 'nullable|string|max:50',
            'visa_type' => 'required|in:employment,visit,transit,residence,other',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'required|date',
            'status' => 'nullable|in:active,expired,cancelled,pending_renewal',
            'sponsor_name' => 'nullable|string|max:100',
            'visa_cost' => 'nullable|numeric|min:0',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'notes' => 'nullable|string',
        ]);

        // Deactivate previous active visas
        Visa::where('employee_id', $validated['employee_id'])
            ->where('status', 'active')
            ->update(['status' => 'expired']);

        // Handle file upload
        if ($request->hasFile('file')) {
            $validated['file_path'] = $request->file('file')->store(
                'documents/visas/' . $validated['employee_id'],
                'public'
            );
        }

        $visa = Visa::create($validated);

        AuditLog::log('created', $visa, null, $validated);

        return response()->json($visa->load('employee'), 201);
    }

    public function show(Visa $visa)
    {
        $visa->load(['employee', 'fines']);
        return response()->json($visa);
    }

    public function update(Request $request, Visa $visa)
    {
        $validated = $request->validate([
            'visa_number' => 'nullable|string|max:50',
            'uid_number' => 'nullable|string|max:50',
            'visa_type' => 'required|in:employment,visit,transit,residence,other',
            'issue_date' => 'nullable|date',
            'expiry_date' => 'required|date',
            'status' => 'nullable|in:active,expired,cancelled,pending_renewal',
            'sponsor_name' => 'nullable|string|max:100',
            'visa_cost' => 'nullable|numeric|min:0',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'notes' => 'nullable|string',
        ]);

        $oldValues = $visa->toArray();

        // Handle file upload
        if ($request->hasFile('file')) {
            if ($visa->file_path) {
                Storage::disk('public')->delete($visa->file_path);
            }
            $validated['file_path'] = $request->file('file')->store(
                'documents/visas/' . $visa->employee_id,
                'public'
            );
        }

        $visa->update($validated);

        AuditLog::log('updated', $visa, $oldValues, $validated);

        return response()->json($visa);
    }

    public function destroy(Visa $visa)
    {
        if ($visa->file_path) {
            Storage::disk('public')->delete($visa->file_path);
        }

        $oldValues = $visa->toArray();
        $visa->delete();

        AuditLog::log('deleted', $visa, $oldValues, null);

        return response()->json(null, 204);
    }

    public function expiring(Request $request)
    {
        $days = $request->input('days', 30);

        $visas = Visa::with('employee')
            ->active()
            ->expiring($days)
            ->orderBy('expiry_date')
            ->get();

        return response()->json($visas);
    }

    public function byEmployee(Employee $employee)
    {
        $visas = $employee->visas()
            ->orderBy('expiry_date', 'desc')
            ->get();

        return response()->json($visas);
    }

    public function renew(Request $request, Visa $visa)
    {
        $validated = $request->validate([
            'new_expiry_date' => 'required|date|after:today',
            'visa_cost' => 'nullable|numeric|min:0',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'notes' => 'nullable|string',
        ]);

        // Mark current visa as expired
        $visa->update(['status' => 'expired']);

        // Create new visa record
        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store(
                'documents/visas/' . $visa->employee_id,
                'public'
            );
        }

        $newVisa = Visa::create([
            'employee_id' => $visa->employee_id,
            'visa_number' => $visa->visa_number,
            'uid_number' => $visa->uid_number,
            'visa_type' => $visa->visa_type,
            'issue_date' => now(),
            'expiry_date' => $validated['new_expiry_date'],
            'status' => 'active',
            'sponsor_name' => $visa->sponsor_name,
            'visa_cost' => $validated['visa_cost'],
            'file_path' => $filePath,
            'notes' => $validated['notes'],
        ]);

        AuditLog::log('renewed', $newVisa, $visa->toArray(), $validated);

        return response()->json($newVisa, 201);
    }

    // Visa Applications
    public function applications(Request $request)
    {
        $query = VisaApplication::with('employee');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $query->orderBy('application_date', 'desc');

        return response()->json($query->paginate(15));
    }

    public function createApplication(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'application_type' => 'required|in:new,renewal,cancellation,transfer,status_change',
            'application_date' => 'required|date',
            'expected_completion' => 'nullable|date',
            'fees_paid' => 'nullable|numeric|min:0',
            'documents_submitted' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $application = VisaApplication::create($validated);

        AuditLog::log('created', $application, null, $validated);

        return response()->json($application->load('employee'), 201);
    }

    public function updateApplication(Request $request, VisaApplication $application)
    {
        $validated = $request->validate([
            'application_type' => 'required|in:new,renewal,cancellation,transfer,status_change',
            'application_date' => 'required|date',
            'expected_completion' => 'nullable|date',
            'fees_paid' => 'nullable|numeric|min:0',
            'documents_submitted' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $oldValues = $application->toArray();
        $application->update($validated);

        AuditLog::log('updated', $application, $oldValues, $validated);

        return response()->json($application);
    }

    public function updateApplicationStatus(Request $request, VisaApplication $application)
    {
        $validated = $request->validate([
            'status' => 'required|in:submitted,processing,approved,rejected,completed',
            'completion_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $oldValues = $application->toArray();
        $application->update($validated);

        AuditLog::log('status_updated', $application, $oldValues, $validated);

        return response()->json($application);
    }
}
