<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule expiry checks daily at 8 AM
Schedule::command('fleet:check-expiries')->dailyAt('08:00');

// Schedule weekly summary reports every Monday at 9 AM
Schedule::command('fleet:weekly-summary')->weeklyOn(1, '09:00');
