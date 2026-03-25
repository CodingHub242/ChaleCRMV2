<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Crypt;

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
     * Test IMAP connection.
     */
    public function testConnection(): bool
    {
        try {
            $hostname = sprintf(
                '{%s:%d/imap/%s}',
                $this->imap_host,
                $this->imap_port,
                $this->imap_encryption ?? 'ssl'
            );

            $imap = @imap_open($hostname, $this->username, $this->getDecryptedPassword(), OP_HALFOPEN);
            
            if ($imap) {
                imap_close($imap);
                return true;
            }
            return false;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Fetch new emails from the IMAP server.
     */
    public function fetchEmails(int $limit = 50): array
    {
        try {
            $hostname = sprintf(
                '{%s:%d/imap/%s}',
                $this->imap_host,
                $this->imap_port,
                $this->imap_encryption ?? 'ssl'
            );

            $imap = @imap_open(
                $hostname, 
                $this->username, 
                $this->getDecryptedPassword(),
                0,
                1 // Don't validate certificates
            );

            if (!$imap) {
                return [];
            }

            // Search for unseen emails (INBOX)
            $emails = imap_search($imap, 'UNSEEN', SE_FREE, 'UTF-8');

            if (!$emails) {
                imap_close($imap);
                return [];
            }

            // Sort by date (newest first) and limit
            rsort($emails);
            $emails = array_slice($emails, 0, $limit);

            $results = [];
            foreach ($emails as $emailNumber) {
                $overview = imap_fetch_overview($imap, $emailNumber, 0);
                if ($overview) {
                    $results[] = [
                        'uid' => $overview[0]->uid,
                        'message_id' => $overview[0]->message_id ?? null,
                        'from' => $overview[0]->from ?? '',
                        'from_email' => $this->extractEmail($overview[0]->from ?? ''),
                        'to' => $overview[0]->to ?? '',
                        'cc' => $overview[0]->cc ?? '',
                        'subject' => $overview[0]->subject ?? '(No Subject)',
                        'date' => $overview[0]->date ?? now()->toIso8601String(),
                        'seen' => $overview[0]->seen ?? false,
                        'answered' => $overview[0]->answered ?? false,
                        'flagged' => $overview[0]->flagged ?? false,
                        'size' => $overview[0]->size ?? 0,
                    ];
                }
            }

            imap_close($imap);
            
            // Update last sync time
            $this->update(['last_sync_at' => now()]);

            return $results;
        } catch (\Exception $e) {
            return [];
        }
    }

    /**
     * Get full email content.
     */
    public function getEmailContent(int $uid): ?array
    {
        try {
            $hostname = sprintf(
                '{%s:%d/imap/%s}',
                $this->imap_host,
                $this->imap_port,
                $this->imap_encryption ?? 'ssl'
            );

            $imap = @imap_open(
                $hostname, 
                $this->username, 
                $this->getDecryptedPassword(),
                0,
                1
            );

            if (!$imap) {
                return null;
            }

            // Find the message number by UID
            $messageNumber = imap_msgno($imap, $uid);
            
            if (!$messageNumber) {
                imap_close($imap);
                return null;
            }

            // Get structure
            $structure = imap_fetchstructure($imap, $messageNumber, 0);
            
            // Get overview
            $overview = imap_fetch_overview($imap, $messageNumber, 0);
            
            // Get body (plain text)
            $body = '';
            $htmlBody = '';
            
            if (isset($structure->parts)) {
                // Multipart message
                $body = $this->getPart($imap, $messageNumber, $structure->parts, 'TEXT', 'PLAIN');
                $htmlBody = $this->getPart($imap, $messageNumber, $structure->parts, 'TEXT', 'HTML');
            } else {
                // Simple message
                $body = imap_body($imap, $messageNumber, 0);
            }

            // Decode body
            $body = $this->decodeBody($body, $structure->encoding ?? null);
            $htmlBody = $this->decodeBody($htmlBody, $structure->encoding ?? null);

            // Mark as seen
            imap_setflag_full($imap, $messageNumber, '\\Seen', ST_UID);

            imap_close($imap);

            return [
                'uid' => $uid,
                'message_id' => $overview[0]->message_id ?? null,
                'from' => $overview[0]->from ?? '',
                'from_email' => $this->extractEmail($overview[0]->from ?? ''),
                'from_name' => $this->extractName($overview[0]->from ?? ''),
                'to' => $overview[0]->to ?? '',
                'to_email' => $this->extractEmail($overview[0]->to ?? ''),
                'cc' => $overview[0]->cc ?? '',
                'subject' => $overview[0]->subject ?? '(No Subject)',
                'date' => $overview[0]->date ?? now()->toIso8601String(),
                'seen' => true, // Now marked as seen
                'body' => $body,
                'html_body' => $htmlBody,
            ];
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Extract email address from string.
     */
    private function extractEmail(string $str): string
    {
        if (preg_match('/<(.+)>/', $str, $matches)) {
            return $matches[1];
        }
        return trim($str);
    }

    /**
     * Extract name from email string.
     */
    private function extractName(string $str): string
    {
        if (preg_match('/^(.+)\s*</', $str, $matches)) {
            return trim($matches[1], '"');
        }
        return '';
    }

    /**
     * Decode body content.
     */
    private function decodeBody(?string $body, ?int $encoding): string
    {
        if (empty($body)) {
            return '';
        }

        switch ($encoding) {
            case 1: // 7BIT
            case 2: // 8BIT
            case 4: // QUOTED-PRINTABLE
                return quoted_printable_decode($body);
            case 3: // BASE64
                return base64_decode($body);
            default:
                return $body;
        }
    }

    /**
     * Get part of multipart message.
     */
    private function getPart($imap, int $messageNumber, array $parts, string $type, string $subtype): ?string
    {
        foreach ($parts as $part) {
            if ($part->type == $this->getPartType($type) && $part->subtype == $subtype) {
                $body = imap_fetchbody($imap, $messageNumber, $part->number, 0);
                return $this->decodeBody($body, $part->encoding);
            }
            
            if (isset($part->parts)) {
                $result = $this->getPart($imap, $messageNumber, $part->parts, $type, $subtype);
                if ($result) {
                    return $result;
                }
            }
        }
        return null;
    }

    /**
     * Get IMAP part type number.
     */
    private function getPartType(string $type): int
    {
        switch (strtoupper($type)) {
            case 'TEXT': return 0;
            case 'MULTIPART': return 1;
            case 'MESSAGE': return 2;
            case 'APPLICATION': return 3;
            case 'AUDIO': return 4;
            case 'IMAGE': return 5;
            case 'VIDEO': return 6;
            default: return 0;
        }
    }
}