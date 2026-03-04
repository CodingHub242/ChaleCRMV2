<?php

namespace App\Jobs;

use App\Models\Contact;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessContactSync implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * The contacts to process
     */
    protected array $contacts;

    /**
     * Create a new job instance.
     */
    public function __construct(array $contacts)
    {
        $this->contacts = $contacts;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $imported = 0;
        $skipped = 0;

        foreach ($this->contacts as $externalContact) {
            try {
                // Map fields from orders table
                $email = $externalContact['customer_email'] ?? null;
                $name = $externalContact['customer_name'] ?? null;
                $phone = $externalContact['customer_phone'] ?? null;
                $eventName = $externalContact['event_name'] ?? '';

                // Validate required fields
                if (empty($email) || $email === 'null' || $email === 'NULL') {
                    $skipped++;
                    continue;
                }

                // Validate email format
                if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                    $skipped++;
                    continue;
                }

                // Check if contact already exists
                $existingContact = Contact::where('email', $email)->first();

                if ($existingContact) {
                    $skipped++;
                    continue;
                }

                // Parse name
                $nameParts = $this->parseName($name ?? '');

                // Create contact
                Contact::create([
                    'first_name' => $nameParts['first_name'],
                    'last_name' => $nameParts['last_name'],
                    'email' => $email,
                    'phone' => $phone,
                    'owner_id' => 1,
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

        Log::info("Contact sync job completed: $imported imported, $skipped skipped");
    }

    /**
     * Parse full name into first_name and last_name
     */
    protected function parseName(?string $fullName): array
    {
        if (empty($fullName)) {
            return ['first_name' => 'Unknown', 'last_name' => ''];
        }

        $fullName = trim($fullName);
        $fullName = preg_replace('/\s+/', ' ', $fullName);
        $parts = explode(' ', $fullName);

        if (count($parts) === 1) {
            return [
                'first_name' => ucfirst($parts[0]),
                'last_name' => ''
            ];
        }

        $lastName = array_pop($parts);
        $firstName = implode(' ', $parts);

        return [
            'first_name' => ucfirst($firstName),
            'last_name' => ucfirst($lastName)
        ];
    }
}
