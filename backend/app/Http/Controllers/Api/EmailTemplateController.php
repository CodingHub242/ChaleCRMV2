<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailTemplate;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EmailTemplateController extends Controller
{
    public function index(Request $request)
    {
        $query = EmailTemplate::query();

        if ($request->has('category')) {
            $query->where('category', $request->category);
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
            'category' => 'required|in:lead,deal,invoice,quote,contact,company,custom',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'variables' => 'nullable|array',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $template = EmailTemplate::create($request->all());

        return response()->json(['success' => true, 'data' => $template, 'message' => 'Email template created'], 201);
    }

    public function show(EmailTemplate $emailTemplate)
    {
        return response()->json(['success' => true, 'data' => $emailTemplate]);
    }

    public function update(Request $request, EmailTemplate $emailTemplate)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'category' => 'sometimes|in:lead,deal,invoice,quote,contact,company,custom',
            'subject' => 'sometimes|string|max:255',
            'body' => 'sometimes|string',
            'variables' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $emailTemplate->update($request->all());

        return response()->json(['success' => true, 'data' => $emailTemplate, 'message' => 'Email template updated']);
    }

    public function destroy(EmailTemplate $emailTemplate)
    {
        $emailTemplate->delete();

        return response()->json(['success' => true, 'message' => 'Email template deleted']);
    }

    public function preview(Request $request, EmailTemplate $emailTemplate)
    {
        $validator = Validator::make($request->all(), [
            'variables' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $rendered = $emailTemplate->render($request->variables ?? []);

        return response()->json(['success' => true, 'data' => $rendered]);
    }

    public function duplicate(EmailTemplate $emailTemplate)
    {
        $newTemplate = $emailTemplate->replicate();
        $newTemplate->name = $emailTemplate->name . ' (Copy)';
        $newTemplate->save();

        return response()->json(['success' => true, 'data' => $newTemplate, 'message' => 'Template duplicated'], 201);
    }
}
