<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('company_name')->nullable();
            $table->string('contact_person')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('phone_alternate')->nullable();
            $table->text('address')->nullable();
            $table->string('trn_number')->nullable(); // Tax Registration Number
            $table->enum('type', ['corporate', 'individual', 'school', 'tour_operator', 'other'])->default('corporate');
            $table->decimal('credit_limit', 12, 2)->nullable();
            $table->integer('payment_terms')->default(30); // Days
            $table->boolean('is_active')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
