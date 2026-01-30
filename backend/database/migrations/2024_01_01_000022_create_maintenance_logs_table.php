<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->onDelete('cascade');
            $table->enum('type', [
                'oil_change',
                'ac_cleaning',
                'ac_repair',
                'battery',
                'tyre',
                'brake',
                'engine',
                'transmission',
                'electrical',
                'body_work',
                'general_service',
                'inspection',
                'other'
            ]);
            $table->date('service_date');
            $table->integer('km_at_service')->nullable();
            $table->integer('next_service_km')->nullable(); // For scheduling
            $table->date('next_service_date')->nullable();
            $table->text('description')->nullable();
            $table->decimal('parts_cost', 10, 2)->default(0);
            $table->decimal('labor_cost', 10, 2)->default(0);
            $table->decimal('total_cost', 10, 2)->default(0);
            $table->foreignId('vendor_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('status', ['scheduled', 'in_progress', 'completed', 'cancelled'])->default('completed');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['vehicle_id', 'type']);
            $table->index('service_date');
            $table->index('next_service_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_logs');
    }
};
