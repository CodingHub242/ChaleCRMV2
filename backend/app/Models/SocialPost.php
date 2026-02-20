<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SocialPost extends Model
{
    protected $fillable = [
        'user_id',
        'platform',
        'content',
        'media_urls',
        'status',
        'scheduled_at',
        'published_at',
        'likes_count',
        'comments_count',
        'shares_count',
        'impressions',
        'post_url',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'published_at' => 'datetime',
        'media_urls' => 'array',
        'likes_count' => 'integer',
        'comments_count' => 'integer',
        'shares_count' => 'integer',
        'impressions' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
