<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'organization_id',
        'activity_type',
        'description',
        'subject_type',
        'subject_id',
        'activity_date',
        'metadata',
    ];

    protected $casts = [
        'activity_date' => 'datetime',
        'metadata' => 'array',
    ];

    /**
     * Get the user that performed the activity.
     */
    public function user()
    {
        return $this->belongsTo(ZohoUser::class, 'user_id');
    }

    /**
     * Get the subject of the activity ( polymorphic relationship).
     */
    public function subject()
    {
        return $this->morphTo();
    }

    /**
     * Scope to filter by activity type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('activity_type', $type);
    }

    /**
     * Scope to filter by subject type.
     */
    public function scopeForSubject($query, $subjectType, $subjectId)
    {
        return $query->where('subject_type', $subjectType)
                    ->where('subject_id', $subjectId);
    }

    /**
     * Common activity types
     */
    const TYPE_CREATED = 'created';
    const TYPE_UPDATED = 'updated';
    const TYPE_DELETED = 'deleted';
    const TYPE_VIEWED = 'viewed';
    const TYPE_CALLED = 'called';
    const TYPE_EMAIL_SENT = 'email_sent';
    const TYPE_MEETING = 'meeting';
    const TYPE_NOTE_ADDED = 'note_added';
    const TYPE_STATUS_CHANGED = 'status_changed';
    const TYPE_TASK_COMPLETED = 'task_completed';
    const TYPE_DEAL_WON = 'deal_won';
    const TYPE_DEAL_LOST = 'deal_lost';
}
