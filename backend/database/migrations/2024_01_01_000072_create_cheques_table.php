<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cheques', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['issued', 'received']); // Issued by us or received from customer
            $table->string('cheque_number');
            $table->string('bank_name');
            $table->string('account_number')->nullable();
            $table->decimal('amount', 12, 2);
            $table->date('cheque_date'); // Date written on cheque
            $table->date('deposit_date')->nullable();
            $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('vendor_id')->nullable()->constrained()->nullOnDelete();
            $table->string('payee_name')->nullable();
            $table->string('purpose')->nullable();
            $table->enum('status', ['pending', 'cleared', 'bounced', 'cancelled', 'replaced'])->default('pending');
            $table->date('clearance_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('cheque_date');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cheques');
    }
};
