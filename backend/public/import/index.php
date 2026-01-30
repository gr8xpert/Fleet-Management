<?php
// Data Import Tool - Upload to api.ramzangroupdip.com/public/import/
// DELETE THIS FOLDER AFTER USE!

require __DIR__.'/../../vendor/autoload.php';
$app = require_once __DIR__.'/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Http\Kernel::class)->bootstrap();

$modules = [
    'vehicles' => 'Vehicles',
    'employees' => 'Employees',
    'expenses' => 'Expenses',
    'income' => 'Income',
    'fines' => 'Fines',
    'customers' => 'Customers',
    'vendors' => 'Vendors',
    'maintenance' => 'Maintenance',
];

$message = '';
$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['csv_file'])) {
    $module = $_POST['module'] ?? '';
    $file = $_FILES['csv_file'];

    if ($file['error'] === UPLOAD_ERR_OK && in_array($module, array_keys($modules))) {
        $result = importCSV($module, $file['tmp_name']);
        if ($result['success']) {
            $message = "Successfully imported {$result['count']} records into {$modules[$module]}!";
        } else {
            $error = $result['error'];
        }
    } else {
        $error = "Please select a valid CSV file and module.";
    }
}

function importCSV($module, $filepath) {
    $handle = fopen($filepath, 'r');
    if (!$handle) {
        return ['success' => false, 'error' => 'Could not open file'];
    }

    $header = fgetcsv($handle);
    if (!$header) {
        return ['success' => false, 'error' => 'Empty file or invalid CSV'];
    }

    // Normalize headers
    $header = array_map(fn($h) => strtolower(trim(str_replace(' ', '_', $h))), $header);

    $count = 0;
    $errors = [];

    while (($row = fgetcsv($handle)) !== false) {
        if (count($row) !== count($header)) continue;

        $data = array_combine($header, $row);
        $data = array_map('trim', $data);

        try {
            switch ($module) {
                case 'vehicles':
                    importVehicle($data);
                    break;
                case 'employees':
                    importEmployee($data);
                    break;
                case 'expenses':
                    importExpense($data);
                    break;
                case 'income':
                    importIncome($data);
                    break;
                case 'fines':
                    importFine($data);
                    break;
                case 'customers':
                    importCustomer($data);
                    break;
                case 'vendors':
                    importVendor($data);
                    break;
                case 'maintenance':
                    importMaintenance($data);
                    break;
            }
            $count++;
        } catch (Exception $e) {
            $errors[] = "Row $count: " . $e->getMessage();
        }
    }

    fclose($handle);

    if (!empty($errors) && $count === 0) {
        return ['success' => false, 'error' => implode('<br>', array_slice($errors, 0, 5))];
    }

    return ['success' => true, 'count' => $count];
}

function importVehicle($data) {
    \App\Models\Vehicle::updateOrCreate(
        ['bus_number' => $data['bus_number'] ?? $data['bus_no'] ?? null],
        [
            'plate_number' => $data['plate_number'] ?? $data['plate_no'] ?? $data['plate'] ?? null,
            'make' => $data['make'] ?? $data['brand'] ?? null,
            'model' => $data['model'] ?? null,
            'year' => $data['year'] ?? null,
            'chassis_number' => $data['chassis_number'] ?? $data['chassis'] ?? null,
            'engine_number' => $data['engine_number'] ?? $data['engine'] ?? null,
            'color' => $data['color'] ?? null,
            'seating_capacity' => $data['seating_capacity'] ?? $data['capacity'] ?? $data['seats'] ?? null,
            'fuel_type' => $data['fuel_type'] ?? $data['fuel'] ?? 'diesel',
            'status' => $data['status'] ?? 'active',
            'purchase_date' => parseDate($data['purchase_date'] ?? null),
            'purchase_price' => $data['purchase_price'] ?? $data['price'] ?? null,
        ]
    );
}

function importEmployee($data) {
    \App\Models\Employee::updateOrCreate(
        ['employee_id' => $data['employee_id'] ?? $data['emp_id'] ?? $data['id'] ?? uniqid('EMP')],
        [
            'name' => $data['name'] ?? $data['employee_name'] ?? null,
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? $data['mobile'] ?? $data['contact'] ?? null,
            'type' => $data['type'] ?? $data['position'] ?? 'driver',
            'nationality' => $data['nationality'] ?? null,
            'passport_number' => $data['passport_number'] ?? $data['passport'] ?? null,
            'passport_expiry' => parseDate($data['passport_expiry'] ?? null),
            'license_number' => $data['license_number'] ?? $data['license'] ?? null,
            'license_expiry' => parseDate($data['license_expiry'] ?? null),
            'join_date' => parseDate($data['join_date'] ?? $data['joining_date'] ?? null),
            'basic_salary' => $data['basic_salary'] ?? $data['salary'] ?? null,
            'status' => $data['status'] ?? 'active',
        ]
    );
}

function importExpense($data) {
    $category = \App\Models\ExpenseCategory::firstOrCreate(
        ['name' => $data['category'] ?? 'General'],
        ['is_active' => true]
    );

    $vehicle = null;
    if (!empty($data['bus_number']) || !empty($data['vehicle'])) {
        $vehicle = \App\Models\Vehicle::where('bus_number', $data['bus_number'] ?? $data['vehicle'])->first();
    }

    \App\Models\Expense::create([
        'category_id' => $category->id,
        'vehicle_id' => $vehicle?->id,
        'expense_date' => parseDate($data['date'] ?? $data['expense_date'] ?? now()),
        'description' => $data['description'] ?? $data['details'] ?? $data['category'] ?? 'Imported expense',
        'amount' => floatval($data['amount'] ?? 0),
        'payment_method' => $data['payment_method'] ?? $data['payment'] ?? 'cash',
        'reference_number' => $data['reference'] ?? $data['reference_number'] ?? $data['ref'] ?? null,
        'notes' => $data['notes'] ?? $data['remarks'] ?? null,
    ]);
}

function importIncome($data) {
    $category = \App\Models\IncomeCategory::firstOrCreate(
        ['name' => $data['category'] ?? 'General'],
        ['is_active' => true]
    );

    $customer = null;
    if (!empty($data['customer']) || !empty($data['customer_name'])) {
        $customer = \App\Models\Customer::firstOrCreate(
            ['name' => $data['customer'] ?? $data['customer_name']],
            ['is_active' => true]
        );
    }

    \App\Models\Income::create([
        'category_id' => $category->id,
        'customer_id' => $customer?->id,
        'income_date' => parseDate($data['date'] ?? $data['income_date'] ?? now()),
        'description' => $data['description'] ?? $data['details'] ?? $data['category'] ?? 'Imported income',
        'amount' => floatval($data['amount'] ?? 0),
        'payment_method' => $data['payment_method'] ?? $data['payment'] ?? 'cash',
        'reference_number' => $data['reference'] ?? $data['reference_number'] ?? $data['ref'] ?? null,
        'invoice_number' => $data['invoice'] ?? $data['invoice_number'] ?? null,
        'status' => $data['status'] ?? 'received',
        'notes' => $data['notes'] ?? $data['remarks'] ?? null,
    ]);
}

function importFine($data) {
    $vehicle = null;
    if (!empty($data['bus_number']) || !empty($data['vehicle'])) {
        $vehicle = \App\Models\Vehicle::where('bus_number', $data['bus_number'] ?? $data['vehicle'])->first();
    }

    $driver = null;
    if (!empty($data['driver']) || !empty($data['driver_name'])) {
        $driver = \App\Models\Employee::where('name', 'like', '%' . ($data['driver'] ?? $data['driver_name']) . '%')->first();
    }

    \App\Models\Fine::create([
        'vehicle_id' => $vehicle?->id,
        'driver_id' => $driver?->id,
        'fine_number' => $data['fine_number'] ?? $data['ticket_number'] ?? $data['reference'] ?? uniqid('FINE'),
        'fine_date' => parseDate($data['date'] ?? $data['fine_date'] ?? now()),
        'violation_type' => $data['violation_type'] ?? $data['violation'] ?? $data['type'] ?? 'Traffic Violation',
        'location' => $data['location'] ?? $data['place'] ?? null,
        'amount' => floatval($data['amount'] ?? 0),
        'discount' => floatval($data['discount'] ?? 0),
        'final_amount' => floatval($data['final_amount'] ?? $data['amount'] ?? 0),
        'due_date' => parseDate($data['due_date'] ?? null),
        'status' => $data['status'] ?? 'pending',
        'source' => $data['source'] ?? 'imported',
        'notes' => $data['notes'] ?? $data['remarks'] ?? null,
    ]);
}

function importCustomer($data) {
    \App\Models\Customer::updateOrCreate(
        ['name' => $data['name'] ?? $data['customer_name'] ?? null],
        [
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? $data['mobile'] ?? $data['contact'] ?? null,
            'address' => $data['address'] ?? null,
            'company' => $data['company'] ?? $data['company_name'] ?? null,
            'trn' => $data['trn'] ?? $data['tax_number'] ?? null,
            'is_active' => true,
        ]
    );
}

function importVendor($data) {
    \App\Models\Vendor::updateOrCreate(
        ['name' => $data['name'] ?? $data['vendor_name'] ?? null],
        [
            'contact_person' => $data['contact_person'] ?? $data['contact'] ?? null,
            'email' => $data['email'] ?? null,
            'phone' => $data['phone'] ?? $data['mobile'] ?? null,
            'address' => $data['address'] ?? null,
            'service_type' => $data['service_type'] ?? $data['type'] ?? $data['services'] ?? null,
            'is_active' => true,
        ]
    );
}

function importMaintenance($data) {
    $vehicle = null;
    if (!empty($data['bus_number']) || !empty($data['vehicle'])) {
        $vehicle = \App\Models\Vehicle::where('bus_number', $data['bus_number'] ?? $data['vehicle'])->first();
    }

    if (!$vehicle) {
        throw new Exception('Vehicle not found');
    }

    \App\Models\MaintenanceLog::create([
        'vehicle_id' => $vehicle->id,
        'maintenance_type' => $data['type'] ?? $data['maintenance_type'] ?? 'repair',
        'description' => $data['description'] ?? $data['details'] ?? 'Imported maintenance',
        'service_date' => parseDate($data['date'] ?? $data['service_date'] ?? now()),
        'odometer_reading' => $data['odometer'] ?? $data['odometer_reading'] ?? $data['mileage'] ?? null,
        'labor_cost' => floatval($data['labor_cost'] ?? $data['labor'] ?? 0),
        'parts_cost' => floatval($data['parts_cost'] ?? $data['parts'] ?? 0),
        'total_cost' => floatval($data['total_cost'] ?? $data['total'] ?? $data['amount'] ?? 0),
        'status' => 'completed',
        'notes' => $data['notes'] ?? $data['remarks'] ?? null,
    ]);
}

function parseDate($date) {
    if (empty($date)) return null;
    try {
        // Try different date formats
        $formats = ['Y-m-d', 'd/m/Y', 'm/d/Y', 'd-m-Y', 'Y/m/d'];
        foreach ($formats as $format) {
            $parsed = \DateTime::createFromFormat($format, $date);
            if ($parsed) return $parsed->format('Y-m-d');
        }
        return date('Y-m-d', strtotime($date));
    } catch (Exception $e) {
        return null;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Fleet Manager - Data Import</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #333; margin-bottom: 20px; }
        .card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .card h2 { color: #555; margin-bottom: 15px; font-size: 18px; }
        label { display: block; margin-bottom: 5px; font-weight: 500; color: #333; }
        select, input[type="file"] { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 15px; }
        button { background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; }
        button:hover { background: #2563eb; }
        .message { padding: 15px; border-radius: 4px; margin-bottom: 20px; }
        .success { background: #d1fae5; color: #065f46; }
        .error { background: #fee2e2; color: #991b1b; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th, td { padding: 8px; text-align: left; border-bottom: 1px solid #eee; }
        th { background: #f9fafb; font-weight: 600; }
        code { background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 12px; }
        .warning { background: #fef3c7; color: #92400e; padding: 15px; border-radius: 4px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Fleet Manager - Data Import</h1>

        <div class="warning">
            ⚠️ <strong>Security Warning:</strong> Delete this entire <code>/import</code> folder after use!
        </div>

        <?php if ($message): ?>
            <div class="message success">✅ <?= htmlspecialchars($message) ?></div>
        <?php endif; ?>

        <?php if ($error): ?>
            <div class="message error">❌ <?= $error ?></div>
        <?php endif; ?>

        <div class="card">
            <h2>Upload CSV File</h2>
            <form method="POST" enctype="multipart/form-data">
                <label>Select Module</label>
                <select name="module" required>
                    <option value="">-- Select Module --</option>
                    <?php foreach ($modules as $key => $name): ?>
                        <option value="<?= $key ?>"><?= $name ?></option>
                    <?php endforeach; ?>
                </select>

                <label>CSV File</label>
                <input type="file" name="csv_file" accept=".csv" required>

                <button type="submit">Import Data</button>
            </form>
        </div>

        <div class="card">
            <h2>CSV Column Reference</h2>

            <h3 style="margin: 15px 0 10px; color: #3b82f6;">Vehicles</h3>
            <table>
                <tr><th>Column</th><th>Required</th><th>Example</th></tr>
                <tr><td><code>bus_number</code></td><td>Yes</td><td>BUS-001</td></tr>
                <tr><td><code>plate_number</code></td><td>Yes</td><td>A 12345</td></tr>
                <tr><td><code>make</code></td><td>No</td><td>Toyota</td></tr>
                <tr><td><code>model</code></td><td>No</td><td>Coaster</td></tr>
                <tr><td><code>year</code></td><td>No</td><td>2022</td></tr>
                <tr><td><code>seating_capacity</code></td><td>No</td><td>30</td></tr>
                <tr><td><code>status</code></td><td>No</td><td>active</td></tr>
            </table>

            <h3 style="margin: 15px 0 10px; color: #3b82f6;">Employees</h3>
            <table>
                <tr><th>Column</th><th>Required</th><th>Example</th></tr>
                <tr><td><code>employee_id</code></td><td>Yes</td><td>EMP-001</td></tr>
                <tr><td><code>name</code></td><td>Yes</td><td>John Doe</td></tr>
                <tr><td><code>phone</code></td><td>No</td><td>+971501234567</td></tr>
                <tr><td><code>type</code></td><td>No</td><td>driver</td></tr>
                <tr><td><code>nationality</code></td><td>No</td><td>Indian</td></tr>
                <tr><td><code>license_number</code></td><td>No</td><td>DL123456</td></tr>
                <tr><td><code>license_expiry</code></td><td>No</td><td>2025-12-31</td></tr>
                <tr><td><code>basic_salary</code></td><td>No</td><td>3000</td></tr>
            </table>

            <h3 style="margin: 15px 0 10px; color: #3b82f6;">Expenses</h3>
            <table>
                <tr><th>Column</th><th>Required</th><th>Example</th></tr>
                <tr><td><code>date</code></td><td>Yes</td><td>2024-01-15</td></tr>
                <tr><td><code>category</code></td><td>Yes</td><td>Fuel</td></tr>
                <tr><td><code>amount</code></td><td>Yes</td><td>500.00</td></tr>
                <tr><td><code>description</code></td><td>No</td><td>Diesel refill</td></tr>
                <tr><td><code>bus_number</code></td><td>No</td><td>BUS-001</td></tr>
                <tr><td><code>payment_method</code></td><td>No</td><td>cash</td></tr>
                <tr><td><code>reference</code></td><td>No</td><td>INV-123</td></tr>
            </table>

            <h3 style="margin: 15px 0 10px; color: #3b82f6;">Income</h3>
            <table>
                <tr><th>Column</th><th>Required</th><th>Example</th></tr>
                <tr><td><code>date</code></td><td>Yes</td><td>2024-01-15</td></tr>
                <tr><td><code>category</code></td><td>Yes</td><td>Rental</td></tr>
                <tr><td><code>amount</code></td><td>Yes</td><td>5000.00</td></tr>
                <tr><td><code>description</code></td><td>No</td><td>Bus rental</td></tr>
                <tr><td><code>customer</code></td><td>No</td><td>ABC Company</td></tr>
                <tr><td><code>status</code></td><td>No</td><td>received</td></tr>
                <tr><td><code>invoice</code></td><td>No</td><td>INV-001</td></tr>
            </table>

            <h3 style="margin: 15px 0 10px; color: #3b82f6;">Fines</h3>
            <table>
                <tr><th>Column</th><th>Required</th><th>Example</th></tr>
                <tr><td><code>fine_number</code></td><td>Yes</td><td>TRF-12345</td></tr>
                <tr><td><code>date</code></td><td>Yes</td><td>2024-01-15</td></tr>
                <tr><td><code>amount</code></td><td>Yes</td><td>500.00</td></tr>
                <tr><td><code>violation_type</code></td><td>No</td><td>Speeding</td></tr>
                <tr><td><code>bus_number</code></td><td>No</td><td>BUS-001</td></tr>
                <tr><td><code>driver</code></td><td>No</td><td>John Doe</td></tr>
                <tr><td><code>status</code></td><td>No</td><td>pending</td></tr>
            </table>
        </div>

        <div class="card">
            <h2>Tips</h2>
            <ul style="padding-left: 20px; line-height: 1.8;">
                <li>Save Excel files as <strong>CSV (Comma delimited)</strong></li>
                <li>First row must contain column headers</li>
                <li>Dates can be: <code>YYYY-MM-DD</code>, <code>DD/MM/YYYY</code>, or <code>MM/DD/YYYY</code></li>
                <li>Existing records (same bus_number/employee_id) will be <strong>updated</strong></li>
                <li>Categories and Customers will be <strong>auto-created</strong> if they don't exist</li>
            </ul>
        </div>
    </div>
</body>
</html>
