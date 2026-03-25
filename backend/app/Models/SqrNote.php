<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SqrNote extends Model
{
    protected $table = 'sqr_notes';

    protected $fillable = [
        'sqr_id',
        'user_id',
        'content',
    ];

    protected $casts = [
        'sqr_id' => 'integer',
        'user_id' => 'integer',
    ];

    public function sqr(): BelongsTo
    {
        return $this->belongsTo(Sqr::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(ZohoUser::class, 'user_id');
    }
}