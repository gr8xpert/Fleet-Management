<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Customer;
use App\Models\Income;
use App\Models\IncomeCategory;
use Illuminate\Http\Request;

class IncomeController extends Controller
{
    public function index(Request $request)
    {
        $query = Income::with(['category', 'customer', 'vehicle']);

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('from_date') && $request->filled('to_date')) {
            $query->forPeriod($request->from_date, $request->to_date);
        }

        if ($request->filled('search')) {
            $query->where('description', 'like', '%' . $request->search . '%');
        }

        $sortBy = $request->input('sort_by', 'income_date');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->input('per_page', 15);

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:income_categories,id',
            'customer_id' => 'nullable|exists:customers,id',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'income_date' => 'required|date',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'nullable|in:cash,card,bank_transfer,cheque',
            'reference_number' => 'nullable|string|max:50',
            'invoice_number' => 'nullable|string|max:50',
            'status' => 'nullable|in:received,pending,partial',
            'notes' => 'nullable|string',
        ]);

        $validated['created_by'] = auth()->id();
        $income = Income::create($validated);

        AuditLog::log('created', $income, null, $validated);

        return response()->json($income->load(['category', 'customer', 'vehicle']), 201);
    }

    public function show(Income $income)
    {
        $income->load(['category', 'customer', 'vehicle', 'createdBy']);
        return response()->json($income);
    }

    public function update(Request $request, Income $income)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:income_categories,id',
            'customer_id' => 'nullable|exists:customers,id',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'income_date' => 'required|date',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'payment_method' => 'nullable|in:cash,card,bank_transfer,cheque',
            'reference_number' => 'nullable|string|max:50',
            'invoice_number' => 'nullable|string|max:50',
            'status' => 'nullable|in:received,pending,partial',
            'notes' => 'nullable|string',
        ]);

        $oldValues = $income->toArray();
        $income->update($validated);

        AuditLog::log('updated', $income, $oldValues, $validated);

        return response()->json($income->load(['category', 'customer', 'vehicle']));
    }

    public function destroy(Income $income)
    {
        $oldValues = $income->toArray();
        $income->delete();

        AuditLog::log('deleted', $income, $oldValues, null);

        return response()->json(null, 204);
    }

    public function byCustomer(Customer $customer)
    {
        $income = $customer->income()
            ->with(['category', 'vehicle'])
            ->orderBy('income_date', 'desc')
            ->get();

        return response()->json([
            'income' => $income,
            'total_received' => $income->where('status', 'received')->sum('amount'),
            'total_pending' => $income->whereIn('status', ['pending', 'partial'])->sum('amount'),
        ]);
    }

    public function categories()
    {
        $categories = IncomeCategory::active()->orderBy('name')->get();
        return response()->json($categories);
    }
}
