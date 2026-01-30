<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Alert;
use App\Models\Employee;
use App\Models\Expense;
use App\Models\Fine;
use App\Models\Income;
use App\Models\MaintenanceLog;
use App\Models\Vehicle;
use App\Models\VehicleDocument;
use App\Models\Visa;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        return response()->json([
            'fleet' => [
                'total_vehicles' => Vehicle::count(),
                'active_vehicles' => Vehicle::where('status', 'active')->count(),
                'in_maintenance' => Vehicle::where('status', 'maintenance')->count(),
                'inactive_vehicles' => Vehicle::where('status', 'inactive')->count(),
            ],
            'employees' => [
                'total_employees' => Employee::count(),
                'active_employees' => Employee::where('status', 'active')->count(),
                'drivers' => Employee::where('type', 'driver')->where('status', 'active')->count(),
            ],
            'expiries' => [
                'mulkiya_expiring_30' => VehicleDocument::where('document_type', 'mulkiya')
                    ->expiring(30)->count(),
                'visa_expiring_30' => Visa::active()->expiring(30)->count(),
                'license_expiring_30' => Employee::active()
                    ->whereBetween('license_expiry', [$now, $now->copy()->addDays(30)])->count(),
            ],
            'fines' => [
                'pending_count' => Fine::pending()->count(),
                'pending_amount' => Fine::pending()->sum('amount'),
                'this_month' => Fine::whereBetween('fine_date', [$startOfMonth, $endOfMonth])->sum('amount'),
            ],
            'maintenance' => [
                'scheduled' => MaintenanceLog::where('status', 'scheduled')->count(),
                'in_progress' => MaintenanceLog::where('status', 'in_progress')->count(),
                'this_month_cost' => MaintenanceLog::whereBetween('service_date', [$startOfMonth, $endOfMonth])
                    ->sum('total_cost'),
            ],
            'alerts' => [
                'unread_count' => Alert::unread()->count(),
                'urgent_count' => Alert::unread()->urgent()->count(),
            ],
        ]);
    }

    public function upcomingExpiries(Request $request)
    {
        $days = (int) $request->input('days', 30);

        $mulkiyaExpiring = VehicleDocument::with('vehicle')
            ->where('document_type', 'mulkiya')
            ->expiring($days)
            ->orderBy('expiry_date')
            ->get()
            ->map(fn($doc) => [
                'type' => 'Mulkiya',
                'reference' => $doc->vehicle->bus_number,
                'plate' => $doc->vehicle->plate_number,
                'expiry_date' => $doc->expiry_date->format('Y-m-d'),
                'days_left' => $doc->daysUntilExpiry(),
                'vehicle_id' => $doc->vehicle_id,
            ]);

        $insuranceExpiring = VehicleDocument::with('vehicle')
            ->where('document_type', 'insurance')
            ->expiring($days)
            ->orderBy('expiry_date')
            ->get()
            ->map(fn($doc) => [
                'type' => 'Insurance',
                'reference' => $doc->vehicle->bus_number,
                'plate' => $doc->vehicle->plate_number,
                'expiry_date' => $doc->expiry_date->format('Y-m-d'),
                'days_left' => $doc->daysUntilExpiry(),
                'vehicle_id' => $doc->vehicle_id,
            ]);

        $visaExpiring = Visa::with('employee')
            ->active()
            ->expiring($days)
            ->orderBy('expiry_date')
            ->get()
            ->map(fn($visa) => [
                'type' => 'Visa',
                'reference' => $visa->employee->name,
                'visa_number' => $visa->visa_number,
                'expiry_date' => $visa->expiry_date->format('Y-m-d'),
                'days_left' => $visa->daysUntilExpiry(),
                'employee_id' => $visa->employee_id,
            ]);

        $licenseExpiring = Employee::active()
            ->whereBetween('license_expiry', [now(), now()->addDays($days)])
            ->orderBy('license_expiry')
            ->get()
            ->map(fn($emp) => [
                'type' => 'License',
                'reference' => $emp->name,
                'license_number' => $emp->license_number,
                'expiry_date' => $emp->license_expiry->format('Y-m-d'),
                'days_left' => now()->diffInDays($emp->license_expiry, false),
                'employee_id' => $emp->id,
            ]);

        return response()->json([
            'mulkiya' => $mulkiyaExpiring,
            'insurance' => $insuranceExpiring,
            'visa' => $visaExpiring,
            'license' => $licenseExpiring,
        ]);
    }

    public function financialSummary(Request $request)
    {
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();
        $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

        $thisMonthIncome = Income::forPeriod($startOfMonth, $endOfMonth)->sum('amount');
        $thisMonthExpenses = Expense::forPeriod($startOfMonth, $endOfMonth)->sum('amount');

        $lastMonthIncome = Income::forPeriod($startOfLastMonth, $endOfLastMonth)->sum('amount');
        $lastMonthExpenses = Expense::forPeriod($startOfLastMonth, $endOfLastMonth)->sum('amount');

        $expensesByCategory = Expense::with('category')
            ->forPeriod($startOfMonth, $endOfMonth)
            ->get()
            ->groupBy('category.name')
            ->map(fn($items) => $items->sum('amount'));

        return response()->json([
            'this_month' => [
                'income' => $thisMonthIncome,
                'expenses' => $thisMonthExpenses,
                'profit' => $thisMonthIncome - $thisMonthExpenses,
            ],
            'last_month' => [
                'income' => $lastMonthIncome,
                'expenses' => $lastMonthExpenses,
                'profit' => $lastMonthIncome - $lastMonthExpenses,
            ],
            'expenses_by_category' => $expensesByCategory,
        ]);
    }

    public function alerts(Request $request)
    {
        $alerts = Alert::with('alertable')
            ->orderByRaw("FIELD(priority, 'urgent', 'high', 'medium', 'low')")
            ->orderBy('due_date')
            ->limit(20)
            ->get();

        return response()->json($alerts);
    }
}
