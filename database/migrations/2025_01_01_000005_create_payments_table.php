<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 64)->unique(); // our unique payment reference
            $table->foreignId('deposit_id')->constrained()->cascadeOnDelete();
            $table->string('gateway', 40);
            $table->string('gateway_reference', 191)->nullable()->index();
            $table->decimal('amount', 16, 2);
            $table->string('currency', 3)->default('USD');
            $table->string('status', 20)->default(\App\Enums\PaymentStatus::Pending->value);
            $table->json('meta')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('deposit_id');
        });

        // Immutable log of gateway callbacks / verification attempts. The unique
        // constraint on external id powers webhook idempotency.
        Schema::create('payment_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->cascadeOnDelete();
            $table->string('type', 30); // callback|webhook|verification
            $table->string('external_reference', 191)->nullable();
            $table->json('payload')->nullable();
            $table->boolean('signature_valid')->default(false);
            $table->boolean('processed')->default(false);
            $table->timestamps();

            $table->unique(['payment_id', 'external_reference']);
            $table->index('payment_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_transactions');
        Schema::dropIfExists('payments');
    }
};
