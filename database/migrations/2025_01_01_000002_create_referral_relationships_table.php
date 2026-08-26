<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Materialized-path referral tree. `ancestor_path` stores the user ids of
        // every ancestor from root to direct referrer, e.g. "/1/5/12/" which makes
        // generation lookup and cycle prevention cheap and safe.
        Schema::create('referral_relationships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete(); // descendant
            $table->foreignId('referrer_id')->constrained('users')->restrictOnDelete(); // direct upline
            $table->unsignedBigInteger('depth')->default(1); // generations below referrer's root chain start
            $table->string('ancestor_path'); // "/1/5/12/" — ancestors of user_id, nearest last
            $table->timestamps();

            $table->index('referrer_id');
            $table->index(['referrer_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referral_relationships');
    }
};
