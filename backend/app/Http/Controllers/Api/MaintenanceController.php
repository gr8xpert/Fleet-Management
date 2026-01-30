<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\MaintenanceLog;
use App\Models\Vehicle;
use Illuminate\Http\Request;

class MaintenanceController extends Controller
{
    public function index(Request $request)
    {
        $query = MaintenanceLog::with(['vehicle', 'vendor']);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('vehicle_id')) {
            $query->where('vehicle_id', $request->vehicle_id);
        }

        if ($request->has('from_date') && $request->has('to_date')) {
            $query->whereBetween('service_date', [$request->from_date, $request->to_date]);
        }

        $sortBy = $request->input('sort_by', 'service_date');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->input('per_page', 15);

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'type' => 'required|in:oil_change,ac_cleaning,ac_repair,battery,tyre,brake,engine,transmission,electrical,body_work,general_service,inspection,other',
            'service_date' => 'required|date',
            'km_at_service' => 'nullable|integer|min:0',
            'next_service_km' => 'nullable|integer|min:0',
            'next_service_date' => 'nullable|date',
            'description' => 'nullable|string',
            'parts_cost' => 'nullable|numeric|min:0',
            'labor_cost' => 'nullable|numeric|min:0',
            'vendor_id' => 'nullable|exists:vendors,id',
            'status' => 'nullable|in:scheduled,in_progress,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        $validated['created_by'] = auth()->id();
        $validated['parts_cost'] = $validated['parts_cost'] ?? 0;
        $validated['labor_cost'] = $validated['labor_cost'] ?? 0;

        $maintenance = MaintenanceLog::create($validated);

        // Update vehicle current_km if provided
        if (!empty($validated['km_at_service'])) {
            Vehicle::where('id', $validated['vehicle_id'])
                ->where('current_km', '<', $validated['km_at_service'])
                ->update(['current_km' => $validated['km_at_service']]);
        }

        AuditLog::log('created', $maintenance, null, $validated);

        return response()->json($maintenance->load(['vehicle', 'vendor']), 201);
    }

    public function show(MaintenanceLog $maintenance)
    {
        $maintenance->load(['vehicle', 'vendor', 'createdBy']);
        return response()->json($maintenance);
    }

    public function update(Request $request, MaintenanceLog $maintenance)
    {
        $validated = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'type' => 'required|in:oil_change,ac_cleaning,ac_repair,battery,tyre,brake,engine,transmission,electrical,body_work,general_service,inspection,other',
            'service_date' => 'required|date',
            'km_at_service' => 'nullable|integer|min:0',
            'next_service_km' => 'nullable|integer|min:0',
            'next_service_date' => 'nullable|date',
            'description' => 'nullable|string',
            'parts_cost' => 'nullable|numeric|min:0',
            'labor_cost' => 'nullable|numeric|min:0',
            'vendor_id' => 'nullable|exists:vendors,id',
            'status' => 'nullable|in:scheduled,in_progress,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        $oldValues = $maintenance->toArray();
        $maintenance->update($validated);

        AuditLog::log('updated', $maintenance, $oldValues, $validated);

        return response()->json($maintenance->load(['vehicle', 'vendor']));
    }

    public function destroy(MaintenanceLog $maintenance)
    {
        $oldValues = $maintenance->toArray();
        $maintenance->delete();

        AuditLog::log('deleted', $maintenance, $oldValues, null);

        return response()->json(null, 204);
    }

    public function byVehicle(Vehicle $vehicle)
    {
        $logs = $vehicle->maintenanceLogs()
            ->with('vendor')
            ->orderBy('service_date', 'desc')
            ->get();

        return response()->json($logs);
    }

    public function scheduled()
    {
        $scheduled = MaintenanceLog::with(['vehicle', 'vendor'])
            ->where('status', 'scheduled')
            ->orderBy('next_service_date')
            ->get();

        return response()->json($scheduled);
    }

    public function complete(Request $request, MaintenanceLog $maintenance)
    {
        $validated = $request->validate([
            'km_at_service' => 'nullable|integer|min:0',
            'parts_cost' => 'nullable|numeric|min:0',
            'labor_cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $oldValues = $maintenance->toArray();

        $maintenance->update([
            'status' => 'completed',
            'service_date' => now(),
            'km_at_service' => $validated['km_at_service'] ?? $maintenance->km_at_service,
            'parts_cost' => $validated['parts_cost'] ?? $maintenance->parts_cost,
            'labor_cost' => $validated['labor_cost'] ?? $maintenance->labor_cost,
            'notes' => $validated['notes'] ?? $maintenance->notes,
        ]);

        AuditLog::log('completed', $maintenance, $oldValues, $validated);

        return response()->json($maintenance);
    }
}
