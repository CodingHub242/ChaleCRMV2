<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ScopesByOrganization;
use App\Models\Sqr;
use App\Models\SqrNote;
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
            if ($status === 'Closed' || $status === 'Resolved') {
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
        
        // Log activity for updates
        $changes = [];
        if (isset($validated['title']) && $validated['title'] !== $sqr->title) {
            $changes[] = 'title';
        }
        if (isset($validated['priority']) && $validated['priority'] !== $sqr->priority) {
            $changes[] = 'priority';
        }
        if (isset($validated['status']) && $validated['status'] !== $sqr->status) {
            $changes[] = 'status';
        }
        if (isset($validated['assigned_to']) && $validated['assigned_to'] !== $sqr->assigned_to) {
            $changes[] = 'assignment';
        }
        if (isset($validated['resolution_notes']) && $validated['resolution_notes'] !== $sqr->resolution_notes) {
            $changes[] = 'resolution notes';
        }
        
        if (!empty($changes)) {
            $this->logActivity($sqr->id, 'updated', 'SQR updated: ' . implode(', ', $changes));
        }

        return response()->json([
            'success' => true,
            'data' => $sqr->load(['contact', 'company', 'assignee', 'owner', 'creator', 'updater']),
            'message' => 'SQR updated successfully'
        ]);
    }

    /**
     * Get all notes for a specific SQR
     */
    public function getNotes(int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $sqr = Sqr::query();
        if ($organizationId) {
            $sqr = $sqr->where('organization_id', $organizationId);
        }
        $sqr = $sqr->findOrFail($id);
        
        $notes = $sqr->notes()->with('user:id,name,avatar')->get();
        
        return response()->json([
            'success' => true,
            'data' => $notes
        ]);
    }

    /**
     * Add a new note to a specific SQR
     */
    public function addNote(Request $request, int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $sqr = Sqr::query();
        if ($organizationId) {
            $sqr = $sqr->where('organization_id', $organizationId);
        }
        $sqr = $sqr->findOrFail($id);
        
        $validated = $request->validate([
            'content' => 'required|string|max:5000',
        ]);
        
        $note = SqrNote::create([
            'sqr_id' => $sqr->id,
            'user_id' => auth()->id(),
            'content' => $validated['content'],
        ]);
        
        // Log activity
        $this->logActivity($sqr->id, 'note_added', 'added a note');
        
        return response()->json([
            'success' => true,
            'data' => $note->load('user:id,name,avatar'),
            'message' => 'Note added successfully'
        ], 201);
    }

    /**
     * Update a specific note
     */
    public function updateNote(Request $request, int $id, int $noteId)
    {
        $organizationId = $this->getOrganizationId();
        
        $sqr = Sqr::query();
        if ($organizationId) {
            $sqr = $sqr->where('organization_id', $organizationId);
        }
        $sqr = $sqr->findOrFail($id);
        
        $note = SqrNote::where('sqr_id', $sqr->id)->findOrFail($noteId);
        
        // Only allow the note creator to update their note
        if ($note->user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'You can only edit your own notes'
            ], 403);
        }
        
        $validated = $request->validate([
            'content' => 'required|string|max:5000',
        ]);
        
        $note->update($validated);
        
        // Log activity
        $this->logActivity($sqr->id, 'note_updated', 'updated a note');
        
        return response()->json([
            'success' => true,
            'data' => $note->load('user:id,name,avatar'),
            'message' => 'Note updated successfully'
        ]);
    }

    /**
     * Delete a specific note
     */
    public function deleteNote(int $id, int $noteId)
    {
        $organizationId = $this->getOrganizationId();
        
        $sqr = Sqr::query();
        if ($organizationId) {
            $sqr = $sqr->where('organization_id', $organizationId);
        }
        $sqr = $sqr->findOrFail($id);
        
        $note = SqrNote::where('sqr_id', $sqr->id)->findOrFail($noteId);
        
        // Only allow the note creator or admin to delete
        if ($note->user_id !== auth()->id() && !auth()->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'You can only delete your own notes'
            ], 403);
        }
        
        $note->delete();
        
        // Log activity
        $this->logActivity($sqr->id, 'note_deleted', 'deleted a note');
        
        return response()->json([
            'success' => true,
            'message' => 'Note deleted successfully'
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

        $oldStatus = $sqr->status;
        
        if (in_array($validated['status'], ['Resolved', 'Closed'])) {
            $validated['resolved_at'] = now();
        }

        // Set updated_by to current user
        $validated['updated_by'] = auth()->id();
        
        $sqr->update($validated);
        
        // Log activity for status change
        $activityDesc = 'Status changed from ' . $oldStatus . ' to ' . $validated['status'];
        if (!empty($validated['resolution_notes'])) {
            $activityDesc .= '. Resolution: ' . $validated['resolution_notes'];
        }
        $this->logActivity($sqr->id, 'status_changed', $activityDesc);

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

    /**
     * Bulk update status for multiple SQRs
     */
    public function bulkUpdateStatus(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:sqrs,id',
            'status' => 'required|string|in:Open,In Progress,Escalated,Resolved,Closed',
        ]);

        $organizationId = $this->getOrganizationId();
        
        $query = Sqr::whereIn('id', $validated['ids']);
        if ($organizationId) {
            $query->where('organization_id', $organizationId);
        }

        $updateData = [
            'status' => $validated['status'],
            'updated_by' => auth()->id(),
        ];

        // Auto-set resolved_at when status is Resolved or Closed
        if (in_array($validated['status'], ['Resolved', 'Closed'])) {
            $updateData['resolved_at'] = now();
        }

        $query->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'SQRs status updated successfully'
        ]);
    }

    /**
     * Bulk delete multiple SQRs
     */
    public function bulkDelete(Request $request)
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:sqrs,id',
        ]);

        $organizationId = $this->getOrganizationId();
        
        $query = Sqr::whereIn('id', $validated['ids']);
        if ($organizationId) {
            $query->where('organization_id', $organizationId);
        }

        $query->delete();

        return response()->json([
            'success' => true,
            'message' => 'SQRs deleted successfully'
        ]);
    }
    
    /**
     * Log activity for SQR changes
     */
    private function logActivity(int $sqrId, string $type, string $description): void
    {
        $userName = auth()->user()->name ?? 'Unknown User';
        $fullDescription = $userName . ' ' . $description;
        
        \App\Models\Activity::create([
            'organization_id' => $this->getOrganizationId(),
            'activity_type' => $type,
            'description' => $fullDescription,
            'subject_type' => 'sqr',
            'subject_id' => $sqrId,
            'user_id' => auth()->id(),
            'activity_date' => now(),
        ]);
    }
}
