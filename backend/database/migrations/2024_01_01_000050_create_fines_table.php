<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('driver_id')->nullable()->constrained('employees')->nullOnDelete();
            $table->string('fine_number')->nullable();
            $table->enum('type', [
                'traffic',
                'parking',
                'speeding',
                'signal',
                'salik',
                'rta',
                'municipality',
                'other'
            ])->default('traffic');
            $table->string('violation_description')->nullable();
            $table->decimal('amount', 10, 2);
            $table->integer('black_points')->default(0);
            $table->date('fine_date');
            $table->date('due_date')->nullable();
            $table->string('location')->nullable();
            $table->enum('status', ['pending', 'paid', 'disputed', 'waived'])->default('pending');
            $table->date('payment_date')->nullable();
            $table->enum('paid_by', ['company', 'driver'])->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('fine_date');
            $table->index('status');
            $table->index(['vehicle_id', 'fine_date']);
            $table->index(['driver_id', 'fine_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fines');
    }
};
