<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ScopesByOrganization;
use App\Models\DealType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;

class DealTypeController extends Controller
{
    use ScopesByOrganization;
    
    public function index()
    {
        $organizationId = $this->getOrganizationId();
        
        $query = DealType::query();
        
        if ($organizationId && Schema::hasColumn('deal_types', 'organization_id')) {
            $query->where('organization_id', $organizationId);
        }
        
        $types = $query->orderBy('name')->get();
        
        return response()->json([
            'success' => true,
            'data' => $types
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:20',
        ]);

        $organizationId = $this->getOrganizationId();
        if ($organizationId && Schema::hasColumn('deal_types', 'organization_id')) {
            $validated['organization_id'] = $organizationId;
        }
        
        $type = DealType::create($validated);

        return response()->json([
            'success' => true,
            'data' => $type,
            'message' => 'Deal type created successfully'
        ], 201);
    }

    public function show(int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $query = DealType::withCount(['deals']);
        if ($organizationId && Schema::hasColumn('deal_types', 'organization_id')) {
            $query->where('organization_id', $organizationId);
        }
        $type = $query->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $type
        ]);
    }

    public function update(Request $request, int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $query = DealType::query();
        if ($organizationId && Schema::hasColumn('deal_types', 'organization_id')) {
            $query->where('organization_id', $organizationId);
        }
        $type = $query->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:20',
        ]);

        $type->update($validated);

        return response()->json([
            'success' => true,
            'data' => $type,
            'message' => 'Deal type updated successfully'
        ]);
    }

    public function destroy(int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $query = DealType::query();
        if ($organizationId && Schema::hasColumn('deal_types', 'organization_id')) {
            $query->where('organization_id', $organizationId);
        }
        $type = $query->findOrFail($id);
        
        $type->delete();

        return response()->json([
            'success' => true,
            'message' => 'Deal type deleted successfully'
        ]);
    }
}
