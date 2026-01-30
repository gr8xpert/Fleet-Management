<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Cheque;
use Illuminate\Http\Request;

class ChequeController extends Controller
{
    public function index(Request $request)
    {
        $query = Cheque::with(['customer', 'vendor']);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('from_date') && $request->has('to_date')) {
            $query->whereBetween('cheque_date', [$request->from_date, $request->to_date]);
        }

        $sortBy = $request->input('sort_by', 'cheque_date');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->input('per_page', 15);

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:issued,received',
            'cheque_number' => 'required|string|max:30',
            'bank_name' => 'required|string|max:100',
            'account_number' => 'nullable|string|max:30',
            'amount' => 'required|numeric|min:0',
            'cheque_date' => 'required|date',
            'deposit_date' => 'nullable|date',
            'customer_id' => 'nullable|exists:customers,id',
            'vendor_id' => 'nullable|exists:vendors,id',
            'payee_name' => 'nullable|string|max:100',
            'purpose' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
        ]);

        $cheque = Cheque::create($validated);

        AuditLog::log('created', $cheque, null, $validated);

        return response()->json($cheque->load(['customer', 'vendor']), 201);
    }

    public function show(Cheque $cheque)
    {
        $cheque->load(['customer', 'vendor']);
        return response()->json($cheque);
    }

    public function update(Request $request, Cheque $cheque)
    {
        $validated = $request->validate([
            'type' => 'required|in:issued,received',
            'cheque_number' => 'required|string|max:30',
            'bank_name' => 'required|string|max:100',
            'account_number' => 'nullable|string|max:30',
            'amount' => 'required|numeric|min:0',
            'cheque_date' => 'required|date',
            'deposit_date' => 'nullable|date',
            'customer_id' => 'nullable|exists:customers,id',
            'vendor_id' => 'nullable|exists:vendors,id',
            'payee_name' => 'nullable|string|max:100',
            'purpose' => 'nullable|string|max:255',
            'status' => 'nullable|in:pending,cleared,bounced,cancelled,replaced',
            'notes' => 'nullable|string',
        ]);

        $oldValues = $cheque->toArray();
        $cheque->update($validated);

        AuditLog::log('updated', $cheque, $oldValues, $validated);

        return response()->json($cheque->load(['customer', 'vendor']));
    }

    public function destroy(Cheque $cheque)
    {
        $oldValues = $cheque->toArray();
        $cheque->delete();

        AuditLog::log('deleted', $cheque, $oldValues, null);

        return response()->json(null, 204);
    }

    public function pending()
    {
        $cheques = Cheque::with(['customer', 'vendor'])
            ->pending()
            ->orderBy('cheque_date')
            ->get();

        return response()->json([
            'cheques' => $cheques,
            'received_pending' => $cheques->where('type', 'received')->sum('amount'),
            'issued_pending' => $cheques->where('type', 'issued')->sum('amount'),
        ]);
    }

    public function clear(Request $request, Cheque $cheque)
    {
        $validated = $request->validate([
            'clearance_date' => 'nullable|date',
        ]);

        $oldValues = $cheque->toArray();

        $cheque->update([
            'status' => 'cleared',
            'clearance_date' => $validated['clearance_date'] ?? now(),
        ]);

        AuditLog::log('cleared', $cheque, $oldValues, $validated);

        return response()->json($cheque);
    }

    public function bounce(Request $request, Cheque $cheque)
    {
        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        $oldValues = $cheque->toArray();

        $cheque->update([
            'status' => 'bounced',
            'notes' => $cheque->notes . "\nBounced: " . ($validated['notes'] ?? 'No reason provided'),
        ]);

        AuditLog::log('bounced', $cheque, $oldValues, $validated);

        return response()->json($cheque);
    }
}
