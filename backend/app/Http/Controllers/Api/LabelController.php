<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Label;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LabelController extends Controller
{
    public function index(Request $request)
    {
        $query = Label::query();

        if ($request->has('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }

        $labels = $query->orderBy('name')->get();

        return response()->json(['success' => true, 'data' => $labels]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:labels',
            'entity_type' => 'required|in:contact,company,deal,lead,invoice,quote,task',
            'color' => 'nullable|string|max:7',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $label = Label::create($request->all());

        return response()->json(['success' => true, 'data' => $label, 'message' => 'Label created'], 201);
    }

    public function show(Label $label)
    {
        return response()->json(['success' => true, 'data' => $label]);
    }

    public function update(Request $request, Label $label)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255|unique:labels,name,' . $label->id,
            'color' => 'nullable|string|max:7',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $label->update($request->all());

        return response()->json(['success' => true, 'data' => $label, 'message' => 'Label updated']);
    }

    public function destroy(Label $label)
    {
        $label->delete();

        return response()->json(['success' => true, 'message' => 'Label deleted']);
    }
}
