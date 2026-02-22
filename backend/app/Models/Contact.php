<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contact extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'mobile',
        'company_id',
        'lead_status',
        'source',
        'avatar',
        'address',
        'city',
        'state',
        'country',
        'zip_code',
    ];

    protected $casts = [
        'company_id' => 'integer',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }
}
