<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commission_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('scope', 20); // direct|generation
            $table->unsignedTinyInteger('generation'); // 1 = direct, 2..10 generations
            $table->decimal('percentage', 6, 3); // e.g. 5.000 = 5%
            $table->string('trigger_event', 30); // deposit|return_payout
            $table->boolean('enabled')->default(true);
            $table->timestamps();

            $table->unique(['trigger_event', 'generation']);
        });

        Schema::create('commissions', function (Blueprint $table) {
            $table->id();
            $table->string('reference', 40)->unique();
            $table->foreignId('user_id')->constrained()->restrictOnDelete(); // beneficiary
            $table->foreignId('source_user_id')->constrained('users')->restrictOnDelete(); // member whose event generated it
            $table->foreignId('commission_rule_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedTinyInteger('generation');
            $table->decimal('rate', 6, 3);
            $table->decimal('base_amount', 16, 2);
            $table->decimal('amount', 16, 2);
            $table->string('source_type', 60); // Deposit|MemberReturn
            $table->unsignedBigInteger('source_id');
            $table->string('status', 20)->default(\App\Enums\CommissionStatus::Completed->value);
            $table->timestamp('credited_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'generation']);
            $table->index(['source_type', 'source_id']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commissions');
        Schema::dropIfExists('commission_rules');
    }
};
