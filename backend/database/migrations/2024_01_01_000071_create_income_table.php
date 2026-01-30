<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('income_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('income', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('income_categories')->onDelete('restrict');
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('vehicle_id')->nullable()->constrained()->nullOnDelete();
            $table->date('income_date');
            $table->string('description');
            $table->decimal('amount', 12, 2);
            $table->enum('payment_method', ['cash', 'card', 'bank_transfer', 'cheque'])->default('cash');
            $table->string('reference_number')->nullable();
            $table->string('invoice_number')->nullable();
            $table->enum('status', ['received', 'pending', 'partial'])->default('received');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index('income_date');
            $table->index('customer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('income');
        Schema::dropIfExists('income_categories');
    }
};
