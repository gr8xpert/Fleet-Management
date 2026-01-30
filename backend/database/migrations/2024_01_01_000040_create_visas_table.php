<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->string('visa_number')->nullable();
            $table->string('uid_number')->nullable();
            $table->enum('visa_type', ['employment', 'visit', 'transit', 'residence', 'other'])->default('employment');
            $table->date('issue_date')->nullable();
            $table->date('expiry_date');
            $table->enum('status', ['active', 'expired', 'cancelled', 'pending_renewal'])->default('active');
            $table->string('sponsor_name')->nullable();
            $table->decimal('visa_cost', 10, 2)->nullable();
            $table->string('file_path')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('expiry_date');
            $table->index('status');
        });

        Schema::create('visa_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->enum('application_type', ['new', 'renewal', 'cancellation', 'transfer', 'status_change']);
            $table->date('application_date');
            $table->date('expected_completion')->nullable();
            $table->enum('status', ['submitted', 'processing', 'approved', 'rejected', 'completed'])->default('submitted');
            $table->decimal('fees_paid', 10, 2)->default(0);
            $table->text('documents_submitted')->nullable();
            $table->text('notes')->nullable();
            $table->date('completion_date')->nullable();
            $table->timestamps();
        });

        Schema::create('visa_fines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->onDelete('cascade');
            $table->foreignId('visa_id')->nullable()->constrained()->nullOnDelete();
            $table->string('fine_type'); // Overstay, Late Renewal, etc.
            $table->decimal('amount', 10, 2);
            $table->date('fine_date');
            $table->enum('status', ['pending', 'paid'])->default('pending');
            $table->date('payment_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visa_fines');
        Schema::dropIfExists('visa_applications');
        Schema::dropIfExists('visas');
    }
};
