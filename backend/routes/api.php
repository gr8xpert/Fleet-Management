<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\VehicleDocumentController;
use App\Http\Controllers\Api\MaintenanceController;
use App\Http\Controllers\Api\SparePartController;
use App\Http\Controllers\Api\VendorController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\SalaryController;
use App\Http\Controllers\Api\VisaController;
use App\Http\Controllers\Api\FineController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\IncomeController;
use App\Http\Controllers\Api\ChequeController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\AlertController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\UserController;

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/expiries', [DashboardController::class, 'upcomingExpiries']);
    Route::get('/dashboard/summary', [DashboardController::class, 'financialSummary']);
    Route::get('/dashboard/alerts', [DashboardController::class, 'alerts']);

    // Vehicles
    Route::apiResource('vehicles', VehicleController::class);
    Route::get('/vehicles/{vehicle}/history', [VehicleController::class, 'history']);
    Route::post('/vehicles/{vehicle}/transfer', [VehicleController::class, 'transfer']);

    // Vehicle Documents (Mulkiya, Registration, etc.)
    Route::apiResource('vehicles.documents', VehicleDocumentController::class)->shallow();
    Route::get('/documents/expiring', [VehicleDocumentController::class, 'expiring']);

    // Maintenance
    Route::apiResource('maintenance', MaintenanceController::class);
    Route::get('/maintenance/vehicle/{vehicle}', [MaintenanceController::class, 'byVehicle']);
    Route::get('/maintenance/scheduled', [MaintenanceController::class, 'scheduled']);
    Route::post('/maintenance/{maintenance}/complete', [MaintenanceController::class, 'complete']);

    // Spare Parts
    Route::apiResource('spare-parts', SparePartController::class);
    Route::get('/spare-parts/low-stock', [SparePartController::class, 'lowStock']);
    Route::post('/spare-parts/{sparePart}/adjust', [SparePartController::class, 'adjustStock']);

    // Vendors
    Route::apiResource('vendors', VendorController::class);

    // Employees
    Route::apiResource('employees', EmployeeController::class);
    Route::get('/employees/drivers', [EmployeeController::class, 'drivers']);
    Route::get('/employees/{employee}/fines', [EmployeeController::class, 'fines']);
    Route::get('/employees/{employee}/attendance', [EmployeeController::class, 'attendance']);

    // Salaries
    Route::apiResource('salaries', SalaryController::class);
    Route::get('/salaries/employee/{employee}', [SalaryController::class, 'byEmployee']);
    Route::post('/salaries/generate-monthly', [SalaryController::class, 'generateMonthly']);
    Route::post('/salaries/{salary}/pay', [SalaryController::class, 'markAsPaid']);

    // Salary Advances
    Route::get('/salary-advances', [SalaryController::class, 'advances']);
    Route::post('/salary-advances', [SalaryController::class, 'createAdvance']);
    Route::put('/salary-advances/{advance}', [SalaryController::class, 'updateAdvance']);
    Route::delete('/salary-advances/{advance}', [SalaryController::class, 'deleteAdvance']);

    // Visas
    Route::apiResource('visas', VisaController::class);
    Route::get('/visas/expiring', [VisaController::class, 'expiring']);
    Route::get('/visas/employee/{employee}', [VisaController::class, 'byEmployee']);
    Route::post('/visas/{visa}/renew', [VisaController::class, 'renew']);

    // Visa Applications
    Route::get('/visa-applications', [VisaController::class, 'applications']);
    Route::post('/visa-applications', [VisaController::class, 'createApplication']);
    Route::put('/visa-applications/{application}', [VisaController::class, 'updateApplication']);
    Route::post('/visa-applications/{application}/status', [VisaController::class, 'updateApplicationStatus']);

    // Fines
    Route::apiResource('fines', FineController::class);
    Route::get('/fines/vehicle/{vehicle}', [FineController::class, 'byVehicle']);
    Route::get('/fines/driver/{employee}', [FineController::class, 'byDriver']);
    Route::get('/fines/pending', [FineController::class, 'pending']);
    Route::post('/fines/{fine}/pay', [FineController::class, 'markAsPaid']);
    Route::post('/fines/{fine}/assign', [FineController::class, 'assignToDriver']);

    // Expenses
    Route::apiResource('expenses', ExpenseController::class);
    Route::get('/expenses/category/{category}', [ExpenseController::class, 'byCategory']);
    Route::get('/expenses/vehicle/{vehicle}', [ExpenseController::class, 'byVehicle']);
    Route::get('/expense-categories', [ExpenseController::class, 'categories']);

    // Income
    Route::apiResource('income', IncomeController::class);
    Route::get('/income/customer/{customer}', [IncomeController::class, 'byCustomer']);
    Route::get('/income-categories', [IncomeController::class, 'categories']);

    // Cheques
    Route::apiResource('cheques', ChequeController::class);
    Route::get('/cheques/pending', [ChequeController::class, 'pending']);
    Route::post('/cheques/{cheque}/clear', [ChequeController::class, 'clear']);
    Route::post('/cheques/{cheque}/bounce', [ChequeController::class, 'bounce']);

    // Customers
    Route::apiResource('customers', CustomerController::class);
    Route::get('/customers/{customer}/invoices', [CustomerController::class, 'invoices']);
    Route::get('/customers/{customer}/payments', [CustomerController::class, 'payments']);

    // Alerts
    Route::get('/alerts', [AlertController::class, 'index']);
    Route::get('/alerts/unread', [AlertController::class, 'unread']);
    Route::post('/alerts/{alert}/read', [AlertController::class, 'markAsRead']);
    Route::post('/alerts/read-all', [AlertController::class, 'markAllAsRead']);
    Route::delete('/alerts/{alert}', [AlertController::class, 'destroy']);

    // Reports
    Route::get('/reports/financial', [ReportController::class, 'financial']);
    Route::get('/reports/fleet', [ReportController::class, 'fleet']);
    Route::get('/reports/hr', [ReportController::class, 'hr']);
    Route::get('/reports/expiries', [ReportController::class, 'expiries']);
    Route::get('/reports/fines', [ReportController::class, 'fines']);
    Route::get('/reports/export/{type}', [ReportController::class, 'export']);

    // User Management (Admin only)
    Route::middleware('ability:admin')->group(function () {
        Route::apiResource('users', UserController::class);
        Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword']);
        Route::get('/audit-logs', [UserController::class, 'auditLogs']);
    });
});
