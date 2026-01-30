<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Employee;
use App\Models\Salary;
use App\Models\SalaryAdvance;
use Illuminate\Http\Request;

class SalaryController extends Controller
{
    public function index(Request $request)
    {
        $query = Salary::with('employee');

        if ($request->has('year')) {
            $query->where('year', $request->year);
        }

        if ($request->has('month')) {
            $query->where('month', $request->month);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        $query->orderBy('year', 'desc')->orderBy('month', 'desc');

        $perPage = $request->input('per_page', 15);

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'year' => 'required|integer|min:2000|max:2100',
            'month' => 'required|integer|min:1|max:12',
            'basic_salary' => 'required|numeric|min:0',
            'allowances' => 'nullable|numeric|min:0',
            'overtime' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'advance_deduction' => 'nullable|numeric|min:0',
            'fine_deduction' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:pending,paid,partial',
            'payment_date' => 'nullable|date',
            'payment_method' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        // Check for duplicate
        $exists = Salary::where('employee_id', $validated['employee_id'])
            ->where('year', $validated['year'])
            ->where('month', $validated['month'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Salary record already exists for this employee and period',
            ], 422);
        }

        $salary = Salary::create($validated);

        AuditLog::log('created', $salary, null, $validated);

        return response()->json($salary->load('employee'), 201);
    }

    public function show(Salary $salary)
    {
        $salary->load(['employee', 'deductedAdvances']);
        return response()->json($salary);
    }

    public function update(Request $request, Salary $salary)
    {
        $validated = $request->validate([
            'basic_salary' => 'required|numeric|min:0',
            'allowances' => 'nullable|numeric|min:0',
            'overtime' => 'nullable|numeric|min:0',
            'deductions' => 'nullable|numeric|min:0',
            'advance_deduction' => 'nullable|numeric|min:0',
            'fine_deduction' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:pending,paid,partial',
            'payment_date' => 'nullable|date',
            'payment_method' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $oldValues = $salary->toArray();
        $salary->update($validated);

        AuditLog::log('updated', $salary, $oldValues, $validated);

        return response()->json($salary->load('employee'));
    }

    public function destroy(Salary $salary)
    {
        $oldValues = $salary->toArray();
        $salary->delete();

        AuditLog::log('deleted', $salary, $oldValues, null);

        return response()->json(null, 204);
    }

    public function byEmployee(Employee $employee)
    {
        $salaries = $employee->salaries()
            ->orderBy('year', 'desc')
            ->orderBy('month', 'desc')
            ->get();

        return response()->json($salaries);
    }

    public function generateMonthly(Request $request)
    {
        $validated = $request->validate([
            'year' => 'required|integer|min:2000|max:2100',
            'month' => 'required|integer|min:1|max:12',
        ]);

        $employees = Employee::active()->get();
        $created = 0;
        $skipped = 0;

        foreach ($employees as $employee) {
            $exists = Salary::where('employee_id', $employee->id)
                ->where('year', $validated['year'])
                ->where('month', $validated['month'])
                ->exists();

            if ($exists) {
                $skipped++;
                continue;
            }

            // Get pending advances for this employee
            $pendingAdvances = SalaryAdvance::where('employee_id', $employee->id)
                ->where('status', 'pending')
                ->sum('amount');

            Salary::create([
                'employee_id' => $employee->id,
                'year' => $validated['year'],
                'month' => $validated['month'],
                'basic_salary' => $employee->basic_salary ?? 0,
                'allowances' => 0,
                'overtime' => 0,
                'deductions' => 0,
                'advance_deduction' => $pendingAdvances,
                'fine_deduction' => 0,
                'status' => 'pending',
            ]);

            $created++;
        }

        return response()->json([
            'message' => "Generated {$created} salary records, skipped {$skipped} existing",
            'created' => $created,
            'skipped' => $skipped,
        ]);
    }

    public function markAsPaid(Request $request, Salary $salary)
    {
        $validated = $request->validate([
            'payment_date' => 'nullable|date',
            'payment_method' => 'nullable|string|max:50',
        ]);

        $oldValues = $salary->toArray();

        $salary->update([
            'status' => 'paid',
            'payment_date' => $validated['payment_date'] ?? now(),
            'payment_method' => $validated['payment_method'] ?? 'bank_transfer',
        ]);

        // Mark any pending advances as deducted
        SalaryAdvance::where('employee_id', $salary->employee_id)
            ->where('status', 'pending')
            ->update([
                'status' => 'deducted',
                'deducted_from_salary_id' => $salary->id,
            ]);

        AuditLog::log('paid', $salary, $oldValues, $validated);

        return response()->json($salary);
    }

    // Salary Advances
    public function advances(Request $request)
    {
        $query = SalaryAdvance::with('employee');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('employee_id')) {
            $query->where('employee_id', $request->employee_id);
        }

        $query->orderBy('advance_date', 'desc');

        return response()->json($query->paginate(15));
    }

    public function createAdvance(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'amount' => 'required|numeric|min:0',
            'advance_date' => 'required|date',
            'reason' => 'nullable|string',
        ]);

        $advance = SalaryAdvance::create($validated);

        AuditLog::log('created', $advance, null, $validated);

        return response()->json($advance->load('employee'), 201);
    }

    public function updateAdvance(Request $request, SalaryAdvance $advance)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0',
            'advance_date' => 'required|date',
            'reason' => 'nullable|string',
            'status' => 'nullable|in:pending,deducted,cancelled',
        ]);

        $oldValues = $advance->toArray();
        $advance->update($validated);

        AuditLog::log('updated', $advance, $oldValues, $validated);

        return response()->json($advance);
    }

    public function deleteAdvance(SalaryAdvance $advance)
    {
        $oldValues = $advance->toArray();
        $advance->delete();

        AuditLog::log('deleted', $advance, $oldValues, null);

        return response()->json(null, 204);
    }
}
