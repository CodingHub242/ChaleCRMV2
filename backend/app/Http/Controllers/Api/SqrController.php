<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ScopesByOrganization;
use App\Models\Sqr;
use Illuminate\Http\Request;

class SqrController extends Controller
{
    use ScopesByOrganization;
    
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $search = $request->input('search', '');
        $status = $request->input('status', '');
        $organizationId = $this->getOrganizationId();
        
        $query = Sqr::with(['contact', 'company', 'assignee', 'owner', 'creator']);
        
        if ($organizationId) {
            $query->where('organization_id', $organizationId);
        }
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('type', 'like', "%{$search}%")
                  ->orWhere('ticket_number', 'like', "%{$search}%");
            });
        }
        
        if ($status) {
            if ($status === 'Closed') {
                // For 'Closed' tab, show both Resolved and Closed
                $query->whereIn('status', ['Resolved', 'Closed']);
            } else {
                $query->where('status', $status);
            }
        }
        
        $sqrs = $query->orderBy('created_at', 'desc')->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $sqrs->items(),
            'meta' => [
                'current_page' => $sqrs->currentPage(),
                'last_page' => $sqrs->lastPage(),
                'per_page' => $sqrs->perPage(),
                'total' => $sqrs->total()
            ]
        ]);
    }

    public function counts()
    {
        $organizationId = $this->getOrganizationId();
        
        $query = Sqr::query();
        if ($organizationId) {
            $query->where('organization_id', $organizationId);
        }
        
        $counts = [
            'new' => (clone $query)->where('status', 'Open')->count(),
            'in_progress' => (clone $query)->where('status', 'In Progress')->count(),
            'escalated' => (clone $query)->where('status', 'Escalated')->count(),
            'closed' => (clone $query)->whereIn('status', ['Resolved', 'Closed'])->count(),
            'total' => $query->count()
        ];
        
        return response()->json([
            'success' => true,
            'data' => $counts
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'ticket_number' => 'nullable|string|max:50|unique:sqrs,ticket_number',
            'type' => 'required|string|in:Complaint,Feedback,Suggestion,Inquiry',
            'priority' => 'required|string|in:Low,Medium,High,Critical',
            'status' => 'nullable|string|in:Open,In Progress,Escalated,Resolved,Closed',
            'description' => 'nullable|string',
            'contact_id' => 'nullable|integer|exists:contacts,id',
            'company_id' => 'nullable|integer|exists:companies,id',
            'assigned_to' => 'nullable|integer',
            'resolution_notes' => 'nullable|string',
            'custom_fields' => 'nullable|array',
        ]);

        $validated['organization_id'] = $this->getOrganizationId();
        
        // Generate unique ticket number only if not provided
        if (empty($validated['ticket_number'])) {
            $validated['ticket_number'] = $this->generateTicketNumber($validated['organization_id']);
        }
        
        // Set created_by to current user
        $validated['created_by'] = auth()->id();
        
        // If assigned_to is provided, also set owner_id
        if (!empty($validated['assigned_to'])) {
            $validated['owner_id'] = $validated['assigned_to'];
        }
        
        $sqr = Sqr::create($validated);

        return response()->json([
            'success' => true,
            'data' => $sqr->load(['contact', 'company', 'assignee', 'owner', 'creator']),
            'message' => 'SQR created successfully'
        ], 201);
    }

    public function show(int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $sqr = Sqr::with(['contact', 'company', 'assignee', 'owner', 'creator', 'updater']);
        if ($organizationId) {
            $sqr = $sqr->where('organization_id', $organizationId);
        }
        $sqr = $sqr->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $sqr
        ]);
    }

    public function update(Request $request, int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $sqr = Sqr::query();
        if ($organizationId) {
            $sqr = $sqr->where('organization_id', $organizationId);
        }
        $sqr = $sqr->findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'type' => 'sometimes|required|string|in:Complaint,Feedback,Suggestion,Inquiry',
            'priority' => 'sometimes|required|string|in:Low,Medium,High,Critical',
            'status' => 'nullable|string|in:Open,In Progress,Escalated,Resolved,Closed',
            'description' => 'nullable|string',
            'contact_id' => 'nullable|integer|exists:contacts,id',
            'company_id' => 'nullable|integer|exists:companies,id',
            'assigned_to' => 'nullable|integer',
            'resolved_at' => 'nullable|date',
            'resolution_notes' => 'nullable|string',
            'custom_fields' => 'nullable|array',
        ]);

        // Auto-set resolved_at when status is changed to Resolved or Closed
        if (in_array($validated['status'] ?? '', ['Resolved', 'Closed']) && !$sqr->resolved_at) {
            $validated['resolved_at'] = now();
        }

        // Set updated_by to current user
        $validated['updated_by'] = auth()->id();
        
        // If assigned_to is being set for the first time (was null), also set owner_id
        if (!empty($validated['assigned_to']) && empty($sqr->assigned_to)) {
            $validated['owner_id'] = $validated['assigned_to'];
        }

        $sqr->update($validated);

        return response()->json([
            'success' => true,
            'data' => $sqr->load(['contact', 'company', 'assignee', 'owner', 'creator', 'updater']),
            'message' => 'SQR updated successfully'
        ]);
    }

    public function destroy(int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $sqr = Sqr::query();
        if ($organizationId) {
            $sqr = $sqr->where('organization_id', $organizationId);
        }
        $sqr = $sqr->findOrFail($id);
        $sqr->delete();

        return response()->json([
            'success' => true,
            'message' => 'SQR deleted successfully'
        ]);
    }

    public function updateStatus(Request $request, int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $sqr = Sqr::query();
        if ($organizationId) {
            $sqr = $sqr->where('organization_id', $organizationId);
        }
        $sqr = $sqr->findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:Open,In Progress,Escalated,Resolved,Closed',
            'resolution_notes' => 'nullable|string',
        ]);

        if (in_array($validated['status'], ['Resolved', 'Closed'])) {
            $validated['resolved_at'] = now();
        }

        // Set updated_by to current user
        $validated['updated_by'] = auth()->id();
        
        $sqr->update($validated);

        return response()->json([
            'success' => true,
            'data' => $sqr->load(['contact', 'company', 'assignee', 'owner', 'creator', 'updater']),
            'message' => 'SQR status updated successfully'
        ]);
    }

    /**
     * Generate a unique ticket number for SQR
     * Format: SQR-YYYYMMDD-XXXX
     */
    private function generateTicketNumber(?int $organizationId): string
    {
        $date = now()->format('Ymd');
        $prefix = 'SQR-' . $date;
        
        // Get the latest ticket number for today
        $query = Sqr::where('ticket_number', 'like', $prefix . '-%');
        
        if ($organizationId) {
            $query->where('organization_id', $organizationId);
        }
        
        $lastTicket = $query->orderBy('ticket_number', 'desc')->first();
        
        if ($lastTicket) {
            // Extract the last sequence number
            $lastNumber = (int) substr($lastTicket->ticket_number, -4);
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }
        
        return $prefix . '-' . $newNumber;
    }
}
