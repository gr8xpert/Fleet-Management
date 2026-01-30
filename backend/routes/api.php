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

// Protected routes - All authenticated users
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::put('/user/password', [AuthController::class, 'updatePassword']);

    // Dashboard - All users can view
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/dashboard/expiries', [DashboardController::class, 'upcomingExpiries']);
    Route::get('/dashboard/summary', [DashboardController::class, 'financialSummary']);
    Route::get('/dashboard/alerts', [DashboardController::class, 'alerts']);

    // Alerts - All users
    Route::get('/alerts', [AlertController::class, 'index']);
    Route::get('/alerts/unread', [AlertController::class, 'unread']);
    Route::post('/alerts/{alert}/read', [AlertController::class, 'markAsRead']);
    Route::post('/alerts/read-all', [AlertController::class, 'markAllAsRead']);
    Route::delete('/alerts/{alert}', [AlertController::class, 'destroy']);

    // ===== VIEW ROUTES - All authenticated users can view =====

    // Vehicles - View
    Route::get('/vehicles', [VehicleController::class, 'index']);
    Route::get('/vehicles/{vehicle}', [VehicleController::class, 'show']);
    Route::get('/vehicles/{vehicle}/history', [VehicleController::class, 'history']);

    // Vehicle Documents - View
    Route::get('/vehicles/{vehicle}/documents', [VehicleDocumentController::class, 'index']);
    Route::get('/documents/{document}', [VehicleDocumentController::class, 'show']);
    Route::get('/documents/expiring', [VehicleDocumentController::class, 'expiring']);

    // Maintenance - View
    Route::get('/maintenance', [MaintenanceController::class, 'index']);
    Route::get('/maintenance/{maintenance}', [MaintenanceController::class, 'show']);
    Route::get('/maintenance/vehicle/{vehicle}', [MaintenanceController::class, 'byVehicle']);
    Route::get('/maintenance/scheduled', [MaintenanceController::class, 'scheduled']);

    // Spare Parts - View
    Route::get('/spare-parts', [SparePartController::class, 'index']);
    Route::get('/spare-parts/{sparePart}', [SparePartController::class, 'show']);
    Route::get('/spare-parts-low-stock', [SparePartController::class, 'lowStock']);

    // Vendors - View
    Route::get('/vendors', [VendorController::class, 'index']);
    Route::get('/vendors/{vendor}', [VendorController::class, 'show']);

    // Employees - View
    Route::get('/employees', [EmployeeController::class, 'index']);
    Route::get('/employees/{employee}', [EmployeeController::class, 'show']);
    Route::get('/employees-drivers', [EmployeeController::class, 'drivers']);
    Route::get('/employees/{employee}/fines', [EmployeeController::class, 'fines']);
    Route::get('/employees/{employee}/attendance', [EmployeeController::class, 'attendance']);

    // Salaries - View
    Route::get('/salaries', [SalaryController::class, 'index']);
    Route::get('/salaries/{salary}', [SalaryController::class, 'show']);
    Route::get('/salaries/employee/{employee}', [SalaryController::class, 'byEmployee']);
    Route::get('/salary-advances', [SalaryController::class, 'advances']);

    // Visas - View
    Route::get('/visas', [VisaController::class, 'index']);
    Route::get('/visas/{visa}', [VisaController::class, 'show']);
    Route::get('/visas-expiring', [VisaController::class, 'expiring']);
    Route::get('/visas/employee/{employee}', [VisaController::class, 'byEmployee']);
    Route::get('/visa-applications', [VisaController::class, 'applications']);

    // Fines - View
    Route::get('/fines', [FineController::class, 'index']);
    Route::get('/fines/{fine}', [FineController::class, 'show']);
    Route::get('/fines/vehicle/{vehicle}', [FineController::class, 'byVehicle']);
    Route::get('/fines/driver/{employee}', [FineController::class, 'byDriver']);
    Route::get('/fines-pending', [FineController::class, 'pending']);

    // Expenses - View
    Route::get('/expenses', [ExpenseController::class, 'index']);
    Route::get('/expenses/{expense}', [ExpenseController::class, 'show']);
    Route::get('/expenses/category/{category}', [ExpenseController::class, 'byCategory']);
    Route::get('/expenses/vehicle/{vehicle}', [ExpenseController::class, 'byVehicle']);
    Route::get('/expense-categories', [ExpenseController::class, 'categories']);

    // Income - View
    Route::get('/income', [IncomeController::class, 'index']);
    Route::get('/income/{income}', [IncomeController::class, 'show']);
    Route::get('/income/customer/{customer}', [IncomeController::class, 'byCustomer']);
    Route::get('/income-categories', [IncomeController::class, 'categories']);

    // Cheques - View
    Route::get('/cheques', [ChequeController::class, 'index']);
    Route::get('/cheques/{cheque}', [ChequeController::class, 'show']);
    Route::get('/cheques-pending', [ChequeController::class, 'pending']);

    // Customers - View
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::get('/customers/{customer}', [CustomerController::class, 'show']);
    Route::get('/customers/{customer}/invoices', [CustomerController::class, 'invoices']);
    Route::get('/customers/{customer}/payments', [CustomerController::class, 'payments']);

    // ===== CREATE/UPDATE ROUTES - Staff, Manager, Admin =====
    // Staff can create and update records

    // Vehicles - Create/Update
    Route::post('/vehicles', [VehicleController::class, 'store']);
    Route::put('/vehicles/{vehicle}', [VehicleController::class, 'update']);
    Route::post('/vehicles/{vehicle}/transfer', [VehicleController::class, 'transfer']);

    // Vehicle Documents - Create/Update
    Route::post('/vehicles/{vehicle}/documents', [VehicleDocumentController::class, 'store']);
    Route::put('/documents/{document}', [VehicleDocumentController::class, 'update']);

    // Maintenance - Create/Update
    Route::post('/maintenance', [MaintenanceController::class, 'store']);
    Route::put('/maintenance/{maintenance}', [MaintenanceController::class, 'update']);
    Route::post('/maintenance/{maintenance}/complete', [MaintenanceController::class, 'complete']);

    // Spare Parts - Create/Update
    Route::post('/spare-parts', [SparePartController::class, 'store']);
    Route::put('/spare-parts/{sparePart}', [SparePartController::class, 'update']);
    Route::post('/spare-parts/{sparePart}/adjust', [SparePartController::class, 'adjustStock']);

    // Vendors - Create/Update
    Route::post('/vendors', [VendorController::class, 'store']);
    Route::put('/vendors/{vendor}', [VendorController::class, 'update']);

    // Employees - Create/Update
    Route::post('/employees', [EmployeeController::class, 'store']);
    Route::put('/employees/{employee}', [EmployeeController::class, 'update']);

    // Visas - Create/Update
    Route::post('/visas', [VisaController::class, 'store']);
    Route::put('/visas/{visa}', [VisaController::class, 'update']);
    Route::post('/visas/{visa}/renew', [VisaController::class, 'renew']);
    Route::post('/visa-applications', [VisaController::class, 'createApplication']);
    Route::put('/visa-applications/{application}', [VisaController::class, 'updateApplication']);
    Route::post('/visa-applications/{application}/status', [VisaController::class, 'updateApplicationStatus']);

    // Fines - Create/Update
    Route::post('/fines', [FineController::class, 'store']);
    Route::put('/fines/{fine}', [FineController::class, 'update']);
    Route::post('/fines/{fine}/pay', [FineController::class, 'markAsPaid']);
    Route::post('/fines/{fine}/assign', [FineController::class, 'assignToDriver']);

    // Expenses - Create/Update
    Route::post('/expenses', [ExpenseController::class, 'store']);
    Route::put('/expenses/{expense}', [ExpenseController::class, 'update']);

    // Income - Create/Update
    Route::post('/income', [IncomeController::class, 'store']);
    Route::put('/income/{income}', [IncomeController::class, 'update']);

    // Cheques - Create/Update
    Route::post('/cheques', [ChequeController::class, 'store']);
    Route::put('/cheques/{cheque}', [ChequeController::class, 'update']);
    Route::post('/cheques/{cheque}/clear', [ChequeController::class, 'clear']);
    Route::post('/cheques/{cheque}/bounce', [ChequeController::class, 'bounce']);

    // Customers - Create/Update
    Route::post('/customers', [CustomerController::class, 'store']);
    Route::put('/customers/{customer}', [CustomerController::class, 'update']);

    // ===== MANAGER & ADMIN ONLY ROUTES =====
    Route::middleware('role:manager')->group(function () {
        // Delete operations - Manager and Admin only
        Route::delete('/vehicles/{vehicle}', [VehicleController::class, 'destroy']);
        Route::delete('/documents/{document}', [VehicleDocumentController::class, 'destroy']);
        Route::delete('/maintenance/{maintenance}', [MaintenanceController::class, 'destroy']);
        Route::delete('/spare-parts/{sparePart}', [SparePartController::class, 'destroy']);
        Route::delete('/vendors/{vendor}', [VendorController::class, 'destroy']);
        Route::delete('/employees/{employee}', [EmployeeController::class, 'destroy']);
        Route::delete('/visas/{visa}', [VisaController::class, 'destroy']);
        Route::delete('/fines/{fine}', [FineController::class, 'destroy']);
        Route::delete('/expenses/{expense}', [ExpenseController::class, 'destroy']);
        Route::delete('/income/{income}', [IncomeController::class, 'destroy']);
        Route::delete('/cheques/{cheque}', [ChequeController::class, 'destroy']);
        Route::delete('/customers/{customer}', [CustomerController::class, 'destroy']);

        // Salary Management - Manager and Admin only
        Route::post('/salaries', [SalaryController::class, 'store']);
        Route::put('/salaries/{salary}', [SalaryController::class, 'update']);
        Route::delete('/salaries/{salary}', [SalaryController::class, 'destroy']);
        Route::post('/salaries/generate-monthly', [SalaryController::class, 'generateMonthly']);
        Route::post('/salaries/{salary}/pay', [SalaryController::class, 'markAsPaid']);
        Route::post('/salary-advances', [SalaryController::class, 'createAdvance']);
        Route::put('/salary-advances/{advance}', [SalaryController::class, 'updateAdvance']);
        Route::delete('/salary-advances/{advance}', [SalaryController::class, 'deleteAdvance']);

        // Reports - Manager and Admin only
        Route::get('/reports/financial', [ReportController::class, 'financial']);
        Route::get('/reports/fleet', [ReportController::class, 'fleet']);
        Route::get('/reports/hr', [ReportController::class, 'hr']);
        Route::get('/reports/expiries', [ReportController::class, 'expiries']);
        Route::get('/reports/fines', [ReportController::class, 'fines']);
        Route::get('/reports/export/{type}', [ReportController::class, 'export']);
    });

    // ===== ADMIN ONLY ROUTES =====
    Route::middleware('role:admin')->group(function () {
        // User Management - Admin only
        Route::get('/users', [UserController::class, 'index']);
        Route::post('/users', [UserController::class, 'store']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::put('/users/{user}', [UserController::class, 'update']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword']);

        // Audit Logs - Admin only
        Route::get('/audit-logs', [UserController::class, 'auditLogs']);
    });
});
