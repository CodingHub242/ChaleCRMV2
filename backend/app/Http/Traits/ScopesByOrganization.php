<?php

namespace App\Http\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

trait ScopesByOrganization
{
    /**
     * Scope a query to only include records for the current user's organization.
     */
    protected function scopeByOrganization(Builder $query, ?int $organizationId = null): Builder
    {
        if ($organizationId === null) {
            $organizationId = $this->getOrganizationId();
        }

        return $query->where('organization_id', $organizationId);
    }

    /**
     * Get the organization ID from the current request or authenticated user.
     */
    protected function getOrganizationId(): ?int
    {
        $user = auth()->user();
        
        if (!$user) {
            return null;
        }

        // First check if organization_id was explicitly set in the request
        $request = request();
        if ($request->has('organization_id')) {
            return $request->get('organization_id');
        }

        // Fall back to user's organization
        return $user->organization_id;
    }

    /**
     * Apply organization scope to the model in the controller.
     */
    protected function applyOrganizationScope($model): mixed
    {
        $organizationId = $this->getOrganizationId();
        
        if ($organizationId) {
            return $model->where('organization_id', $organizationId);
        }

        return $model;
    }

    /**
     * Ensure user can only access their organization's data.
     */
    protected function authorizeOrganization(?int $organizationId = null): bool
    {
        $user = auth()->user();
        
        if (!$user || !$user->organization_id) {
            return false;
        }

        $targetOrgId = $organizationId ?? $this->getOrganizationId();
        
        return $user->organization_id === $targetOrgId;
    }
}
