<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\SparePart;
use App\Models\SparePartLog;
use Illuminate\Http\Request;

class SparePartController extends Controller
{
    public function index(Request $request)
    {
        $query = SparePart::with('vendor');

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('part_number', 'like', "%{$search}%");
            });
        }

        if ($request->boolean('low_stock')) {
            $query->lowStock();
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
            'part_number' => 'nullable|string|max:50',
            'category' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'quantity' => 'nullable|integer|min:0',
            'min_quantity' => 'nullable|integer|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'location' => 'nullable|string|max:100',
            'vendor_id' => 'nullable|exists:vendors,id',
        ]);

        $sparePart = SparePart::create($validated);

        // Create initial stock log if quantity > 0
        if (!empty($validated['quantity']) && $validated['quantity'] > 0) {
            SparePartLog::create([
                'spare_part_id' => $sparePart->id,
                'type' => 'in',
                'quantity' => $validated['quantity'],
                'balance_after' => $validated['quantity'],
                'notes' => 'Initial stock',
                'user_id' => auth()->id(),
            ]);
        }

        AuditLog::log('created', $sparePart, null, $validated);

        return response()->json($sparePart->load('vendor'), 201);
    }

    public function show(SparePart $sparePart)
    {
        $sparePart->load(['vendor', 'logs' => function ($q) {
            $q->with(['vehicle', 'user'])->latest()->limit(20);
        }]);

        return response()->json($sparePart);
    }

    public function update(Request $request, SparePart $sparePart)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'part_number' => 'nullable|string|max:50',
            'category' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'min_quantity' => 'nullable|integer|min:0',
            'unit_price' => 'nullable|numeric|min:0',
            'location' => 'nullable|string|max:100',
            'vendor_id' => 'nullable|exists:vendors,id',
            'is_active' => 'nullable|boolean',
        ]);

        $oldValues = $sparePart->toArray();
        $sparePart->update($validated);

        AuditLog::log('updated', $sparePart, $oldValues, $validated);

        return response()->json($sparePart->load('vendor'));
    }

    public function destroy(SparePart $sparePart)
    {
        $oldValues = $sparePart->toArray();
        $sparePart->delete();

        AuditLog::log('deleted', $sparePart, $oldValues, null);

        return response()->json(null, 204);
    }

    public function lowStock()
    {
        $parts = SparePart::with('vendor')
            ->lowStock()
            ->active()
            ->orderBy('quantity')
            ->get();

        return response()->json($parts);
    }

    public function adjustStock(Request $request, SparePart $sparePart)
    {
        $validated = $request->validate([
            'type' => 'required|in:in,out,adjustment',
            'quantity' => 'required|integer|min:1',
            'vehicle_id' => 'nullable|exists:vehicles,id',
            'notes' => 'nullable|string',
        ]);

        $currentQty = $sparePart->quantity;

        if ($validated['type'] === 'in') {
            $newQty = $currentQty + $validated['quantity'];
        } elseif ($validated['type'] === 'out') {
            if ($validated['quantity'] > $currentQty) {
                return response()->json([
                    'message' => 'Insufficient stock',
                    'current_quantity' => $currentQty,
                ], 422);
            }
            $newQty = $currentQty - $validated['quantity'];
        } else {
            // Adjustment - set to absolute value
            $newQty = $validated['quantity'];
            $validated['quantity'] = $newQty - $currentQty; // Record the difference
        }

        $sparePart->update(['quantity' => $newQty]);

        $log = SparePartLog::create([
            'spare_part_id' => $sparePart->id,
            'type' => $validated['type'],
            'quantity' => abs($validated['quantity']),
            'balance_after' => $newQty,
            'vehicle_id' => $validated['vehicle_id'],
            'notes' => $validated['notes'],
            'user_id' => auth()->id(),
        ]);

        return response()->json([
            'spare_part' => $sparePart->fresh(),
            'log' => $log,
        ]);
    }
}
