<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Sqr extends Model
{
    protected $fillable = [
        'title',
        'type',
        'priority',
        'status',
        'description',
        'contact_id',
        'company_id',
        'assigned_to',
        'resolved_at',
        'resolution_notes',
        'organization_id',
    ];

    protected $casts = [
        'contact_id' => 'integer',
        'company_id' => 'integer',
        'assigned_to' => 'integer',
        'resolved_at' => 'datetime',
        'organization_id' => 'integer',
    ];

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(ZohoUser::class, 'assigned_to');
    }
}
