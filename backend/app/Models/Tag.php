<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    protected $fillable = [
        'name',
        'entity_type',
        'color',
    ];

    public function contacts()
    {
        return $this->morphedByMany(Contact::class, 'taggable');
    }

    public function companies()
    {
        return $this->morphedByMany(Company::class, 'taggable');
    }

    public function deals()
    {
        return $this->morphedByMany(Deal::class, 'taggable');
    }
}
