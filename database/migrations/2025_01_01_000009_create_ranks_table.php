<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ranks', function (Blueprint $table) {
            $table->id();
            $table->string('name', 60);
            $table->string('slug', 60)->unique();
            $table->unsignedTinyInteger('level'); // ascending order, higher = better
            $table->string('color', 20)->default('#6b7280');
            $table->text('description')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        // key => required value, e.g. direct_referrals=5, team_size=25, team_volume=1000
        Schema::create('rank_requirements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rank_id')->constrained()->cascadeOnDelete();
            $table->string('key', 50);
            $table->decimal('value', 16, 2);
            $table->timestamps();

            $table->unique(['rank_id', 'key']);
        });

        Schema::create('user_ranks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('rank_id')->constrained()->restrictOnDelete();
            $table->string('status', 20)->default(\App\Enums\UserRankStatus::Active->value);
            $table->json('metrics_snapshot')->nullable();
            $table->timestamp('achieved_at');
            $table->timestamps();

            $table->unique(['user_id', 'status'], 'user_ranks_one_active');
            $table->index(['rank_id']);
        });

        Schema::create('rank_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('old_rank_id')->nullable()->constrained('ranks')->nullOnDelete();
            $table->foreignId('new_rank_id')->nullable()->constrained('ranks')->nullOnDelete();
            $table->string('reason', 255)->nullable();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rank_histories');
        Schema::dropIfExists('user_ranks');
        Schema::dropIfExists('rank_requirements');
        Schema::dropIfExists('ranks');
    }
};
