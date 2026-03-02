<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sqr;
use Illuminate\Http\Request;

class SqrController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $search = $request->input('search', '');
        
        $query = Sqr::with(['contact', 'company', 'assignee']);
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('type', 'like', "%{$search}%");
            });
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
        $counts = [
            'new' => Sqr::where('status', 'Open')->count(),
            'in_progress' => Sqr::where('status', 'In Progress')->count(),
            'escalated' => Sqr::where('status', 'Escalated')->count(),
            'closed' => Sqr::whereIn('status', ['Resolved', 'Closed'])->count(),
            'total' => Sqr::count()
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
            'type' => 'required|string|in:Complaint,Feedback,Suggestion,Inquiry',
            'priority' => 'required|string|in:Low,Medium,High,Critical',
            'status' => 'nullable|string|in:Open,In Progress,Escalated,Resolved,Closed',
            'description' => 'nullable|string',
            'contact_id' => 'nullable|integer|exists:contacts,id',
            'company_id' => 'nullable|integer|exists:companies,id',
            'assigned_to' => 'nullable|integer',
            'resolution_notes' => 'nullable|string',
        ]);

        $sqr = Sqr::create($validated);

        return response()->json([
            'success' => true,
            'data' => $sqr->load(['contact', 'company', 'assignee']),
            'message' => 'SQR created successfully'
        ], 201);
    }

    public function show(int $id)
    {
        $sqr = Sqr::with(['contact', 'company', 'assignee'])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $sqr
        ]);
    }

    public function update(Request $request, int $id)
    {
        $sqr = Sqr::findOrFail($id);

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
        ]);

        // Auto-set resolved_at when status is changed to Resolved or Closed
        if (in_array($validated['status'] ?? '', ['Resolved', 'Closed']) && !$sqr->resolved_at) {
            $validated['resolved_at'] = now();
        }

        $sqr->update($validated);

        return response()->json([
            'success' => true,
            'data' => $sqr->load(['contact', 'company', 'assignee']),
            'message' => 'SQR updated successfully'
        ]);
    }

    public function destroy(int $id)
    {
        $sqr = Sqr::findOrFail($id);
        $sqr->delete();

        return response()->json([
            'success' => true,
            'message' => 'SQR deleted successfully'
        ]);
    }

    public function updateStatus(Request $request, int $id)
    {
        $sqr = Sqr::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|string|in:Open,In Progress,Escalated,Resolved,Closed',
            'resolution_notes' => 'nullable|string',
        ]);

        if (in_array($validated['status'], ['Resolved', 'Closed'])) {
            $validated['resolved_at'] = now();
        }

        $sqr->update($validated);

        return response()->json([
            'success' => true,
            'data' => $sqr->load(['contact', 'company', 'assignee']),
            'message' => 'SQR status updated successfully'
        ]);
    }
}
