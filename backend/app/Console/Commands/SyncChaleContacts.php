<?php

namespace App\Console\Commands;

use App\Http\Controllers\Api\ContactSyncController;
use Illuminate\Console\Command;
use Illuminate\Http\Request;

class SyncChaleContacts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'contacts:sync-chale 
                            {--force : Force sync even if already synced today}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync contacts from Chale App external API';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting Chale App contact sync...');
        
        $force = $this->option('force');
        
        $controller = new ContactSyncController();
        $request = new Request(['force' => $force]);
        
        $response = $controller->sync($request);
        
        $data = json_decode($response->getContent(), true);
        
        if ($data['success'] ?? false) {
            $this->info($data['message']);
            return Command::SUCCESS;
        } else {
            $this->error($data['message'] ?? 'Sync failed');
            return Command::FAILURE;
        }
    }
}
