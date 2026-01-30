<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Employee;
use App\Models\Fine;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class FineController extends Controller
{
    public function index(Request $request)
    {
        $query = Fine::with(['vehicle', 'driver']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('vehicle_id')) {
            $query->where('vehicle_id', $request->vehicle_id);
        }

        if ($request->has('driver_id')) {
            $query->where('driver_id', $request->driver_id);
        }

        if ($request->has('from_date') && $request->has('to_date')) {
            $query->whereBetween('fine_date', [$request->from_date, $request->to_date]);
        }

        $sortBy = $request->input('sort_by', 'fine_date');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->input('per_page', 15);

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'driver_id' => 'nullable|exists:employees,id',
            'fine_number' => 'nullable|string|max:50',
            'type' => 'required|in:traffic,parking,speeding,signal,salik,rta,municipality,other',
            'violation_description' => 'nullable|string|max:255',
            'amount' => 'required|numeric|min:0',
            'black_points' => 'nullable|integer|min:0',
            'fine_date' => 'required|date',
            'due_date' => 'nullable|date',
            'location' => 'nullable|string|max:255',
            'status' => 'nullable|in:pending,paid,disputed,waived',
            'notes' => 'nullable|string',
        ]);

        $fine = Fine::create($validated);

        AuditLog::log('created', $fine, null, $validated);

        return response()->json($fine->load(['vehicle', 'driver']), 201);
    }

    public function show(Fine $fine)
    {
        $fine->load(['vehicle', 'driver']);
        return response()->json($fine);
    }

    public function update(Request $request, Fine $fine)
    {
        $validated = $request->validate([
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'driver_id' => 'nullable|exists:employees,id',
            'fine_number' => 'nullable|string|max:50',
            'type' => 'required|in:traffic,parking,speeding,signal,salik,rta,municipality,other',
            'violation_description' => 'nullable|string|max:255',
            'amount' => 'required|numeric|min:0',
            'black_points' => 'nullable|integer|min:0',
            'fine_date' => 'required|date',
            'due_date' => 'nullable|date',
            'location' => 'nullable|string|max:255',
            'status' => 'nullable|in:pending,paid,disputed,waived',
            'notes' => 'nullable|string',
        ]);

        $oldValues = $fine->toArray();
        $fine->update($validated);

        AuditLog::log('updated', $fine, $oldValues, $validated);

        return response()->json($fine->load(['vehicle', 'driver']));
    }

    public function destroy(Fine $fine)
    {
        $oldValues = $fine->toArray();
        $fine->delete();

        AuditLog::log('deleted', $fine, $oldValues, null);

        return response()->json(null, 204);
    }

    public function byVehicle(Vehicle $vehicle)
    {
        $fines = $vehicle->fines()
            ->with('driver')
            ->orderBy('fine_date', 'desc')
            ->get();

        return response()->json([
            'fines' => $fines,
            'total_pending' => $fines->where('status', 'pending')->sum('amount'),
            'total_paid' => $fines->where('status', 'paid')->sum('amount'),
        ]);
    }

    public function byDriver(Employee $employee)
    {
        $fines = $employee->fines()
            ->with('vehicle')
            ->orderBy('fine_date', 'desc')
            ->get();

        return response()->json([
            'fines' => $fines,
            'total_pending' => $fines->where('status', 'pending')->sum('amount'),
            'total_paid' => $fines->where('status', 'paid')->sum('amount'),
            'total_black_points' => $fines->sum('black_points'),
        ]);
    }

    public function pending()
    {
        $fines = Fine::with(['vehicle', 'driver'])
            ->pending()
            ->orderBy('due_date')
            ->get();

        return response()->json([
            'fines' => $fines,
            'total_amount' => $fines->sum('amount'),
            'overdue_count' => $fines->filter(fn($f) => $f->due_date && $f->due_date->isPast())->count(),
        ]);
    }

    public function markAsPaid(Request $request, Fine $fine)
    {
        $validated = $request->validate([
            'payment_date' => 'nullable|date',
            'paid_by' => 'nullable|in:company,driver',
        ]);

        $oldValues = $fine->toArray();

        $fine->update([
            'status' => 'paid',
            'payment_date' => $validated['payment_date'] ?? now(),
            'paid_by' => $validated['paid_by'] ?? 'company',
        ]);

        AuditLog::log('paid', $fine, $oldValues, $validated);

        return response()->json($fine);
    }

    public function assignToDriver(Request $request, Fine $fine)
    {
        $validated = $request->validate([
            'driver_id' => 'required|exists:employees,id',
        ]);

        $oldValues = $fine->toArray();
        $fine->update(['driver_id' => $validated['driver_id']]);

        AuditLog::log('assigned', $fine, $oldValues, $validated);

        return response()->json($fine->load('driver'));
    }
}
