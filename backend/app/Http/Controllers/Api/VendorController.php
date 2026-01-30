<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Vendor;
use Illuminate\Http\Request;

class VendorController extends Controller
{
    public function index(Request $request)
    {
        $query = Vendor::query();

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('contact_person', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('active_only', true)) {
            $query->active();
        }

        $query->orderBy('name');

        $perPage = $request->input('per_page', 15);

        return response()->json($query->paginate($perPage));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'contact_person' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'address' => 'nullable|string',
            'type' => 'required|in:parts,service,tyres,fuel,other',
            'notes' => 'nullable|string',
        ]);

        $vendor = Vendor::create($validated);

        AuditLog::log('created', $vendor, null, $validated);

        return response()->json($vendor, 201);
    }

    public function show(Vendor $vendor)
    {
        $vendor->load(['spareParts', 'maintenanceLogs' => function ($q) {
            $q->latest('service_date')->limit(10);
        }]);

        return response()->json($vendor);
    }

    public function update(Request $request, Vendor $vendor)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'contact_person' => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:100',
            'address' => 'nullable|string',
            'type' => 'required|in:parts,service,tyres,fuel,other',
            'notes' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $oldValues = $vendor->toArray();
        $vendor->update($validated);

        AuditLog::log('updated', $vendor, $oldValues, $validated);

        return response()->json($vendor);
    }

    public function destroy(Vendor $vendor)
    {
        $oldValues = $vendor->toArray();
        $vendor->update(['is_active' => false]);

        AuditLog::log('deactivated', $vendor, $oldValues, ['is_active' => false]);

        return response()->json(null, 204);
    }
}
