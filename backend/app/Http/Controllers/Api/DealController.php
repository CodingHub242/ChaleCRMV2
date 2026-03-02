<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Deal;
use Illuminate\Http\Request;

class DealController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $search = $request->input('search', '');
        $stage = $request->input('stage', '');
        
        $query = Deal::with(['contact', 'company']);
        
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        if ($stage) {
            $query->where('stage', $stage);
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
            'company_id' => 'nullable|integer', // No foreign key check - allows import without company
            'description' => 'nullable|string',
        ]);

        $deal = Deal::create($validated);

        return response()->json([
            'success' => true,
            'data' => $deal->load(['contact', 'company']),
            'message' => 'Deal created successfully'
        ], 201);
    }

    public function show(int $id)
    {
        $deal = Deal::with(['contact', 'company'])->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $deal
        ]);
    }

    public function update(Request $request, int $id)
    {
        $deal = Deal::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'amount' => 'nullable|numeric|min:0',
            'currency' => 'nullable|string|max:3',
            'stage' => 'nullable|string|max:100',
            'probability' => 'nullable|integer|min:0|max:100',
            'expected_close_date' => 'nullable|date',
            'contact_id' => 'nullable|integer|exists:contacts,id',
            'company_id' => 'nullable|integer', // No foreign key check - allows import without company
            'description' => 'nullable|string',
        ]);

        $deal->update($validated);

        return response()->json([
            'success' => true,
            'data' => $deal->load(['contact', 'company']),
            'message' => 'Deal updated successfully'
        ]);
    }

    public function destroy(int $id)
    {
        $deal = Deal::findOrFail($id);
        $deal->delete();

        return response()->json([
            'success' => true,
            'message' => 'Deal deleted successfully'
        ]);
    }

    public function updateStage(Request $request, int $id)
    {
        $deal = Deal::findOrFail($id);

        $validated = $request->validate([
            'stage' => 'required|string|max:100',
        ]);

        $deal->update($validated);

        return response()->json([
            'success' => true,
            'data' => $deal->load(['contact', 'company']),
            'message' => 'Deal stage updated successfully'
        ]);
    }
}
