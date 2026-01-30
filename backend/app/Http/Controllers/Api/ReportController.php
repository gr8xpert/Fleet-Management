<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Employee;
use App\Models\Expense;
use App\Models\Fine;
use App\Models\Income;
use App\Models\MaintenanceLog;
use App\Models\Salary;
use App\Models\Vehicle;
use App\Models\VehicleDocument;
use App\Models\Visa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function financial(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->endOfMonth()->format('Y-m-d'));

        $income = Income::forPeriod($startDate, $endDate)->get();
        $expenses = Expense::forPeriod($startDate, $endDate)->get();

        $incomeByCategory = $income->groupBy('category.name')
            ->map(fn($items) => $items->sum('amount'));

        $expensesByCategory = $expenses->groupBy('category.name')
            ->map(fn($items) => $items->sum('amount'));

        $totalIncome = $income->sum('amount');
        $totalExpenses = $expenses->sum('amount');

        // Monthly breakdown
        $monthlyData = [];
        $period = new \DatePeriod(
            new \DateTime($startDate),
            new \DateInterval('P1M'),
            new \DateTime($endDate)
        );

        foreach ($period as $date) {
            $monthStart = $date->format('Y-m-01');
            $monthEnd = $date->format('Y-m-t');

            $monthlyData[] = [
                'month' => $date->format('M Y'),
                'income' => Income::forPeriod($monthStart, $monthEnd)->sum('amount'),
                'expenses' => Expense::forPeriod($monthStart, $monthEnd)->sum('amount'),
            ];
        }

        return response()->json([
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
            'summary' => [
                'total_income' => $totalIncome,
                'total_expenses' => $totalExpenses,
                'net_profit' => $totalIncome - $totalExpenses,
            ],
            'income_by_category' => $incomeByCategory,
            'expenses_by_category' => $expensesByCategory,
            'monthly_breakdown' => $monthlyData,
        ]);
    }

    public function fleet(Request $request)
    {
        $vehicles = Vehicle::withCount([
            'maintenanceLogs',
            'fines',
        ])->get();

        $vehicleStats = $vehicles->map(function ($vehicle) {
            $maintenanceCost = $vehicle->maintenanceLogs()->sum('total_cost');
            $fineAmount = $vehicle->fines()->sum('amount');
            $expenses = $vehicle->expenses()->sum('amount');

            return [
                'id' => $vehicle->id,
                'bus_number' => $vehicle->bus_number,
                'plate_number' => $vehicle->plate_number,
                'type' => $vehicle->type,
                'status' => $vehicle->status,
                'current_km' => $vehicle->current_km,
                'maintenance_count' => $vehicle->maintenance_logs_count,
                'maintenance_cost' => $maintenanceCost,
                'fine_count' => $vehicle->fines_count,
                'fine_amount' => $fineAmount,
                'total_expenses' => $expenses,
                'total_cost' => $maintenanceCost + $fineAmount + $expenses,
            ];
        });

        return response()->json([
            'summary' => [
                'total_vehicles' => $vehicles->count(),
                'active' => $vehicles->where('status', 'active')->count(),
                'in_maintenance' => $vehicles->where('status', 'maintenance')->count(),
                'inactive' => $vehicles->where('status', 'inactive')->count(),
            ],
            'vehicles' => $vehicleStats,
            'by_type' => $vehicles->groupBy('type')->map->count(),
        ]);
    }

    public function hr(Request $request)
    {
        $year = $request->input('year', now()->year);
        $month = $request->input('month');

        $employees = Employee::active()->get();

        $salaryQuery = Salary::where('year', $year);
        if ($month) {
            $salaryQuery->where('month', $month);
        }
        $salaries = $salaryQuery->get();

        $salaryByMonth = $salaries->groupBy('month')->map(function ($items) {
            return [
                'total' => $items->sum('net_salary'),
                'paid' => $items->where('status', 'paid')->sum('net_salary'),
                'pending' => $items->where('status', 'pending')->sum('net_salary'),
            ];
        });

        return response()->json([
            'summary' => [
                'total_employees' => Employee::count(),
                'active' => $employees->count(),
                'by_type' => $employees->groupBy('type')->map->count(),
            ],
            'salary_summary' => [
                'year' => $year,
                'total_paid' => $salaries->where('status', 'paid')->sum('net_salary'),
                'total_pending' => $salaries->where('status', 'pending')->sum('net_salary'),
                'by_month' => $salaryByMonth,
            ],
        ]);
    }

    public function expiries(Request $request)
    {
        $days = $request->input('days', 90);

        $mulkiyaExpiring = VehicleDocument::with('vehicle')
            ->where('document_type', 'mulkiya')
            ->where('is_active', true)
            ->where('expiry_date', '<=', now()->addDays($days))
            ->orderBy('expiry_date')
            ->get();

        $insuranceExpiring = VehicleDocument::with('vehicle')
            ->where('document_type', 'insurance')
            ->where('is_active', true)
            ->where('expiry_date', '<=', now()->addDays($days))
            ->orderBy('expiry_date')
            ->get();

        $visaExpiring = Visa::with('employee')
            ->where('status', 'active')
            ->where('expiry_date', '<=', now()->addDays($days))
            ->orderBy('expiry_date')
            ->get();

        $licenseExpiring = Employee::active()
            ->whereNotNull('license_expiry')
            ->where('license_expiry', '<=', now()->addDays($days))
            ->orderBy('license_expiry')
            ->get();

        $passportExpiring = Employee::active()
            ->whereNotNull('passport_expiry')
            ->where('passport_expiry', '<=', now()->addDays($days))
            ->orderBy('passport_expiry')
            ->get();

        return response()->json([
            'mulkiya' => $mulkiyaExpiring,
            'insurance' => $insuranceExpiring,
            'visa' => $visaExpiring,
            'license' => $licenseExpiring,
            'passport' => $passportExpiring,
            'summary' => [
                'mulkiya_count' => $mulkiyaExpiring->count(),
                'insurance_count' => $insuranceExpiring->count(),
                'visa_count' => $visaExpiring->count(),
                'license_count' => $licenseExpiring->count(),
                'passport_count' => $passportExpiring->count(),
            ],
        ]);
    }

    public function fines(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfYear()->format('Y-m-d'));
        $endDate = $request->input('end_date', now()->format('Y-m-d'));

        $fines = Fine::with(['vehicle', 'driver'])
            ->whereBetween('fine_date', [$startDate, $endDate])
            ->get();

        $byVehicle = $fines->groupBy('vehicle_id')->map(function ($items, $vehicleId) {
            $vehicle = $items->first()->vehicle;
            return [
                'vehicle' => $vehicle ? [
                    'id' => $vehicle->id,
                    'bus_number' => $vehicle->bus_number,
                    'plate_number' => $vehicle->plate_number,
                ] : null,
                'count' => $items->count(),
                'total' => $items->sum('amount'),
            ];
        })->sortByDesc('total')->values();

        $byDriver = $fines->groupBy('driver_id')->filter(fn($items, $id) => $id !== null)
            ->map(function ($items, $driverId) {
                $driver = $items->first()->driver;
                return [
                    'driver' => $driver ? [
                        'id' => $driver->id,
                        'name' => $driver->name,
                    ] : null,
                    'count' => $items->count(),
                    'total' => $items->sum('amount'),
                    'black_points' => $items->sum('black_points'),
                ];
            })->sortByDesc('total')->values();

        $byType = $fines->groupBy('type')->map(fn($items) => [
            'count' => $items->count(),
            'total' => $items->sum('amount'),
        ]);

        return response()->json([
            'period' => [
                'start' => $startDate,
                'end' => $endDate,
            ],
            'summary' => [
                'total_count' => $fines->count(),
                'total_amount' => $fines->sum('amount'),
                'paid' => $fines->where('status', 'paid')->sum('amount'),
                'pending' => $fines->where('status', 'pending')->sum('amount'),
            ],
            'by_vehicle' => $byVehicle,
            'by_driver' => $byDriver,
            'by_type' => $byType,
        ]);
    }

    public function export(Request $request, string $type)
    {
        // This would generate PDF/Excel exports
        // For now, return data that can be used for export
        return response()->json([
            'message' => 'Export functionality - implement with maatwebsite/excel or barryvdh/laravel-dompdf',
            'type' => $type,
        ]);
    }
}
