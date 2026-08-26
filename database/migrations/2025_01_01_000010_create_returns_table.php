<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('return_rules', function (Blueprint $table) {
            $table->id();
            $table->boolean('enabled')->default(false); // legal gate: disabled until approved
            $table->decimal('return_percent', 8, 3)->nullable(); // e.g. 200.000 = 200% of deposit
            $table->unsignedInteger('minimum_direct_referrals')->default(2);
            $table->foreignId('rank_requirement_id')->nullable()->constrained('ranks')->nullOnDelete();
            $table->decimal('deposit_requirement', 16, 2)->default(0); // min total completed deposits
            $table->unsignedBigInteger('sequence_requirement')->default(0); // min global sequence position
            $table->text('terms_note')->nullable();
            $table->timestamps();
        });

        Schema::create('returns', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 40)->unique();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->foreignId('deposit_id')->constrained()->cascadeOnDelete();
            $table->decimal('base_amount', 16, 2);
            $table->decimal('rate', 8, 3);
            $table->decimal('payout_amount', 16, 2);
            $table->string('status', 20)->default(\App\Enums\ReturnStatus::Pending->value);
            $table->timestamp('eligible_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->foreignId('reversal_of_return_id')->nullable()->constrained('returns')->nullOnDelete();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('status');
            // One *active* return per deposit is enforced at application level
            // (ReturnService::createFromDeposit); reversal records intentionally
            // share the deposit, so no hard DB unique here.
            $table->index(['user_id', 'deposit_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('returns');
        Schema::dropIfExists('return_rules');
    }
};
