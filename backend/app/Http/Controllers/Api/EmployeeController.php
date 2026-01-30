<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        $query = Employee::with('currentVisa');

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('employee_id', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('passport_number', 'like', "%{$search}%");
            });
        }

        $sortBy = $request->input('sort_by', 'name');
        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->input('per_page', 15);

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'nullable|string|max:20|unique:employees',
            'name' => 'required|string|max:100',
            'name_arabic' => 'nullable|string|max:100',
            'type' => 'required|in:driver,mechanic,cleaner,supervisor,admin,other',
            'nationality' => 'nullable|string|max:50',
            'passport_number' => 'nullable|string|max:20',
            'passport_expiry' => 'nullable|date',
            'emirates_id' => 'nullable|string|max:20',
            'emirates_id_expiry' => 'nullable|date',
            'license_number' => 'nullable|string|max:20',
            'license_expiry' => 'nullable|date',
            'phone' => 'nullable|string|max:20',
            'phone_alternate' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'join_date' => 'nullable|date',
            'basic_salary' => 'nullable|numeric|min:0',
            'salary_card_number' => 'nullable|string|max:30',
            'salary_card_pin' => 'nullable|string|max:10',
            'bank_name' => 'nullable|string|max:100',
            'bank_account' => 'nullable|string|max:50',
            'status' => 'nullable|in:active,inactive,terminated,on_leave',
            'photo' => 'nullable|image|max:2048',
            'notes' => 'nullable|string',
        ]);

        // Handle photo upload
        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('employees', 'public');
        }

        // Handle encrypted PIN
        if (!empty($validated['salary_card_pin'])) {
            $validated['salary_card_pin_encrypted'] = $validated['salary_card_pin'];
            unset($validated['salary_card_pin']);
        }

        $employee = Employee::create($validated);

        AuditLog::log('created', $employee, null, array_diff_key($validated, ['salary_card_pin_encrypted' => 1]));

        return response()->json($employee, 201);
    }

    public function show(Employee $employee)
    {
        $employee->load(['currentVisa', 'visas', 'salaries' => function ($q) {
            $q->latest()->limit(12);
        }]);

        return response()->json($employee);
    }

    public function update(Request $request, Employee $employee)
    {
        $validated = $request->validate([
            'employee_id' => 'nullable|string|max:20|unique:employees,employee_id,' . $employee->id,
            'name' => 'required|string|max:100',
            'name_arabic' => 'nullable|string|max:100',
            'type' => 'required|in:driver,mechanic,cleaner,supervisor,admin,other',
            'nationality' => 'nullable|string|max:50',
            'passport_number' => 'nullable|string|max:20',
            'passport_expiry' => 'nullable|date',
            'emirates_id' => 'nullable|string|max:20',
            'emirates_id_expiry' => 'nullable|date',
            'license_number' => 'nullable|string|max:20',
            'license_expiry' => 'nullable|date',
            'phone' => 'nullable|string|max:20',
            'phone_alternate' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'join_date' => 'nullable|date',
            'basic_salary' => 'nullable|numeric|min:0',
            'salary_card_number' => 'nullable|string|max:30',
            'salary_card_pin' => 'nullable|string|max:10',
            'bank_name' => 'nullable|string|max:100',
            'bank_account' => 'nullable|string|max:50',
            'status' => 'nullable|in:active,inactive,terminated,on_leave',
            'photo' => 'nullable|image|max:2048',
            'notes' => 'nullable|string',
        ]);

        $oldValues = $employee->toArray();

        // Handle photo upload
        if ($request->hasFile('photo')) {
            if ($employee->photo) {
                Storage::disk('public')->delete($employee->photo);
            }
            $validated['photo'] = $request->file('photo')->store('employees', 'public');
        }

        // Handle encrypted PIN
        if (!empty($validated['salary_card_pin'])) {
            $validated['salary_card_pin_encrypted'] = $validated['salary_card_pin'];
            unset($validated['salary_card_pin']);
        }

        $employee->update($validated);

        AuditLog::log('updated', $employee, $oldValues, array_diff_key($validated, ['salary_card_pin_encrypted' => 1]));

        return response()->json($employee);
    }

    public function destroy(Employee $employee)
    {
        $oldValues = $employee->toArray();
        $employee->delete();

        AuditLog::log('deleted', $employee, $oldValues, null);

        return response()->json(null, 204);
    }

    public function drivers()
    {
        $drivers = Employee::drivers()->active()->orderBy('name')->get();
        return response()->json($drivers);
    }

    public function fines(Employee $employee)
    {
        $fines = $employee->fines()
            ->with('vehicle')
            ->orderBy('fine_date', 'desc')
            ->get();

        return response()->json([
            'fines' => $fines,
            'total_pending' => $fines->where('status', 'pending')->sum('amount'),
            'total_paid' => $fines->where('status', 'paid')->sum('amount'),
        ]);
    }

    public function attendance(Request $request, Employee $employee)
    {
        $month = $request->input('month', now()->month);
        $year = $request->input('year', now()->year);

        $attendance = $employee->attendance()
            ->whereMonth('date', $month)
            ->whereYear('date', $year)
            ->orderBy('date')
            ->get();

        return response()->json($attendance);
    }
}
