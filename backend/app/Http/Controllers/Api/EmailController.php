<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use App\Models\EmailHistory;
use App\Mail\CrmEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class EmailController extends Controller
{
    /**
     * Send an email
     */
    public function send(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'to' => 'required|array|min:1',
            'to.*' => 'email',
            'cc' => 'nullable|array',
            'cc.*' => 'email',
            'bcc' => 'nullable|array',
            'bcc.*' => 'email',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'template_id' => 'nullable|integer',
            'variables' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        
        // Process template if template_id is provided
        $subject = $data['subject'];
        $body = $data['body'];
        
        if (!empty($data['template_id'])) {
            $template = EmailTemplate::find($data['template_id']);
            if ($template) {
                $subject = $template->subject ?: $data['subject'];
                $body = $template->body ?: $data['body'];
                
                // Replace variables in template
                if (!empty($data['variables'])) {
                    foreach ($data['variables'] as $key => $value) {
                        $body = str_replace("{{{$key}}}", $value, $body);
                        $subject = str_replace("{{{$key}}}", $value, $subject);
                    }
                }
            }
        }

        try {
            // Send email using Laravel's Mail facade with Mailable
            $email = new CrmEmail(
                $subject,
                $body,
                $template->name ?? null
            );
            
            Mail::to($data['to'])->send($email);

            // Also send to CC if provided
            if (!empty($data['cc'])) {
                Mail::to($data['to'])->cc($data['cc'])->send($email);
            }
            
            // Also send to BCC if provided
            if (!empty($data['bcc'])) {
                Mail::to($data['to'])->bcc($data['bcc'])->send($email);
            }

            // Save to email history
            EmailHistory::create([
                'user_id' => auth()->id() ?? 1,
                'to' => json_encode($data['to']),
                'cc' => !empty($data['cc']) ? json_encode($data['cc']) : null,
                'bcc' => !empty($data['bcc']) ? json_encode($data['bcc']) : null,
                'subject' => $subject,
                'body' => $body,
                'template_id' => $data['template_id'] ?? null,
                'sent_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Email sent successfully',
                'data' => [
                    'to' => $data['to'],
                    'subject' => $subject
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send email: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Send email to a specific contact
     */
    public function sendToContact(Request $request, $contactId)
    {
        $contact = \App\Models\Contact::findOrFail($contactId);
        
        $request->merge([
            'to' => [$contact->email]
        ]);
        
        return $this->send($request);
    }

    /**
     * Get email history
     */
    public function history(Request $request)
    {
        $query = EmailHistory::with(['template', 'user']);
        
        if ($request->has('contact_id')) {
            $query->where('to', 'like', '%"' . $request->contact_id . '"%');
        }
        
        $perPage = $request->per_page ?? 15;
        $histories = $query->orderBy('sent_at', 'desc')->paginate($perPage);
            
        return response()->json([
            'success' => true,
            'data' => $histories
        ]);
    }

    /**
     * Preview email template
     */
    public function preview(Request $request, $templateId)
    {
        $template = EmailTemplate::findOrFail($templateId);
        
        $body = $template->body;
        $subject = $template->subject;
        
        // Replace variables with provided values or placeholders
        $variables = $request->variables ?? [];
        foreach ($variables as $key => $value) {
            $body = str_replace("{{{$key}}}", $value, $body);
            $subject = str_replace("{{{$key}}}", $value, $subject);
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'subject' => $subject,
                'body' => $body,
                'template' => $template
            ]
        ]);
    }
}
