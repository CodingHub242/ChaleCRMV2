<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EmailHistory extends Model
{
    protected $fillable = [
        'user_id',
        'to',
        'cc',
        'bcc',
        'subject',
        'body',
        'template_id',
        'sent_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(\App\Models\ZohoUser::class, 'user_id');
    }

    public function template()
    {
        return $this->belongsTo(EmailTemplate::class, 'template_id');
    }

    public function getToArrayAttribute()
    {
        return json_decode($this->to, true) ?? [];
    }

    public function getCcArrayAttribute()
    {
        return $this->cc ? json_decode($this->cc, true) ?? [] : [];
    }

    public function getBccArrayAttribute()
    {
        return $this->bcc ? json_decode($this->bcc, true) ?? [] : [];
    }
}
