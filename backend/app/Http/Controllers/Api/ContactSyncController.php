<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ContactSyncController extends Controller
{
    /**
     * External API URL
     */
    protected string $externalApiUrl = 'https://app.chaleapp.org/api/getContacts';
    
    /**
     * Cache key for last sync time
     */
    protected string $lastSyncCacheKey = 'contacts_last_sync';

    /**
     * Maximum number of records to process per request (0 = all)
     */
    protected int $defaultPerPage = 500;

    /**
     * Sync contacts from external API
     * Fetches and processes ONE PAGE (batch) per request
     */
    public function sync(Request $request)
    {
        $forceSync = $request->boolean('force', false);
        $page = $request->integer('page', 1); // which page to fetch (1, 2, 3, etc.)
        $batchSize = $request->integer('batch_size', 500); // records per page (from external API)
        
        // Check if we should skip based on daily limit (unless forced)
        if (!$forceSync && !$this->shouldSync()) {
            return response()->json([
                'success' => false,
                'message' => 'Sync already completed today. Use ?force=true to sync anyway.',
                'last_sync' => cache($this->lastSyncCacheKey)
            ]);
        }

        try {
            // Fetch only ONE page from external API
            $result = $this->fetchSinglePage($page, $batchSize);
            
            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch external contacts: ' . $result['error']
                ]);
            }

            $contacts = $result['data'];
            $totalOnPage = count($contacts);
            
            if ($totalOnPage === 0) {
                return response()->json([
                    'success' => true,
                    'message' => "No more records to sync. Finished at page {$page}.",
                    'data' => [
                        'imported' => 0,
                        'skipped' => 0,
                        'page' => $page,
                        'has_more' => false
                    ]
                ]);
            }

            // Process this batch
            $synced = $this->processContacts($contacts);
            
            // Update last sync time
            cache([$this->lastSyncCacheKey => Carbon::now()->toDateTimeString()], now()->addDays(1));

            return response()->json([
                'success' => true,
                'message' => "Page {$page} completed. {$synced['imported']} imported, {$synced['skipped']} skipped.",
                'data' => [
                    'imported' => $synced['imported'],
                    'skipped' => $synced['skipped'],
                    'page' => $page,
                    'records_on_page' => $totalOnPage,
                    'has_more' => $totalOnPage === $batchSize,
                    'last_sync' => Carbon::now()->toDateTimeString()
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Contact sync failed: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Sync failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Fetch a single page from external API
     */
    protected function fetchSinglePage(int $page, int $perPage): array
    {
        try {
            $response = Http::timeout(120)->get($this->externalApiUrl, [
                'page' => $page,
                'per_page' => $perPage
            ]);

            if (!$response->successful()) {
                return ['success' => false, 'error' => "HTTP " . $response->status() . ": " . $response->body()];
            }

            $data = $response->json();
            
            if (empty($data['data'])) {
                return ['success' => true, 'data' => []];
            }

            return ['success' => true, 'data' => $data['data']];

        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Check if we should sync (once per day)
     */
    protected function shouldSync(): bool
    {
        $lastSync = cache($this->lastSyncCacheKey);
        
        if (!$lastSync) {
            return true;
        }
        
        // Check if last sync was today
        $lastSyncDate = Carbon::parse($lastSync)->toDateString();
        $today = Carbon::now()->toDateString();
        
        return $lastSyncDate !== $today;
    }

    /**
     * Process and sync contacts
     */
    protected function processContacts(array $externalContacts): array
    {
        $imported = 0;
        $skipped = 0;
        
        foreach ($externalContacts as $externalContact) {
            try {
                // Map fields from orders table
                // The API selects orders.* which includes all order columns
                $email = $externalContact['customer_email'] ?? null;
                $name = $externalContact['customer_name'] ?? null;
                $phone = $externalContact['customer_phone'] ?? null;
                $eventName = $externalContact['event_name'] ?? '';
                
                // Validate required fields - skip if email is null, empty, or not set
                if (empty($email) || $email === 'null' || $email === 'NULL') {
                    $skipped++;
                    continue;
                }
                
                // Also skip if email is invalid format
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $skipped++;
                    continue;
                }
                
                // Check if contact already exists by email
                $existingContact = Contact::where('email', $email)->first();
                
                if ($existingContact) {
                    // Contact exists - skip
                    $skipped++;
                    continue;
                }
                
                // Parse name into first_name and last_name
                $nameParts = $this->parseName($name ?? '');
                
                // Create new contact
                Contact::create([
                    'first_name' => $nameParts['first_name'],
                    'last_name' => $nameParts['last_name'],
                    'email' => $email,
                    'phone' => $phone,
                    'owner_id' => 1, // Default owner
                    'organization_id' => 1,
                    'source' => $eventName,
                    'lead_status' => 'new',
                ]);
                
                $imported++;
                
            } catch (\Exception $e) {
                Log::error("Failed to sync contact: " . $e->getMessage());
                $skipped++;
            }
        }
        
        return [
            'imported' => $imported,
            'skipped' => $skipped
        ];
    }

    /**
     * Parse full name into first_name and last_name
     */
    protected function parseName(?string $fullName): array
    {
        if (empty($fullName)) {
            return ['first_name' => 'Unknown', 'last_name' => ''];
        }
        
        // Trim whitespace
        $fullName = trim($fullName);
        
        // Handle multiple spaces
        $fullName = preg_replace('/\s+/', ' ', $fullName);
        
        // Split by space
        $parts = explode(' ', $fullName);
        
        if (count($parts) === 1) {
            return [
                'first_name' => ucfirst($parts[0]),
                'last_name' => ''
            ];
        }
        
        // Last part is last name, everything else is first name
        $lastName = array_pop($parts);
        $firstName = implode(' ', $parts);
        
        return [
            'first_name' => ucfirst($firstName),
            'last_name' => ucfirst($lastName)
        ];
    }

    /**
     * Get sync status info
     */
    public function status()
    {
        $lastSync = cache($this->lastSyncCacheKey);
        $today = Carbon::now()->toDateString();
        
        $lastSyncDate = $lastSync ? Carbon::parse($lastSync)->toDateString() : null;
        $canSync = $lastSyncDate !== $today;
        
        return response()->json([
            'success' => true,
            'data' => [
                'last_sync' => $lastSync,
                'last_sync_human' => $lastSync ? Carbon::parse($lastSync)->diffForHumans() : 'Never',
                'can_sync' => $canSync,
                'sync_due' => $canSync,
                'external_api' => $this->externalApiUrl
            ]
        ]);
    }

    /**
     * Manual trigger endpoint (can be called by cron job)
     */
    public function triggerSync()
    {
        return $this->sync(new Request(['force' => true]));
    }
}
