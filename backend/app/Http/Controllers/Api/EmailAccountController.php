<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ScopesByOrganization;
use App\Models\EmailAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EmailAccountController extends Controller
{
    use ScopesByOrganization;

    /**
     * Get all email accounts for the organization.
     */
    public function index(Request $request)
    {
        $organizationId = $this->getOrganizationId();
        
        $query = EmailAccount::query();
        if ($organizationId) {
            $query->where('organization_id', $organizationId);
        }
        
        $accounts = $query->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        // Hide password in response
        $accounts->makeHidden('password');

        return response()->json([
            'success' => true,
            'data' => $accounts
        ]);
    }

    /**
     * Store a new email account.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'name' => 'nullable|string|max:255',
            'imap_host' => 'required|string|max:255',
            'imap_port' => 'nullable|integer|min:1|max:65535',
            'imap_encryption' => 'nullable|in:ssl,tls,null',
            'username' => 'required|string|max:255',
            'password' => 'required|string',
            'smtp_host' => 'nullable|string|max:255',
            'smtp_port' => 'nullable|integer|min:1|max:65535',
            'smtp_encryption' => 'nullable|in:ssl,tls,null',
            'is_default' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        $data['organization_id'] = $this->getOrganizationId();
        
        // Set default encryption values if not provided
        $data['imap_encryption'] = $data['imap_encryption'] ?? 'ssl';
        $data['imap_port'] = $data['imap_port'] ?? 993;
        
        // Handle default flag
        if ($data['is_default'] ?? false) {
            EmailAccount::where('organization_id', $data['organization_id'])
                ->update(['is_default' => false]);
        }

        $account = EmailAccount::create($data);
        $account->makeHidden('password');

        return response()->json([
            'success' => true,
            'data' => $account,
            'message' => 'Email account added successfully'
        ], 201);
    }

    /**
     * Show a specific email account.
     */
    public function show(int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $account = EmailAccount::query()
            ->where('organization_id', $organizationId)
            ->findOrFail($id);
        
        $account->makeHidden('password');

        return response()->json([
            'success' => true,
            'data' => $account
        ]);
    }

    /**
     * Update an email account.
     */
    public function update(Request $request, int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $account = EmailAccount::query()
            ->where('organization_id', $organizationId)
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'email' => 'sometimes|email',
            'name' => 'nullable|string|max:255',
            'imap_host' => 'sometimes|string|max:255',
            'imap_port' => 'nullable|integer|min:1|max:65535',
            'imap_encryption' => 'nullable|in:ssl,tls,null',
            'username' => 'sometimes|string|max:255',
            'password' => 'nullable|string',
            'smtp_host' => 'nullable|string|max:255',
            'smtp_port' => 'nullable|integer|min:1|max:65535',
            'smtp_encryption' => 'nullable|in:ssl,tls,null',
            'is_active' => 'nullable|boolean',
            'is_default' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        
        // Handle default flag
        if ($data['is_default'] ?? false) {
            EmailAccount::where('organization_id', $account->organization_id)
                ->where('id', '!=', $id)
                ->update(['is_default' => false]);
        }

        // Only update password if provided
        if (empty($data['password'])) {
            unset($data['password']);
        }

        $account->update($data);
        $account->makeHidden('password');

        return response()->json([
            'success' => true,
            'data' => $account,
            'message' => 'Email account updated successfully'
        ]);
    }

    /**
     * Delete an email account.
     */
    public function destroy(int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $account = EmailAccount::query()
            ->where('organization_id', $organizationId)
            ->findOrFail($id);

        $account->delete();

        return response()->json([
            'success' => true,
            'message' => 'Email account deleted successfully'
        ]);
    }

    /**
     * Test IMAP connection.
     */
    public function testConnection(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'imap_host' => 'required|string|max:255',
            'imap_port' => 'nullable|integer|min:1|max:65535',
            'imap_encryption' => 'nullable|in:ssl,tls,null',
            'username' => 'required|string|max:255',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        $data['imap_port'] = $data['imap_port'] ?? 993;
        $data['imap_encryption'] = $data['imap_encryption'] ?? 'ssl';

        // Create a temporary account to test
        $account = new EmailAccount($data);
        $result = $account->testConnection();

        return response()->json([
            'success' => $result,
            'message' => $result 
                ? 'Connection successful!' 
                : 'Failed to connect. Please check your credentials and settings.'
        ]);
    }

    /**
     * Fetch emails from an email account and optionally create SQRs.
     */
    public function fetchEmails(Request $request, int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $account = EmailAccount::query()
            ->where('organization_id', $organizationId)
            ->where('is_active', true)
            ->findOrFail($id);

        $limit = $request->input('limit', 50);
        $createSqrs = $request->input('create_sqrs', false);
        $emails = $account->fetchEmails($limit);

        // If auto-create SQRs is enabled, process each email
        if ($createSqrs || $account->auto_create_sqr) {
            $sqrsCreated = 0;
            
            foreach ($emails as $email) {
                // Check if we already have an SQR for this email (by message_id or from+subject)
                $existingSqr = \App\Models\Sqr::where('organization_id', $organizationId)
                    ->where('email_message_id', $email['message_id'])
                    ->first();
                
                if (!$existingSqr && $email['message_id']) {
                    // Try to find by from_email and subject combination
                    $existingSqr = \App\Models\Sqr::where('organization_id', $organizationId)
                        ->where('from_email', $email['from_email'])
                        ->where('title', 'like', '%' . substr($email['subject'], 0, 50) . '%')
                        ->whereRaw('created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)')
                        ->first();
                }
                
                if (!$existingSqr) {
                    // Create new SQR from email
                    $sqrData = [
                        'title' => $email['subject'] ?: 'Email from ' . $email['from_email'],
                        'description' => "From: {$email['from_email']}\n\nEmail received but full content not stored.\nMessage ID: " . ($email['message_id'] ?? 'N/A'),
                        'type' => 'Inquiry',
                        'priority' => 'Medium',
                        'status' => 'Open',
                        'email_message_id' => $email['message_id'] ?? null,
                        'from_email' => $email['from_email'],
                        'organization_id' => $organizationId,
                        'created_by' => auth()->id() ?? 1,
                        'ticket_number' => $this->generateTicketNumber($organizationId),
                    ];
                    
                    // Try to find existing contact by email
                    $contact = \App\Models\Contact::where('organization_id', $organizationId)
                        ->where('email', $email['from_email'])
                        ->first();
                    
                    if ($contact) {
                        $sqrData['contact_id'] = $contact->id;
                    }
                    
                    \App\Models\Sqr::create($sqrData);
                    $sqrsCreated++;
                }
            }
            
            return response()->json([
                'success' => true,
                'data' => $emails,
                'meta' => [
                    'account' => [
                        'id' => $account->id,
                        'email' => $account->email,
                        'last_sync_at' => $account->last_sync_at,
                    ],
                    'count' => count($emails),
                    'sqrs_created' => $sqrsCreated
                ]
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $emails,
            'meta' => [
                'account' => [
                    'id' => $account->id,
                    'email' => $account->email,
                    'last_sync_at' => $account->last_sync_at,
                ],
                'count' => count($emails)
            ]
        ]);
    }

    /**
     * Generate a unique ticket number.
     */
    private function generateTicketNumber(?int $organizationId): string
    {
        $date = now()->format('Ymd');
        $prefix = 'SQR-' . $date;
        
        $query = \App\Models\Sqr::where('ticket_number', 'like', $prefix . '-%');
        
        if ($organizationId) {
            $query->where('organization_id', $organizationId);
        }
        
        $lastTicket = $query->orderBy('ticket_number', 'desc')->first();
        
        if ($lastTicket) {
            $lastNumber = (int) substr($lastTicket->ticket_number, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }
        
        return $prefix . '-' . $newNumber;
    }

    /**
     * Get a specific email's content.
     */
    public function getEmailContent(Request $request, int $id, int $uid)
    {
        $organizationId = $this->getOrganizationId();
        
        $account = EmailAccount::query()
            ->where('organization_id', $organizationId)
            ->where('is_active', true)
            ->findOrFail($id);

        $email = $account->getEmailContent($uid);

        if (!$email) {
            return response()->json([
                'success' => false,
                'message' => 'Email not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $email
        ]);
    }

    /**
     * Get the default email account.
     */
    public function getDefault(Request $request)
    {
        $organizationId = $this->getOrganizationId();
        
        $account = EmailAccount::query()
            ->where('organization_id', $organizationId)
            ->where('is_active', true)
            ->where('is_default', true)
            ->first();

        if (!$account) {
            // Fallback to any active account
            $account = EmailAccount::query()
                ->where('organization_id', $organizationId)
                ->where('is_active', true)
                ->first();
        }

        if ($account) {
            $account->makeHidden('password');
        }

        return response()->json([
            'success' => true,
            'data' => $account
        ]);
    }

    /**
     * Send a reply to an email.
     */
    public function sendReply(Request $request, int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $account = EmailAccount::query()
            ->where('organization_id', $organizationId)
            ->where('is_active', true)
            ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'to' => 'required|email',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'cc' => 'nullable|email',
            'in_reply_to' => 'nullable|string',
            'references' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // Use the existing EmailController's send method
        $emailController = new EmailController();
        
        $request->merge([
            'to' => [$request->to],
            'cc' => $request->cc ? [$request->cc] : [],
            'body' => $request->body,
        ]);

        return $emailController->send($request);
    }
}