<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    use RecordsActivity;
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 15);
        $contacts = Contact::with('company')->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $contacts->items(),
            'meta' => [
                'current_page' => $contacts->currentPage(),
                'last_page' => $contacts->lastPage(),
                'per_page' => $contacts->perPage(),
                'total' => $contacts->total()
            ]
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'mobile' => 'nullable|string|max:50',
            'company_id' => 'nullable|integer|exists:companies,id',
            'lead_status' => 'nullable|string|max:100',
            'source' => 'nullable|string|max:100',
            'avatar' => 'nullable|string',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
        ]);

        $contact = Contact::create($validated);

        // Record activity
        $this->logCreated($contact, "Created contact: {$contact->first_name} {$contact->last_name}");

        return response()->json([
            'success' => true,
            'data' => $contact->load('company'),
            'message' => 'Contact created successfully'
        ], 201);
    }

    public function show(int $id)
    {
        $contact = Contact::with('company')->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $contact
        ]);
    }

    public function update(Request $request, int $id)
    {
        $contact = Contact::findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'mobile' => 'nullable|string|max:50',
            'company_id' => 'nullable|integer|exists:companies,id',
            'lead_status' => 'nullable|string|max:100',
            'source' => 'nullable|string|max:100',
            'avatar' => 'nullable|string',
            'address' => 'nullable|string|max:500',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
        ]);

        $contact->update($validated);

        // Record activity
        $this->logUpdated($contact, $validated, "Updated contact: {$contact->first_name} {$contact->last_name}");

        return response()->json([
            'success' => true,
            'data' => $contact->load('company'),
            'message' => 'Contact updated successfully'
        ]);
    }

    public function destroy(int $id)
    {
        $contact = Contact::findOrFail($id);
        $contactName = "{$contact->first_name} {$contact->last_name}";
        $contact->delete();

        // Record activity (note: subject is deleted, so we log without subject reference)
        $this->logActivity(
            Activity::TYPE_DELETED,
            "Deleted contact: {$contactName}"
        );

        return response()->json([
            'success' => true,
            'message' => 'Contact deleted successfully'
        ]);
    }
}
