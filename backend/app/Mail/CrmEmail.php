<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class CrmEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $subject;
    public $body;
    public $templateName;
    public $senderName;
    public $senderEmail;

    /**
     * Create a new message instance.
     */
    public function __construct(
        string $subject,
        string $body,
        ?string $templateName = null,
        ?string $senderName = null,
        ?string $senderEmail = null
    ) {
        $this->subject = $subject;
        $this->body = $body;
        $this->templateName = $templateName;
        $this->senderName = $senderName ?? config('app.name', 'CRM');
        $this->senderEmail = $senderEmail ?? config('mail.from.address', 'noreply@crm.com');
    }

    /**
     * Build the message.
     */
    public function build(): self
    {
        return $this->from($this->senderEmail, $this->senderName)
            ->subject($this->subject)
            ->view('emails.crm-template')
            ->with([
                'subject' => $this->subject,
                'body' => $this->body,
                'templateName' => $this->templateName,
                'senderName' => $this->senderName,
            ]);
    }
}
