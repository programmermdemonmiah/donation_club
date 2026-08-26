<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('funds', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->text('description')->nullable();
            $table->foreignId('minimum_rank_id')->nullable()->constrained('ranks')->nullOnDelete();
            $table->decimal('min_amount', 16, 2);
            $table->decimal('max_amount', 16, 2);
            $table->boolean('requires_proof')->default(false);
            $table->boolean('enabled')->default(true);
            $table->timestamps();
        });

        Schema::create('fund_requests', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 40)->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('fund_id')->constrained()->restrictOnDelete();
            $table->decimal('requested_amount', 16, 2);
            $table->decimal('approved_amount', 16, 2)->nullable();
            $table->string('purpose', 500);
            $table->string('proof_path')->nullable();
            $table->string('status', 20)->default(\App\Enums\FundRequestStatus::Pending->value);
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('decision_note')->nullable();
            $table->timestamp('disbursed_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('status');
        });

        Schema::create('fund_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 40)->unique();
            $table->foreignId('fund_request_id')->constrained()->cascadeOnDelete();
            $table->string('type', 30); // disbursement|repayment|adjustment|cancellation
            $table->decimal('amount', 16, 2);
            $table->foreignId('wallet_transaction_id')->nullable()->constrained()->nullOnDelete();
            $table->string('note', 255)->nullable();
            $table->timestamps();

            $table->index(['fund_request_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fund_transactions');
        Schema::dropIfExists('fund_requests');
        Schema::dropIfExists('funds');
    }
};
