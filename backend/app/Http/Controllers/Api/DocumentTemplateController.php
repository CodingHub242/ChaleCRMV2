<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DocumentTemplateController extends Controller
{
    public function index(Request $request)
    {
        $query = DocumentTemplate::query();

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $templates = $query->orderBy('name')->get();

        return response()->json(['success' => true, 'data' => $templates]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|in:proposal,contract,invoice,quote,report,other',
            'content' => 'required|string',
            'variables' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $template = DocumentTemplate::create($request->all());

        return response()->json(['success' => true, 'data' => $template, 'message' => 'Document template created'], 201);
    }

    public function show(DocumentTemplate $documentTemplate)
    {
        return response()->json(['success' => true, 'data' => $documentTemplate]);
    }

    public function update(Request $request, DocumentTemplate $documentTemplate)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:proposal,contract,invoice,quote,report,other',
            'content' => 'sometimes|string',
            'variables' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $documentTemplate->update($request->all());

        return response()->json(['success' => true, 'data' => $documentTemplate, 'message' => 'Document template updated']);
    }

    public function destroy(DocumentTemplate $documentTemplate)
    {
        $documentTemplate->delete();

        return response()->json(['success' => true, 'message' => 'Document template deleted']);
    }

    public function generate(Request $request, DocumentTemplate $documentTemplate)
    {
        $validator = Validator::make($request->all(), [
            'variables' => 'required|array',
            'record_id' => 'nullable|integer',
            'record_type' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $generatedContent = $documentTemplate->generate($request->variables);

        return response()->json(['success' => true, 'data' => ['content' => $generatedContent]]);
    }
}
