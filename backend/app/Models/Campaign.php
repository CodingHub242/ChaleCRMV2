<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'type',
        'status',
        'budget',
        'start_date',
        'end_date',
        'target_audience',
        'description',
        'goals',
        'emails_sent',
        'emails_opened',
        'emails_clicked',
    ];

    protected $casts = [
        'budget' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'target_audience' => 'array',
        'emails_sent' => 'integer',
        'emails_opened' => 'integer',
        'emails_clicked' => 'integer',
    ];

    // Campaign types
    const TYPE_EMAIL = 'email';
    const TYPE_SOCIAL = 'social';
    const TYPE_EVENT = 'event';
    const TYPE_ADVERTISING = 'advertising';
    const TYPE_OTHER = 'other';

    // Campaign statuses
    const STATUS_DRAFT = 'draft';
    const STATUS_ACTIVE = 'active';
    const STATUS_PAUSED = 'paused';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    /**
     * Get the leads associated with this campaign
     */
    public function leads()
    {
        return $this->belongsToMany(Lead::class, 'campaign_leads');
    }

    /**
     * Get the contacts associated with this campaign
     */
    public function contacts()
    {
        return $this->belongsToMany(Contact::class, 'campaign_contacts');
    }

    /**
     * Get the activities associated with this campaign
     */
    public function activities()
    {
        return $this->morphMany(Activity::class, 'parent');
    }

    /**
     * Get open rate percentage
     */
    public function getOpenRateAttribute()
    {
        if ($this->emails_sent > 0) {
            return ($this->emails_opened / $this->emails_sent) * 100;
        }
        return 0;
    }

    /**
     * Get click rate percentage
     */
    public function getClickRateAttribute()
    {
        if ($this->emails_sent > 0) {
            return ($this->emails_clicked / $this->emails_sent) * 100;
        }
        return 0;
    }

    /**
     * Scope for active campaigns
     */
    public function scopeActive($query)
    {
        return $query->where('status', self::STATUS_ACTIVE);
    }

    /**
     * Scope for campaigns by type
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }
}
