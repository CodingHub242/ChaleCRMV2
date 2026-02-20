<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    public function index()
    {
        $contracts = Contract::with(['contact', 'company', 'deal'])->latest()->get();
        return response()->json($contracts);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'contact_id' => 'nullable|exists:contacts,id',
            'company_id' => 'nullable|exists:companies,id',
            'deal_id' => 'nullable|exists:deals,id',
            'value' => 'nullable|numeric',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'nullable|string',
            'description' => 'nullable|string',
            'terms' => 'nullable|string',
        ]);

        $contract = Contract::create($validated);
        return response()->json($contract->load(['contact', 'company', 'deal']), 201);
    }

    public function show(Contract $contract)
    {
        return response()->json($contract->load(['contact', 'company', 'deal']));
    }

    public function update(Request $request, Contract $contract)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'contact_id' => 'nullable|exists:contacts,id',
            'company_id' => 'nullable|exists:companies,id',
            'deal_id' => 'nullable|exists:deals,id',
            'value' => 'nullable|numeric',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date',
            'status' => 'nullable|string',
            'description' => 'nullable|string',
            'terms' => 'nullable|string',
        ]);

        $contract->update($validated);
        return response()->json($contract->load(['contact', 'company', 'deal']));
    }

    public function destroy(Contract $contract)
    {
        $contract->delete();
        return response()->json(['message' => 'Contract deleted']);
    }
}
