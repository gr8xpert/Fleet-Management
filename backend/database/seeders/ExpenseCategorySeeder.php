<?php

namespace Database\Seeders;

use App\Models\ExpenseCategory;
use Illuminate\Database\Seeder;

class ExpenseCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Fuel', 'description' => 'Diesel and petrol expenses'],
            ['name' => 'Maintenance', 'description' => 'Vehicle repair and maintenance'],
            ['name' => 'Salaries', 'description' => 'Staff salaries and wages'],
            ['name' => 'Salik', 'description' => 'Toll charges'],
            ['name' => 'Fines', 'description' => 'Traffic and other fines'],
            ['name' => 'Insurance', 'description' => 'Vehicle insurance'],
            ['name' => 'Registration', 'description' => 'Mulkiya and registration fees'],
            ['name' => 'Visa', 'description' => 'Visa and immigration costs'],
            ['name' => 'Tyres', 'description' => 'Tyre purchases and repairs'],
            ['name' => 'Spare Parts', 'description' => 'Vehicle spare parts'],
            ['name' => 'Office', 'description' => 'Office supplies and rent'],
            ['name' => 'Utilities', 'description' => 'Electricity, water, phone'],
            ['name' => 'Cleaning', 'description' => 'Vehicle cleaning and washing'],
            ['name' => 'Other', 'description' => 'Miscellaneous expenses'],
        ];

        foreach ($categories as $category) {
            ExpenseCategory::create($category);
        }
    }
}
