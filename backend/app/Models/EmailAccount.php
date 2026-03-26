<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;
use Webklex\PHPIMAP\Client;
use Webklex\PHPIMAP\ClientManager;

class EmailAccount extends Model
{
    use HasFactory;

    protected $fillable = [
        'organization_id',
        'email',
        'name',
        'imap_host',
        'imap_port',
        'imap_encryption',
        'username',
        'password',
        'smtp_host',
        'smtp_port',
        'smtp_encryption',
        'is_active',
        'is_default',
        'auto_create_sqr',
        'last_sync_at',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_default' => 'boolean',
        'imap_port' => 'integer',
        'smtp_port' => 'integer',
        'last_sync_at' => 'datetime',
    ];

    /**
     * Get the organization that owns this email account.
     */
    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    /**
     * Get the decrypted password.
     */
    public function getDecryptedPassword(): string
    {
        try {
            return Crypt::decryptString($this->password);
        } catch (\Exception $e) {
            return $this->password;
        }
    }

    /**
     * Set the password (encrypted).
     */
    public function setPasswordAttribute($value): void
    {
        $this->attributes['password'] = Crypt::encryptString($value);
    }

    /**
     * Get the IMAP encryption type for webklex.
     */
    private function getImapEncryption(): string
    {
        $encryption = strtolower($this->imap_encryption ?? 'ssl');
        switch ($encryption) {
            case 'ssl':
                return 'ssl';
            case 'tls':
                return 'tls';
            case 'starttls':
                return 'tls';
            default:
                return 'ssl';
        }
    }

    /**
     * Create and return an IMAP client instance.
     */
    public function getClient(): ?Client
    {
        try {
            $encryption = $this->getImapEncryption();
            
            // Initialize ClientManager with config
            $cm = new ClientManager([
                'accounts' => [
                    'default' => [
                        'driver' => 'imap',
                        'host' => $this->imap_host,
                        'port' => $this->imap_port,
                        'encryption' => $encryption,
                        'validate_cert' => false,
                        'username' => $this->username,
                        'password' => $this->getDecryptedPassword(),
                        'protocol' => 'imap',
                    ],
                ],
            ]);
            
            // Get the account config from the ClientManager
            $accountConfig = $cm->getConfig('default');
            
            // Create and return the Client with array config
            $client = new Client($accountConfig);
            
            return $client;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Test IMAP connection using webklex/php-imap.
     * Returns array with success status and message/error details.
     */
    public function testConnection(): array
    {
        try {
            $client = $this->getClient();
            if (!$client) {
                return [
                    'success' => false,
                    'message' => 'Failed to create IMAP client',
                    'error' => 'Could not initialize the IMAP client with the given settings'
                ];
            }

            // Actually connect to the server
            $client->connect();
            
            // Try to access the INBOX folder
            $folder = $client->getFolder('INBOX');
            if ($folder) {
                // Try a simple operation to verify connection
                $folder->checkConnection();
                return [
                    'success' => true,
                    'message' => 'Connection successful!',
                    'error' => null
                ];
            }
            
            return [
                'success' => false,
                'message' => 'Failed to access INBOX folder',
                'error' => 'Connected but could not access email folder'
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Connection failed',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Fetch new emails from the IMAP server using webklex/php-imap.
     */
    public function fetchEmails(int $limit = 50): array
    {
        try {
            $client = $this->getClient();
            if (!$client) {
                return [];
            }

            $folder = $client->getFolder('INBOX');
            if (!$folder) {
                return [];
            }

            // Get unseen messages
            $query = $folder->query()->unseen();
            $messages = $query->limit($limit)->get();

            if ($messages->isEmpty()) {
                return [];
            }

            $results = [];
            /** @var \Webklex\PHPIMAP\Message $message */
            foreach ($messages as $message) {
                $from = $message->getFrom()->first();
                
                $results[] = [
                    'uid' => $message->getUid(),
                    'message_id' => $message->getMessageId(),
                    'from' => $from ? $from->mail : '',
                    'from_email' => $from ? $from->mail : '',
                    'from_name' => $from ? ($from->personal ?? '') : '',
                    'to' => $message->getTo()->pluck('mail')->implode(', '),
                    'cc' => $message->getCc()->pluck('mail')->implode(', '),
                    'subject' => $message->getSubject() ?? '(No Subject)',
                    'date' => $message->getDate()->toIso8601String(),
                    'seen' => false, // It's unseen since we queried for unseen
                    'answered' => $message->getAnswered(),
                    'flagged' => $message->getFlagged(),
                    'size' => $message->getSize(),
                ];
            }

            // Update last sync time
            $this->update(['last_sync_at' => now()]);

            return $results;
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Get full email content using webklex/php-imap.
     */
    public function getEmailContent(int $uid): ?array
    {
        try {
            $client = $this->getClient();
            if (!$client) {
                return null;
            }

            $folder = $client->getFolder('INBOX');
            if (!$folder) {
                return null;
            }

            // Find message by UID
            $message = $folder->query()->uid($uid)->get()->first();
            
            if (!$message) {
                return null;
            }

            // Get from address
            $from = $message->getFrom()->first();
            $to = $message->getTo()->first();
            $cc = $message->getCc()->first();

            // Get body content
            $body = '';
            $htmlBody = '';

            // Try to get HTML body first
            try {
                $htmlBody = $message->getHTMLBody();
            } catch (\Exception $e) {
                // HTML body not available
            }

            // Fall back to plain text
            if (empty($htmlBody)) {
                try {
                    $body = $message->getTextBody();
                } catch (\Exception $e) {
                    $body = '';
                }
            }

            // Mark as seen
            $message->setFlag(['\\Seen']);

            return [
                'uid' => $message->getUid(),
                'message_id' => $message->getMessageId(),
                'from' => $from ? ($from->personal ?? $from->mail) : '',
                'from_email' => $from ? $from->mail : '',
                'from_name' => $from ? ($from->personal ?? '') : '',
                'to' => $to ? $to->mail : '',
                'to_email' => $to ? $to->mail : '',
                'cc' => $cc ? $cc->mail : '',
                'subject' => $message->getSubject() ?? '(No Subject)',
                'date' => $message->getDate()->toIso8601String(),
                'seen' => true,
                'body' => $body,
                'html_body' => $htmlBody,
            ];
        } catch (\Exception $e) {
            return null;
        }
    }
}