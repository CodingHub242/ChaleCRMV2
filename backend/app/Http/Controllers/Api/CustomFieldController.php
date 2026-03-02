<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Traits\ScopesByOrganization;
use App\Models\CustomField;
use Illuminate\Http\Request;

class CustomFieldController extends Controller
{
    use ScopesByOrganization;
    
    public function index(Request $request)
    {
        $module = $request->input('module', '');
        $organizationId = $this->getOrganizationId();
        
        $query = CustomField::query();
        
        if ($organizationId) {
            $query->where('organization_id', $organizationId);
        }
        
        if ($module) {
            $query->where('module', $module);
        }
        
        $fields = $query->orderBy('display_order', 'asc')->get();
        
        return response()->json([
            'success' => true,
            'data' => $fields
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'label' => 'required|string|max:255',
            'type' => 'required|string|in:text,textarea,number,date,select,multiselect,checkbox,radio',
            'required' => 'boolean',
            'options' => 'nullable|array',
            'module' => 'required|string',
            'display_order' => 'integer',
        ]);

        $validated['organization_id'] = $this->getOrganizationId();
        $field = CustomField::create($validated);

        return response()->json([
            'success' => true,
            'data' => $field,
            'message' => 'Custom field created successfully'
        ], 201);
    }

    public function show(int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $field = CustomField::query();
        if ($organizationId) {
            $field = $field->where('organization_id', $organizationId);
        }
        $field = $field->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $field
        ]);
    }

    public function update(Request $request, int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $field = CustomField::query();
        if ($organizationId) {
            $field = $field->where('organization_id', $organizationId);
        }
        $field = $field->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'label' => 'sometimes|string|max:255',
            'type' => 'sometimes|string|in:text,textarea,number,date,select,multiselect,checkbox,radio',
            'required' => 'boolean',
            'options' => 'nullable|array',
            'module' => 'sometimes|string',
            'display_order' => 'integer',
        ]);

        $field->update($validated);

        return response()->json([
            'success' => true,
            'data' => $field,
            'message' => 'Custom field updated successfully'
        ]);
    }

    public function destroy(int $id)
    {
        $organizationId = $this->getOrganizationId();
        
        $field = CustomField::query();
        if ($organizationId) {
            $field = $field->where('organization_id', $organizationId);
        }
        $field = $field->findOrFail($id);
        $field->delete();

        return response()->json([
            'success' => true,
            'message' => 'Custom field deleted successfully'
        ]);
    }
}
