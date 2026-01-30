<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $query = Customer::query();

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('company_name', 'like', "%{$search}%")
                    ->orWhere('contact_person', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('active_only', true)) {
            $query->active();
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
            'name' => 'required|string|max:100',
            'company_name' => 'nullable|string|max:100',
            'contact_person' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:100',
            'phone' => 'nullable|string|max:20',
            'phone_alternate' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'trn_number' => 'nullable|string|max:20',
            'type' => 'required|in:corporate,individual,school,tour_operator,other',
            'credit_limit' => 'nullable|numeric|min:0',
            'payment_terms' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        $customer = Customer::create($validated);

        AuditLog::log('created', $customer, null, $validated);

        return response()->json($customer, 201);
    }

    public function show(Customer $customer)
    {
        $customer->load(['income' => function ($q) {
            $q->latest('income_date')->limit(10);
        }, 'cheques' => function ($q) {
            $q->latest('cheque_date')->limit(10);
        }]);

        $customer->total_revenue = $customer->income->sum('amount');
        $customer->outstanding_amount = $customer->income
            ->whereIn('status', ['pending', 'partial'])
            ->sum('amount');

        return response()->json($customer);
    }

    public function update(Request $request, Customer $customer)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'company_name' => 'nullable|string|max:100',
            'contact_person' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:100',
            'phone' => 'nullable|string|max:20',
            'phone_alternate' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'trn_number' => 'nullable|string|max:20',
            'type' => 'required|in:corporate,individual,school,tour_operator,other',
            'credit_limit' => 'nullable|numeric|min:0',
            'payment_terms' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'notes' => 'nullable|string',
        ]);

        $oldValues = $customer->toArray();
        $customer->update($validated);

        AuditLog::log('updated', $customer, $oldValues, $validated);

        return response()->json($customer);
    }

    public function destroy(Customer $customer)
    {
        $oldValues = $customer->toArray();
        $customer->delete();

        AuditLog::log('deleted', $customer, $oldValues, null);

        return response()->json(null, 204);
    }

    public function invoices(Customer $customer)
    {
        $invoices = $customer->income()
            ->with('category')
            ->orderBy('income_date', 'desc')
            ->get();

        return response()->json($invoices);
    }

    public function payments(Customer $customer)
    {
        $payments = $customer->income()
            ->where('status', 'received')
            ->orderBy('income_date', 'desc')
            ->get();

        $cheques = $customer->cheques()
            ->where('type', 'received')
            ->orderBy('cheque_date', 'desc')
            ->get();

        return response()->json([
            'payments' => $payments,
            'cheques' => $cheques,
        ]);
    }
}
