<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Workflow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class WorkflowController extends Controller
{
    public function index(Request $request)
    {
        $query = Workflow::query();

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }
        if ($request->has('trigger_type')) {
            $query->where('trigger_type', $request->trigger_type);
        }

        $workflows = $query->orderBy('name')->get();

        return response()->json(['success' => true, 'data' => $workflows]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'trigger_type' => 'required|in:record_created,record_updated,record_deleted,field_changed,scheduled',
            'trigger_conditions' => 'nullable|array',
            'actions' => 'required|array|min:1',
            'actions.*.type' => 'required|in:send_email,update_field,create_task,add_to_list,remove_from_list,webhook,notification',
            'actions.*.config' => 'required|array',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $workflow = Workflow::create($request->all());

        return response()->json(['success' => true, 'data' => $workflow, 'message' => 'Workflow created successfully'], 201);
    }

    public function show(Workflow $workflow)
    {
        return response()->json(['success' => true, 'data' => $workflow]);
    }

    public function update(Request $request, Workflow $workflow)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'trigger_type' => 'sometimes|in:record_created,record_updated,record_deleted,field_changed,scheduled',
            'trigger_conditions' => 'nullable|array',
            'actions' => 'sometimes|array|min:1',
            'is_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $workflow->update($request->all());

        return response()->json(['success' => true, 'data' => $workflow, 'message' => 'Workflow updated successfully']);
    }

    public function destroy(Workflow $workflow)
    {
        $workflow->delete();

        return response()->json(['success' => true, 'message' => 'Workflow deleted successfully']);
    }

    public function activate(Workflow $workflow)
    {
        $workflow->update(['is_active' => true]);

        return response()->json(['success' => true, 'message' => 'Workflow activated']);
    }

    public function deactivate(Workflow $workflow)
    {
        $workflow->update(['is_active' => false]);

        return response()->json(['success' => true, 'message' => 'Workflow deactivated']);
    }

    public function execute(Request $request, Workflow $workflow)
    {
        $validator = Validator::make($request->all(), [
            'record_id' => 'required|integer',
            'record_type' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Execute workflow actions
        $workflow->execute($request->record_id, $request->record_type);

        return response()->json(['success' => true, 'message' => 'Workflow executed']);
    }

    public function executionHistory(Workflow $workflow)
    {
        $history = $workflow->executions()->orderBy('created_at', 'desc')->paginate(20);

        return response()->json(['success' => true, 'data' => $history]);
    }
}
