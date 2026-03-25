<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Deal extends Model
{
    protected $fillable = [
        'name',
        'amount',
        'currency',
        'stage',
        'probability',
        'expected_close_date',
        'contact_id',
        'company_id',
        'group_id',
        'description',
        'notes',
        'organization_id',
        'custom_fields',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'probability' => 'integer',
        'expected_close_date' => 'date',
        'contact_id' => 'integer',
        'company_id' => 'integer',
        'group_id' => 'integer',
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

    public function group(): BelongsTo
    {
        return $this->belongsTo(DealGroup::class, 'group_id');
    }

    public function notes()
    {
        return $this->hasMany(DealNote::class)->orderBy('created_at', 'desc');
    }
}
