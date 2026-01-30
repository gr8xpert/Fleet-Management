<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spare_parts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('part_number')->nullable();
            $table->string('category')->nullable(); // Engine, Brake, AC, Tyre, etc.
            $table->text('description')->nullable();
            $table->integer('quantity')->default(0);
            $table->integer('min_quantity')->default(5); // Reorder level
            $table->decimal('unit_price', 10, 2)->nullable();
            $table->string('location')->nullable(); // Storage location
            $table->foreignId('vendor_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('spare_part_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('spare_part_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['in', 'out', 'adjustment']);
            $table->integer('quantity');
            $table->integer('balance_after');
            $table->foreignId('vehicle_id')->nullable()->constrained()->nullOnDelete();
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spare_part_logs');
        Schema::dropIfExists('spare_parts');
    }
};
