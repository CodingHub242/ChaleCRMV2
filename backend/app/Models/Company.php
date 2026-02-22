<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends Model
{
    protected $fillable = [
        'name',
        'email',
        'phone',
        'mobile',
        'website',
        'industry',
        'address',
        'city',
        'state',
        'country',
        'zip_code',
        'logo',
    ];

    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class);
    }
}
