<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\Request;

class CompanyController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $companies = Company::paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $companies->items(),
            'meta' => [
                'current_page' => $companies->currentPage(),
                'last_page' => $companies->lastPage(),
                'per_page' => $companies->perPage(),
                'total' => $companies->total()
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'mobile' => 'nullable|string|max:50',
            'website' => 'nullable|url|max:255',
            'industry' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'logo' => 'nullable|string',
        ]);

        $company = Company::create($validated);

        return response()->json([
            'success' => true,
            'data' => $company,
            'message' => 'Company created successfully'
        ], 201);
    }

    public function show(int $id)
    {
        $company = Company::findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $company
        ]);
    }

    public function update(Request $request, int $id)
    {
        $company = Company::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'mobile' => 'nullable|string|max:50',
            'website' => 'nullable|url|max:255',
            'industry' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'logo' => 'nullable|string',
        ]);

        $company->update($validated);

        return response()->json([
            'success' => true,
            'data' => $company,
            'message' => 'Company updated successfully'
        ]);
    }

    public function destroy(int $id)
    {
        $company = Company::findOrFail($id);
        $company->delete();

        return response()->json([
            'success' => true,
            'message' => 'Company deleted successfully'
        ]);
    }
}
