<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    protected $fillable = [
        'name',
        'category',
        'subject',
        'body',
        'variables',
        'is_active',
    ];

    protected $casts = [
        'variables' => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * Render the template with variables
     */
    public function render(array $variables = []): array
    {
        $subject = $this->subject;
        $body = $this->body;
        
        // Replace variables
        foreach ($variables as $key => $value) {
            $body = str_replace("{{{$key}}}", $value, $body);
            $subject = str_replace("{{{$key}}}", $value, $subject);
        }
        
        return [
            'subject' => $subject,
            'body' => $body,
            'template' => $this
        ];
    }
}
