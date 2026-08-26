<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Central, database-safe sequence allocator. Values are incremented inside
        // the same DB transaction that completes a deposit; row-level locking
        // serializes allocation and rollback restores the counter.
        Schema::create('sequence_counters', function (Blueprint $table) {
            $table->string('name', 50)->primary();
            $table->unsignedBigInteger('current_value')->default(0);
            $table->timestamps();
        });

        Schema::create('deposit_sequences', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sequence_number');
            $table->foreignId('deposit_id')->unique()->constrained()->cascadeOnDelete();
            $table->timestamp('allocated_at');

            $table->unique('sequence_number');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deposit_sequences');
        Schema::dropIfExists('sequence_counters');
    }
};
