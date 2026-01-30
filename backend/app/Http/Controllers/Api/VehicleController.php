<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Vehicle;
use App\Models\VehicleTransfer;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index(Request $request)
    {
        $query = Vehicle::with(['mulkiya', 'insurance']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('bus_number', 'like', "%{$search}%")
                    ->orWhere('plate_number', 'like', "%{$search}%")
                    ->orWhere('owner_name', 'like', "%{$search}%");
            });
        }

        $sortBy = $request->input('sort_by', 'bus_number');
        $sortOrder = $request->input('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->input('per_page', 15);

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'bus_number' => 'required|string|max:50|unique:vehicles',
            'plate_number' => 'required|string|max:50|unique:vehicles',
            'plate_code' => 'nullable|string|max:10',
            'chassis_number' => 'nullable|string|max:50',
            'engine_number' => 'nullable|string|max:50',
            'type' => 'required|in:bus,minibus,coaster,van,other',
            'make' => 'nullable|string|max:50',
            'model' => 'nullable|string|max:50',
            'year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'seating_capacity' => 'nullable|integer|min:1|max:100',
            'color' => 'nullable|string|max:30',
            'owner_name' => 'nullable|string|max:100',
            'owner_contact' => 'nullable|string|max:50',
            'purchase_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,inactive,maintenance,sold,scrapped',
            'current_km' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        $vehicle = Vehicle::create($validated);

        AuditLog::log('created', $vehicle, null, $validated);

        return response()->json($vehicle, 201);
    }

    public function show(Vehicle $vehicle)
    {
        $vehicle->load(['documents', 'mulkiya', 'insurance', 'maintenanceLogs' => function ($q) {
            $q->latest('service_date')->limit(5);
        }]);

        return response()->json($vehicle);
    }

    public function update(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'bus_number' => 'required|string|max:50|unique:vehicles,bus_number,' . $vehicle->id,
            'plate_number' => 'required|string|max:50|unique:vehicles,plate_number,' . $vehicle->id,
            'plate_code' => 'nullable|string|max:10',
            'chassis_number' => 'nullable|string|max:50',
            'engine_number' => 'nullable|string|max:50',
            'type' => 'required|in:bus,minibus,coaster,van,other',
            'make' => 'nullable|string|max:50',
            'model' => 'nullable|string|max:50',
            'year' => 'nullable|integer|min:1900|max:' . (date('Y') + 1),
            'seating_capacity' => 'nullable|integer|min:1|max:100',
            'color' => 'nullable|string|max:30',
            'owner_name' => 'nullable|string|max:100',
            'owner_contact' => 'nullable|string|max:50',
            'purchase_date' => 'nullable|date',
            'purchase_price' => 'nullable|numeric|min:0',
            'status' => 'nullable|in:active,inactive,maintenance,sold,scrapped',
            'current_km' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        $oldValues = $vehicle->toArray();
        $vehicle->update($validated);

        AuditLog::log('updated', $vehicle, $oldValues, $validated);

        return response()->json($vehicle);
    }

    public function destroy(Vehicle $vehicle)
    {
        $oldValues = $vehicle->toArray();
        $vehicle->delete();

        AuditLog::log('deleted', $vehicle, $oldValues, null);

        return response()->json(null, 204);
    }

    public function history(Vehicle $vehicle)
    {
        $transfers = $vehicle->transfers()->orderBy('transfer_date', 'desc')->get();
        $maintenance = $vehicle->maintenanceLogs()->orderBy('service_date', 'desc')->get();
        $documents = $vehicle->documents()->orderBy('expiry_date', 'desc')->get();

        return response()->json([
            'transfers' => $transfers,
            'maintenance' => $maintenance,
            'documents' => $documents,
        ]);
    }

    public function transfer(Request $request, Vehicle $vehicle)
    {
        $validated = $request->validate([
            'to_owner' => 'required|string|max:100',
            'transfer_date' => 'required|date',
            'transfer_amount' => 'nullable|numeric|min:0',
            'new_plate_number' => 'nullable|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $transfer = VehicleTransfer::create([
            'vehicle_id' => $vehicle->id,
            'from_owner' => $vehicle->owner_name,
            'to_owner' => $validated['to_owner'],
            'transfer_date' => $validated['transfer_date'],
            'transfer_amount' => $validated['transfer_amount'],
            'old_plate_number' => $vehicle->plate_number,
            'new_plate_number' => $validated['new_plate_number'],
            'notes' => $validated['notes'],
        ]);

        // Update vehicle owner and plate
        $vehicle->update([
            'owner_name' => $validated['to_owner'],
            'plate_number' => $validated['new_plate_number'] ?? $vehicle->plate_number,
        ]);

        AuditLog::log('transferred', $vehicle, null, $validated);

        return response()->json($transfer, 201);
    }
}
