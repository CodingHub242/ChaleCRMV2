<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CustomField extends Model
{
    protected $fillable = [
        'name',
        'label',
        'type',
        'required',
        'options',
        'default_value',
        'module',
        'display_order',
        'organization_id',
    ];

    protected $casts = [
        'required' => 'boolean',
        'options' => 'array',
        'display_order' => 'integer',
        'organization_id' => 'integer',
    ];
}
