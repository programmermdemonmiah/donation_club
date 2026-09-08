<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('ranks', function (Blueprint $table) {
            $table->decimal('monthly_salary', 16, 2)->default(0)->after('incentive_amount');
        });

        Schema::create('salary_payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('rank_id')->constrained()->cascadeOnDelete();
            $table->string('payout_month', 7); // Format: YYYY-MM
            $table->decimal('amount', 16, 2);
            $table->timestamps();

            // Ensure a user is only paid once per month
            $table->unique(['user_id', 'payout_month']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('salary_payouts');

        Schema::table('ranks', function (Blueprint $table) {
            $table->dropColumn('monthly_salary');
        });
    }
};
