<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->year('year');
            $table->unsignedTinyInteger('month'); // 1-12
            $table->decimal('basic_salary', 10, 2);
            $table->decimal('allowances', 10, 2)->default(0);
            $table->decimal('overtime', 10, 2)->default(0);
            $table->decimal('deductions', 10, 2)->default(0);
            $table->decimal('advance_deduction', 10, 2)->default(0);
            $table->decimal('fine_deduction', 10, 2)->default(0);
            $table->decimal('net_salary', 10, 2);
            $table->enum('status', ['pending', 'paid', 'partial'])->default('pending');
            $table->date('payment_date')->nullable();
            $table->string('payment_method')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['employee_id', 'year', 'month']);
            $table->index(['year', 'month']);
        });

        Schema::create('salary_advances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->date('advance_date');
            $table->text('reason')->nullable();
            $table->enum('status', ['pending', 'deducted', 'cancelled'])->default('pending');
            $table->foreignId('deducted_from_salary_id')->nullable()->constrained('salaries')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salary_advances');
        Schema::dropIfExists('salaries');
    }
};
