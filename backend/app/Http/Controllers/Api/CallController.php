<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Call;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CallController extends Controller
{
    public function index(Request $request)
    {
        $query = Call::query()->with(['contact', 'deal']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }
        if ($request->has('from_date')) {
            $query->whereDate('call_date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('call_date', '<=', $request->to_date);
        }

        $calls = $query->orderBy('call_date', 'desc')->paginate(20);

        return response()->json(['success' => true, 'data' => $calls]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'contact_id' => 'required|exists:contacts,id',
            'deal_id' => 'nullable|exists:deals,id',
            'type' => 'required|in:outbound,inbound',
            'direction' => 'required|in:outgoing,incoming',
            'status' => 'required|in:scheduled,completed,no_answer,busy,failed',
            'call_date' => 'required|date',
            'duration' => 'nullable|integer|min:0',
            'phone_number' => 'required|string|max:20',
            'notes' => 'nullable|string',
            'recording_url' => 'nullable|string',
            'outcome' => 'nullable|in:interested,not_interested,follow_up,no_decision',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $call = Call::create($request->all());

        return response()->json(['success' => true, 'data' => $call, 'message' => 'Call logged'], 201);
    }

    public function show(Call $call)
    {
        $call->load(['contact', 'deal']);

        return response()->json(['success' => true, 'data' => $call]);
    }

    public function update(Request $request, Call $call)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|in:scheduled,completed,no_answer,busy,failed',
            'duration' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
            'recording_url' => 'nullable|string',
            'outcome' => 'nullable|in:interested,not_interested,follow_up,no_decision',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $call->update($request->all());

        return response()->json(['success' => true, 'data' => $call, 'message' => 'Call updated']);
    }

    public function destroy(Call $call)
    {
        $call->delete();

        return response()->json(['success' => true, 'message' => 'Call deleted']);
    }

    public function record(Request $request, Call $call)
    {
        $validator = Validator::make($request->all(), [
            'recording_url' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $call->update(['recording_url' => $request->recording_url]);

        return response()->json(['success' => true, 'message' => 'Recording attached']);
    }

    public function getRecording(Call $call)
    {
        if (!$call->recording_url) {
            return response()->json(['success' => false, 'message' => 'No recording available'], 404);
        }

        return response()->json(['success' => true, 'data' => ['recording_url' => $call->recording_url]]);
    }

    public function schedule(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'contact_id' => 'required|exists:contacts,id',
            'deal_id' => 'nullable|exists:deals,id',
            'scheduled_date' => 'required|date|after:now',
            'phone_number' => 'required|string|max:20',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $call = Call::create([
            'contact_id' => $request->contact_id,
            'deal_id' => $request->deal_id,
            'type' => 'outbound',
            'direction' => 'outgoing',
            'status' => 'scheduled',
            'call_date' => $request->scheduled_date,
            'phone_number' => $request->phone_number,
            'notes' => $request->notes,
        ]);

        return response()->json(['success' => true, 'data' => $call, 'message' => 'Call scheduled'], 201);
    }
}
