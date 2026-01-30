<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Expense;
use App\Models\ExpenseCategory;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::with(['category', 'vehicle', 'employee', 'vendor']);

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('vehicle_id')) {
            $query->where('vehicle_id', $request->vehicle_id);
        }

        if ($request->filled('from_date') && $request->filled('to_date')) {
            $query->forPeriod($request->from_date, $request->to_date);
        }

        if ($request->filled('search')) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }

        $sortBy = $request->input('sort_by', 'expense_date');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->input('per_page', 15);

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:expense_categories,id',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'employee_id' => 'nullable|exists:employees,id',
            'vendor_id' => 'nullable|exists:vendors,id',
            'expense_date' => 'required|date',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'nullable|in:cash,card,bank_transfer,cheque',
            'reference_number' => 'nullable|string|max:50',
            'receipt' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'is_recurring' => 'nullable|boolean',
            'recurring_frequency' => 'nullable|in:monthly,quarterly,yearly',
            'notes' => 'nullable|string',
        ]);

        // Handle receipt upload
        if ($request->hasFile('receipt')) {
            $validated['receipt_path'] = $request->file('receipt')->store('receipts/expenses', 'public');
        }

        $validated['created_by'] = auth()->id();
        $expense = Expense::create($validated);

        AuditLog::log('created', $expense, null, $validated);

        return response()->json($expense->load(['category', 'vehicle', 'vendor']), 201);
    }

    public function show(Expense $expense)
    {
        $expense->load(['category', 'vehicle', 'employee', 'vendor', 'createdBy']);
        return response()->json($expense);
    }

    public function update(Request $request, Expense $expense)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:expense_categories,id',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'employee_id' => 'nullable|exists:employees,id',
            'vendor_id' => 'nullable|exists:vendors,id',
            'expense_date' => 'required|date',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'nullable|in:cash,card,bank_transfer,cheque',
            'reference_number' => 'nullable|string|max:50',
            'receipt' => 'nullable|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'is_recurring' => 'nullable|boolean',
            'recurring_frequency' => 'nullable|in:monthly,quarterly,yearly',
            'notes' => 'nullable|string',
        ]);

        $oldValues = $expense->toArray();

        // Handle receipt upload
        if ($request->hasFile('receipt')) {
            if ($expense->receipt_path) {
                Storage::disk('public')->delete($expense->receipt_path);
            }
            $validated['receipt_path'] = $request->file('receipt')->store('receipts/expenses', 'public');
        }

        $expense->update($validated);

        AuditLog::log('updated', $expense, $oldValues, $validated);

        return response()->json($expense->load(['category', 'vehicle', 'vendor']));
    }

    public function destroy(Expense $expense)
    {
        if ($expense->receipt_path) {
            Storage::disk('public')->delete($expense->receipt_path);
        }

        $oldValues = $expense->toArray();
        $expense->delete();

        AuditLog::log('deleted', $expense, $oldValues, null);

        return response()->json(null, 204);
    }

    public function byCategory(ExpenseCategory $category)
    {
        $expenses = $category->expenses()
            ->with(['vehicle', 'vendor'])
            ->orderBy('expense_date', 'desc')
            ->paginate(15);

        return response()->json($expenses);
    }

    public function byVehicle(Vehicle $vehicle)
    {
        $expenses = $vehicle->expenses()
            ->with(['category', 'vendor'])
            ->orderBy('expense_date', 'desc')
            ->get();

        return response()->json([
            'expenses' => $expenses,
            'total' => $expenses->sum('amount'),
        ]);
    }

    public function categories()
    {
        $categories = ExpenseCategory::active()->orderBy('name')->get();
        return response()->json($categories);
    }
}
