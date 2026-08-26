<?php

use Illuminate\Support\Facades\Schedule;

// Verify pending payments with gateways; expire stale ones.
Schedule::command('payments:check-pending')->hourly();

// Rank promotions from live team metrics (no financial payouts here).
Schedule::command('ranks:evaluate')->dailyAt('03:00');

// Eligibility scan only — payouts always require explicit admin approval.
Schedule::command('returns:mark-eligible')->dailyAt('04:00');
