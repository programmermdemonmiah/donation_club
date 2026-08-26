<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->decimal('balance', 16, 2)->default(0);
            $table->decimal('locked_balance', 16, 2)->default(0);
            $table->timestamps();
        });

        // Append-only ledger. Balance mutations only ever happen alongside a row here.
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 40)->unique();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type', 40); // WalletTransactionType
            $table->enum('direction', ['credit', 'debit']);
            $table->decimal('amount', 16, 2);
            $table->string('balance_context', 20)->default('balance'); // balance|available — which figure before/after describes
            $table->decimal('balance_before', 16, 2)->default(0);
            $table->decimal('balance_after', 16, 2)->default(0);
            $table->string('status', 20)->default(\App\Enums\WalletTransactionStatus::Completed->value);
            $table->string('reference_type', 60)->nullable(); // morph: Deposit, Withdrawal...
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('description', 255)->nullable();
            $table->timestamps();

            $table->index(['user_id', 'type']);
            $table->index(['user_id', 'created_at']);
            $table->index(['reference_type', 'reference_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('wallets');
    }
};
