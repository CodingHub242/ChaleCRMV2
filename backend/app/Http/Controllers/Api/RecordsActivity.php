<?php

namespace App\Http\Controllers\Api;

use App\Models\Activity;
use Illuminate\Support\Facades\Auth;

trait RecordsActivity
{
    /**
     * Record an activity for the current action.
     *
     * @param string $type Activity type (use Activity::TYPE_* constants)
     * @param string $description Description of the activity
     * @param mixed $subject The subject model (Contact, Deal, Company, etc.)
     * @param array $metadata Additional metadata to store
     * @return Activity
     */
    protected function logActivity(string $type, string $description, $subject = null, array $metadata = []): Activity
    {
        $activityData = [
            'user_id' => Auth::id(),
            'organization_id' => $this->getOrganizationId(),
            'activity_type' => $type,
            'description' => $description,
            'activity_date' => now(),
            'metadata' => $metadata,
        ];

        if ($subject) {
            $activityData['subject_type'] = get_class($subject);
            $activityData['subject_id'] = $subject->id;
        }

        return Activity::create($activityData);
    }

    /**
     * Record a "created" activity.
     */
    protected function logCreated($subject, string $customDescription = null): Activity
    {
        $description = $customDescription ?? $this->getDefaultDescription('created', $subject);
        return $this->logActivity(Activity::TYPE_CREATED, $description, $subject);
    }

    /**
     * Record an "updated" activity.
     */
    protected function logUpdated($subject, array $changes = [], string $customDescription = null): Activity
    {
        $description = $customDescription ?? $this->getDefaultDescription('updated', $subject);
        return $this->logActivity(Activity::TYPE_UPDATED, $description, $subject, ['changes' => $changes]);
    }

    /**
     * Record a "deleted" activity.
     */
    protected function logDeleted($subject, string $customDescription = null): Activity
    {
        $description = $customDescription ?? $this->getDefaultDescription('deleted', $subject);
        return $this->logActivity(Activity::TYPE_DELETED, $description, $subject);
    }

    /**
     * Record a "called" activity.
     */
    protected function logCall($subject, array $callDetails = []): Activity
    {
        $description = "Call {$callDetails['direction']} - {$callDetails['status']}";
        return $this->logActivity(Activity::TYPE_CALLED, $description, $subject, $callDetails);
    }

    /**
     * Record an "email sent" activity.
     */
    protected function logEmailSent($subject, array $emailDetails = []): Activity
    {
        $description = $emailDetails['subject'] ?? 'Email sent';
        return $this->logActivity(Activity::TYPE_EMAIL_SENT, $description, $subject, $emailDetails);
    }

    /**
     * Record a "status changed" activity.
     */
    protected function logStatusChanged($subject, string $oldStatus, string $newStatus): Activity
    {
        $description = "Status changed from {$oldStatus} to {$newStatus}";
        return $this->logActivity(
            Activity::TYPE_STATUS_CHANGED,
            $description,
            $subject,
            ['old_status' => $oldStatus, 'new_status' => $newStatus]
        );
    }

    /**
     * Generate a default description based on subject type.
     */
    private function getDefaultDescription(string $action, $subject): string
    {
        $subjectClass = class_basename($subject);
        return "{$subjectClass} {$action}";
    }
}
