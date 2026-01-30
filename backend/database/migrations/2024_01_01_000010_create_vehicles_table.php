<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->id();
            $table->string('bus_number')->unique();
            $table->string('plate_number')->unique();
            $table->string('plate_code')->nullable();
            $table->string('chassis_number')->nullable();
            $table->string('engine_number')->nullable();
            $table->enum('type', ['bus', 'minibus', 'coaster', 'van', 'other'])->default('bus');
            $table->string('make')->nullable(); // Brand (Toyota, Nissan, etc.)
            $table->string('model')->nullable();
            $table->year('year')->nullable();
            $table->integer('seating_capacity')->nullable();
            $table->string('color')->nullable();
            $table->string('owner_name')->nullable();
            $table->string('owner_contact')->nullable();
            $table->date('purchase_date')->nullable();
            $table->decimal('purchase_price', 12, 2)->nullable();
            $table->enum('status', ['active', 'inactive', 'maintenance', 'sold', 'scrapped'])->default('active');
            $table->integer('current_km')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};
