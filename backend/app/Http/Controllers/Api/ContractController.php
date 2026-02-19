<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContractController extends Controller
{
    public function index(Request $request)
    {
        $query = Contract::query()->with(['customer', 'deal', 'signers']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $sortBy = $request->sort_by ?? 'created_at';
        $sortOrder = $request->sort_order ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->per_page ?? 15;
        $contracts = $query->paginate($perPage);

        return response()->json(['success' => true, 'data' => $contracts]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'type' => 'required|in:sales,service,nda,employment,partnership,other',
            'customer_id' => 'nullable|exists:contacts,id',
            'company_id' => 'nullable|exists:companies,id',
            'deal_id' => 'nullable|exists:deals,id',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'value' => 'nullable|numeric|min:0',
            'status' => 'in:draft,pending,active,expired,terminated,cancelled',
            'content' => 'nullable|string',
            'signers' => 'nullable|array',
            'signers.*.name' => 'required_with:signers|string|max:255',
            'signers.*.email' => 'required_with:signers|email',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $contract = Contract::create($request->all());

        if ($request->has('signers')) {
            foreach ($request->signers as $signer) {
                $contract->signers()->create($signer);
            }
        }

        $contract->load(['customer', 'company', 'deal', 'signers']);

        return response()->json(['success' => true, 'data' => $contract, 'message' => 'Contract created successfully'], 201);
    }

    public function show(Contract $contract)
    {
        $contract->load(['customer', 'company', 'deal', 'signers', 'signatures']);

        return response()->json(['success' => true, 'data' => $contract]);
    }

    public function update(Request $request, Contract $contract)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:sales,service,nda,employment,partnership,other',
            'start_date' => 'sometimes|date',
            'end_date' => 'nullable|date',
            'value' => 'nullable|numeric|min:0',
            'status' => 'sometimes|in:draft,pending,active,expired,terminated,cancelled',
            'content' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $contract->update($request->all());

        return response()->json(['success' => true, 'data' => $contract, 'message' => 'Contract updated successfully']);
    }

    public function destroy(Contract $contract)
    {
        $contract->signers()->delete();
        $contract->delete();

        return response()->json(['success' => true, 'message' => 'Contract deleted successfully']);
    }

    public function sendForSignature(Request $request, Contract $contract)
    {
        $validator = Validator::make($request->all(), [
            'subject' => 'required|string|max:255',
            'message' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Integration with e-signature service (DocuSign, HelloSign, etc.)
        // $this->sendForE signature($contract, $request->all());

        $contract->update(['status' => 'pending']);

        return response()->json(['success' => true, 'message' => 'Contract sent for signature']);
    }

    public function sign(Request $request, Contract $contract)
    {
        $validator = Validator::make($request->all(), [
            'signer_id' => 'required|exists:contract_signers,id',
            'signature' => 'required|string',
            'ip_address' => 'nullable|ip',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $signer = $contract->signers()->find($request->signer_id);
        $signer->update([
            'signed_at' => now(),
            'signature' => $request->signature,
            'ip_address' => $request->ip(),
        ]);

        // Check if all signers have signed
        $allSigned = $contract->signers()->whereNull('signed_at')->count() === 0;
        if ($allSigned) {
            $contract->update(['status' => 'active']);
        }

        return response()->json(['success' => true, 'message' => 'Contract signed successfully']);
    }

    public function download(Contract $contract)
    {
        // Generate PDF and return download
        // $pdf = PDF::loadView('contracts.pdf', compact('contract'));
        // return $pdf->download('contract-' . $contract->id . '.pdf');
        
        return response()->json(['success' => true, 'message' => 'Download functionality']);
    }
}
