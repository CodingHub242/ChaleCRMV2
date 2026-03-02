<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected function schedule(Schedule $schedule)
    {
        // Run daily at 6 AM
        $schedule->command('contacts:sync-chale')->dailyAt('6:00');
    }

    protected function commands()
    {
        $this->load(__DIR__.'/Commands');
    }
}
