<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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
        'owner_id',
        'resolved_at',
        'resolution_notes',
        'organization_id',
        'custom_fields',
        'created_by',
        'updated_by',
        'ticket_number',
    ];

    protected $casts = [
        'contact_id' => 'integer',
        'company_id' => 'integer',
        'assigned_to' => 'integer',
        'owner_id' => 'integer',
        'created_by' => 'integer',
        'updated_by' => 'integer',
        'resolved_at' => 'datetime',
        'organization_id' => 'integer',
        'custom_fields' => 'array',
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

    public function owner(): BelongsTo
    {
        return $this->belongsTo(ZohoUser::class, 'owner_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(ZohoUser::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(ZohoUser::class, 'updated_by');
    }

    public function notes()
    {
        return $this->hasMany(SqrNote::class)->orderBy('created_at', 'desc');
    }
}
