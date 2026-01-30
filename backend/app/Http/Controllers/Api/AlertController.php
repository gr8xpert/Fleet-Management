<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    public function index(Request $request)
    {
        $query = Alert::with('alertable');

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->boolean('unread_only')) {
            $query->unread();
        }

        $query->orderByRaw("FIELD(priority, 'urgent', 'high', 'medium', 'low')")
            ->orderBy('due_date')
            ->orderBy('created_at', 'desc');

        $perPage = $request->input('per_page', 20);

        return response()->json($query->paginate($perPage));
    }

    public function unread()
    {
        $alerts = Alert::with('alertable')
            ->unread()
            ->orderByRaw("FIELD(priority, 'urgent', 'high', 'medium', 'low')")
            ->orderBy('due_date')
            ->limit(50)
            ->get();

        return response()->json([
            'alerts' => $alerts,
            'count' => $alerts->count(),
            'urgent_count' => $alerts->whereIn('priority', ['high', 'urgent'])->count(),
        ]);
    }

    public function markAsRead(Alert $alert)
    {
        $alert->update(['is_read' => true]);
        return response()->json($alert);
    }

    public function markAllAsRead()
    {
        Alert::unread()->update(['is_read' => true]);

        return response()->json([
            'message' => 'All alerts marked as read',
        ]);
    }

    public function destroy(Alert $alert)
    {
        $alert->delete();
        return response()->json(null, 204);
    }
}
