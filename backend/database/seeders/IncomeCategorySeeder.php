<?php

namespace Database\Seeders;

use App\Models\IncomeCategory;
use Illuminate\Database\Seeder;

class IncomeCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Bus Rental', 'description' => 'Income from bus rental services'],
            ['name' => 'Bus Sale', 'description' => 'Income from selling vehicles'],
            ['name' => 'School Contract', 'description' => 'School transportation contracts'],
            ['name' => 'Tour Services', 'description' => 'Tour and travel services'],
            ['name' => 'Corporate Contract', 'description' => 'Corporate transportation contracts'],
            ['name' => 'Other', 'description' => 'Miscellaneous income'],
        ];

        foreach ($categories as $category) {
            IncomeCategory::create($category);
        }
    }
}
