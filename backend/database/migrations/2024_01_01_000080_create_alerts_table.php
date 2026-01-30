<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('message');
            $table->enum('type', [
                'mulkiya_expiry',
                'insurance_expiry',
                'visa_expiry',
                'license_expiry',
                'passport_expiry',
                'maintenance_due',
                'low_stock',
                'fine_due',
                'cheque_due',
                'payment_due',
                'general'
            ]);
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');
            $table->morphs('alertable'); // Polymorphic: vehicle, employee, etc.
            $table->date('due_date')->nullable();
            $table->integer('days_before')->default(0);
            $table->boolean('is_read')->default(false);
            $table->boolean('is_sent')->default(false);
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index('type');
            $table->index('is_read');
            $table->index('due_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};
