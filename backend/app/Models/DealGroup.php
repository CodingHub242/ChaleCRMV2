<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DealGroup extends Model
{
    protected $fillable = [
        'name',
        'description',
        'color',
        'is_default',
        'organization_id',
    ];

    protected $casts = [
        'is_default' => 'boolean',
        'organization_id' => 'integer',
    ];

    public function deals(): HasMany
    {
        return $this->hasMany(Deal::class, 'group_id');
    }
}
