<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('employee_id')->unique()->nullable();
            $table->string('name');
            $table->string('name_arabic')->nullable();
            $table->enum('type', ['driver', 'mechanic', 'cleaner', 'supervisor', 'admin', 'other'])->default('driver');
            $table->string('nationality')->nullable();
            $table->string('passport_number')->nullable();
            $table->date('passport_expiry')->nullable();
            $table->string('emirates_id')->nullable();
            $table->date('emirates_id_expiry')->nullable();
            $table->string('license_number')->nullable();
            $table->date('license_expiry')->nullable();
            $table->string('phone')->nullable();
            $table->string('phone_alternate')->nullable();
            $table->text('address')->nullable();
            $table->date('join_date')->nullable();
            $table->decimal('basic_salary', 10, 2)->nullable();
            $table->string('salary_card_number')->nullable();
            $table->text('salary_card_pin_encrypted')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('bank_account')->nullable();
            $table->enum('status', ['active', 'inactive', 'terminated', 'on_leave'])->default('active');
            $table->string('photo')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('type');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
