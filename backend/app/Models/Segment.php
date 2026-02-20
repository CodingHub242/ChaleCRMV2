<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Segment extends Model
{
    protected $fillable = [
        'name',
        'type',
        'description',
        'conditions',
        'logic',
    ];

    protected $casts = [
        'conditions' => 'array',
    ];
}
