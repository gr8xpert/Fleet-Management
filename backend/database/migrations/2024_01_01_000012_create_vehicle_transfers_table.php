<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vehicle_id')->constrained()->onDelete('cascade');
            $table->string('from_owner');
            $table->string('to_owner');
            $table->date('transfer_date');
            $table->decimal('transfer_amount', 12, 2)->nullable();
            $table->string('old_plate_number')->nullable();
            $table->string('new_plate_number')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_transfers');
    }
};
