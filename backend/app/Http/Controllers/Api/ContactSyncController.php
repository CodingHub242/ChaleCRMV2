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
        
        // Check if we should skip based on daily limit (unless forced)
        if (!$forceSync && !$this->shouldSync()) {
            return response()->json([
                'success' => false,
                'message' => 'Sync already completed today. Use ?force=true to sync anyway.',
                'last_sync' => cache($this->lastSyncCacheKey)
            ]);
        }

        try {
            $result = $this->fetchExternalContacts();
            
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
     * Fetch contacts from external API with retry logic
     */
    protected function fetchExternalContacts(): array
    {
        $attempt = 0;
        $lastError = '';
        
        while ($attempt < $this->maxRetries) {
            try {
                $response = Http::timeout(30)->get($this->externalApiUrl);
                
                if ($response->successful()) {
                    $data = $response->json();
                    
                    // Handle different response formats
                    if (isset($data['data'])) {
                        return ['success' => true, 'data' => $data['data']];
                    } elseif (is_array($data)) {
                        return ['success' => true, 'data' => $data];
                    }
                    
                    return ['success' => false, 'error' => 'Invalid response format'];
                }
                
                $lastError = "HTTP " . $response->status() . ": " . $response->body();
                
            } catch (\Exception $e) {
                $lastError = $e->getMessage();
            }
            
            $attempt++;
            
            if ($attempt < $this->maxRetries) {
                // Wait before retry (exponential backoff)
                sleep(pow(2, $attempt));
            }
        }
        
        return ['success' => false, 'error' => $lastError];
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
                // Validate required fields
                if (empty($externalContact['email'])) {
                    $skipped++;
                    continue;
                }
                
                // Check if contact already exists by email
                $existingContact = Contact::where('email', $externalContact['email'])->first();
                
                if ($existingContact) {
                    // Contact exists - skip
                    $skipped++;
                    continue;
                }
                
                // Parse name into first_name and last_name
                $nameParts = $this->parseName($externalContact['name'] ?? '');
                
                // Create new contact
                Contact::create([
                    'first_name' => $nameParts['first_name'],
                    'last_name' => $nameParts['last_name'],
                    'email' => $externalContact['email'],
                    'phone' => $externalContact['phone'] ?? null,
                    'owner_id' => 1, // Default owner
                    'organization_id' => 1,
                    'source' => 'chale_app_sync',
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
