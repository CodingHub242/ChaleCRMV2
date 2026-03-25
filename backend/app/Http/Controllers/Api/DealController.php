<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ScopesByOrganization;
use App\Models\Deal;
use App\Models\Activity;
use Illuminate\Http\Request;

class DealController extends Controller
{
    use ScopesByOrganization;
    
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $search = $request->input('search', '');
        $stage = $request->input('stage', '');
        $groupId = $request->input('group_id', '');
        $organizationId = $this->getOrganizationId();
        
        $query = Deal::with(['contact', 'company', 'group']);
        
        if ($organizationId) {
            $query->where('organization_id', $organizationId);
        }
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        if ($stage) {
            $query->where('stage', $stage);
        }
        
        if ($groupId) {
            $query->where('group_id', $groupId);
        }
        
        $deals = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $deals->items(),
            'meta' => [
                'current_page' => $deals->currentPage(),
                'last_page' => $deals->lastPage(),
                'per_page' => $deals->perPage(),
                'total' => $deals->total()
            ]
        ]);
    }

    // Get overall deal counts by stage
    public function counts()
    {
        $organizationId = $this->getOrganizationId();
        
        $query = Deal::query();
        if ($organizationId) {
            $query->where('organization_id', $organizationId);
        }
        
        $stages = ['Prospect', 'Client', 'Demo Requested', 'Demo Completed', 'Contract In-Review', 'Closed Won', 'Closed Lost'];
        
        $counts = [];
        foreach ($stages as $stage) {
            $counts[strtolower(str_replace(' ', '_', $stage))] = (clone $query)->where('stage', $stage)->count();
        }
        
        $counts['total'] = $query->count();
        
        return response()->json([
            'success' => true,
            'data' => $counts
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'amount' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:3',
            'stage' => 'nullable|string|max:100',
            'probability' => 'nullable|integer|min:0|max:100',
            'expected_close_date' => 'nullable|date',
            'contact_id' => 'nullable|integer|exists:contacts,id',
            'company_id' => 'nullable|integer',
            'group_id' => 'nullable|integer|exists:deal_groups,id',
            'description' => 'nullable|string',
        ]);

        $validated['organization_id'] = $this->getOrganizationId();
        $deal = Deal::create($validated);

        // Log activity
        $this->logActivity($deal->id, 'created', 'Deal created: ' . $deal->name);

        return response()->json([
            'success' => true,
            'data' => $deal->load(['contact', 'company', 'group']),
            'message' => 'Deal created successfully'
        ], 201);
    }

    public function show(int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $deal = Deal::with(['contact', 'company', 'group']);
        if ($organizationId) {
            $deal = $deal->where('organization_id', $organizationId);
        }
        $deal = $deal->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $deal
        ]);
    }

    public function update(Request $request, int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $deal = Deal::query();
        if ($organizationId) {
            $deal = $deal->where('organization_id', $organizationId);
        }
        $deal = $deal->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'amount' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:3',
            'stage' => 'nullable|string|max:100',
            'probability' => 'nullable|integer|min:0|max:100',
            'expected_close_date' => 'nullable|date',
            'contact_id' => 'nullable|integer|exists:contacts,id',
            'company_id' => 'nullable|integer',
            'group_id' => 'nullable|integer|exists:deal_groups,id',
            'description' => 'nullable|string',
        ]);

        // Track changes for activity logging
        $changes = [];
        if (isset($validated['name']) && $validated['name'] !== $deal->name) {
            $changes[] = 'name';
        }
        if (isset($validated['amount']) && $validated['amount'] != $deal->amount) {
            $changes[] = 'amount';
        }
        if (isset($validated['stage']) && $validated['stage'] !== $deal->stage) {
            $changes[] = 'stage';
        }
        if (isset($validated['probability']) && $validated['probability'] != $deal->probability) {
            $changes[] = 'probability';
        }
        if (isset($validated['expected_close_date']) && $validated['expected_close_date'] !== $deal->expected_close_date) {
            $changes[] = 'expected close date';
        }
        if (isset($validated['contact_id']) && $validated['contact_id'] != $deal->contact_id) {
            $changes[] = 'contact';
        }
        if (isset($validated['company_id']) && $validated['company_id'] != $deal->company_id) {
            $changes[] = 'company';
        }
        if (isset($validated['group_id']) && $validated['group_id'] != $deal->group_id) {
            $changes[] = 'group';
        }

        $deal->update($validated);

        // Log activity for updates
        if (!empty($changes)) {
            $this->logActivity($deal->id, 'updated', 'Deal updated: ' . implode(', ', $changes));
        }

        return response()->json([
            'success' => true,
            'data' => $deal->load(['contact', 'company', 'group']),
            'message' => 'Deal updated successfully'
        ]);
    }

    public function destroy(int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $deal = Deal::query();
        if ($organizationId) {
            $deal = $deal->where('organization_id', $organizationId);
        }
        $deal = $deal->findOrFail($id);
        
        // Log activity before deletion
        $this->logActivity($deal->id, 'deleted', 'Deal deleted: ' . $deal->name);
        
        $deal->delete();

        return response()->json([
            'success' => true,
            'message' => 'Deal deleted successfully'
        ]);
    }

    public function updateStage(Request $request, int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $deal = Deal::query();
        if ($organizationId) {
            $deal = $deal->where('organization_id', $organizationId);
        }
        $deal = $deal->findOrFail($id);

        $validated = $request->validate([
            'stage' => 'required|string|max:100',
        ]);

        $oldStage = $deal->stage;
        $deal->update($validated);

        // Log activity for stage change
        $activityDesc = 'Stage changed from ' . ($oldStage ?: 'None') . ' to ' . $validated['stage'];
        $this->logActivity($deal->id, 'stage_changed', $activityDesc);

        return response()->json([
            'success' => true,
            'data' => $deal->load(['contact', 'company']),
            'message' => 'Deal stage updated successfully'
        ]);
    }

    /**
     * Bulk update stage for multiple deals
     */
    public function bulkUpdateStage(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:deals,id',
            'stage' => 'required|string|max:100',
        ]);

        $organizationId = $this->getOrganizationId();
        
        // Get deals before update to log activity
        $deals = Deal::whereIn('id', $validated['ids']);
        if ($organizationId) {
            $deals = $deals->where('organization_id', $organizationId);
        }
        $deals = $deals->get();
        
        $query = Deal::whereIn('id', $validated['ids']);
        if ($organizationId) {
            $query->where('organization_id', $organizationId);
        }

        $query->update(['stage' => $validated['stage']]);

        // Log activity for bulk update
        foreach ($deals as $deal) {
            $this->logActivity($deal->id, 'stage_changed', 'Stage changed to ' . $validated['stage'] . ' (bulk update)');
        }

        return response()->json([
            'success' => true,
            'message' => 'Deals stage updated successfully'
        ]);
    }

    /**
     * Bulk delete multiple deals
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:deals,id',
        ]);

        $organizationId = $this->getOrganizationId();
        
        // Get deals before deletion to log activity
        $deals = Deal::whereIn('id', $validated['ids']);
        if ($organizationId) {
            $deals = $deals->where('organization_id', $organizationId);
        }
        $deals = $deals->get();
        
        // Log activity before deletion
        $dealNames = $deals->pluck('name')->toArray();
        $this->logActivity(0, 'bulk_deleted', 'Bulk deleted deals: ' . implode(', ', $dealNames));

        $query = Deal::whereIn('id', $validated['ids']);
        if ($organizationId) {
            $query->where('organization_id', $organizationId);
        }

        $query->delete();

        return response()->json([
            'success' => true,
            'message' => 'Deals deleted successfully'
        ]);
    }
    
    /**
     * Log activity for deal changes
     */
    private function logActivity(int $dealId, string $type, string $description): void
    {
        $userName = auth()->user()->name ?? 'Unknown User';
        $fullDescription = $userName . ' ' . $description;
        
        Activity::create([
            'organization_id' => $this->getOrganizationId(),
            'activity_type' => $type,
            'description' => $fullDescription,
            'subject_type' => 'deal',
            'subject_id' => $dealId,
            'user_id' => auth()->id(),
            'activity_date' => now(),
        ]);
    }
}
