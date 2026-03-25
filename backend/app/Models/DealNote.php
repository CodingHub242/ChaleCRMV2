<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DealNote extends Model
{
    protected $table = 'deal_notes';

    protected $fillable = [
        'deal_id',
        'user_id',
        'content',
    ];

    protected $casts = [
        'deal_id' => 'integer',
        'user_id' => 'integer',
    ];

    public function deal(): BelongsTo
    {
        return $this->belongsTo(Deal::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(ZohoUser::class, 'user_id');
    }
}