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
     * Maximum number of times to retry failed requests
     */
    protected int $maxRetries = 3;

    /**
     * Sync contacts from external API
     * Can be triggered manually or via scheduled command
     */
    public function sync(Request $request)
    {
        $forceSync = $request->boolean('force', false);
        $debug = $request->boolean('debug', false);
        
        // Check if we should skip based on daily limit (unless forced)
        if (!$forceSync && !$this->shouldSync()) {
            return response()->json([
                'success' => false,
                'message' => 'Sync already completed today. Use ?force=true to sync anyway.',
                'last_sync' => cache($this->lastSyncCacheKey)
            ]);
        }

        try {
            $result = $this->fetchExternalContacts($debug);
            
            // Handle debug response
            if (isset($result['debug'])) {
                return response()->json($result['debug']);
            }
            
            if (!$result['success']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to fetch external contacts: ' . $result['error']
                ]);
            }

            $synced = $this->processContacts($result['data']);
            
            // Update last sync time
            cache([$this->lastSyncCacheKey => Carbon::now()->toDateTimeString()], now()->addDays(1));

            return response()->json([
                'success' => true,
                'message' => "Sync completed. {$synced['imported']} imported, {$synced['skipped']} skipped.",
                'data' => [
                    'imported' => $synced['imported'],
                    'skipped' => $synced['skipped'],
                    'total_processed' => $synced['imported'] + $synced['skipped'],
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
     * Fetch contacts from external API with pagination
     */
    protected function fetchExternalContacts($debug = false): array
    {
        $allData = [];
        $page = 1;
        $perPage = 500;
        $maxPages = 100;
        $lastError = '';
        $firstPageData = null;
        
        try {
            while ($page <= $maxPages) {
                $response = Http::timeout(300)->get($this->externalApiUrl, [
                    'page' => $page,
                    'per_page' => $perPage
                ]);

                if (!$response->successful()) {
                    $lastError = "HTTP " . $response->status() . ": " . $response->body();
                    break;
                }

                $data = $response->json();
                
                // Store first page for debug
                if ($firstPageData === null) {
                    $firstPageData = $data;
                }
                
                if (empty($data['data'])) {
                    break;
                }

                $allData = array_merge($allData, $data['data']);

                Log::info('Fetched page ' . $page . ' with ' . count($data['data']) . ' records. Total so far: ' . count($allData));

                // Check for next page - try both formats
                $nextPageUrl = $data['next_page_url'] ?? $data['pagination']['next_page_url'] ?? null;
                
                if (empty($nextPageUrl)) {
                    break;
                }

                $page++;
            }

            Log::info('Total contacts fetched: ' . count($allData));
            
            // DEBUG MODE: Return first page data for inspection
            if ($debug && $firstPageData) {
                $emails = array_column($firstPageData['data'] ?? [], 'customer_email');
                // Try alternative field names
                if (empty($emails)) {
                    $emails = array_column($firstPageData['data'] ?? [], 'email');
                }
                
                return [
                    'success' => true,
                    'data' => $allData,
                    'debug' => [
                        'raw_first_page' => $firstPageData,
                        'sample_fields' => !empty($firstPageData['data']) ? array_keys($firstPageData['data'][0]) : [],
                        'emails' => $emails,
                        'total_records' => count($allData)
                    ]
                ];
            }

            return ['success' => true, 'data' => $allData];

        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Process and sync contacts
     */
    protected function processContacts(array $externalContacts): array
    {
        // Log the emails being processed
        Log::info('Processing contacts', ['emails' => array_column($externalContacts, 'customer_email')]);
        
        $imported = 0;
        $skipped = 0;
        
        foreach ($externalContacts as $externalContact) {
            try {
                // Map external API fields to internal fields
                // Try multiple field name variations
                $name = $externalContact['customer_name'] 
                    ?? $externalContact['name'] 
                    ?? $externalContact['customer_name'] 
                    ?? null;
                $email = $externalContact['customer_email'] 
                    ?? $externalContact['email'] 
                    ?? null;
                $phone = $externalContact['customer_phone'] 
                    ?? $externalContact['phone'] 
                    ?? null;
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
