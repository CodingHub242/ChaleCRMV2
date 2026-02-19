<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TagController extends Controller
{
    public function index(Request $request)
    {
        $query = Tag::query();

        if ($request->has('entity_type')) {
            $query->where('entity_type', $request->entity_type);
        }

        $tags = $query->withCount('contacts', 'companies', 'deals')->orderBy('name')->get();

        return response()->json(['success' => true, 'data' => $tags]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:tags',
            'entity_type' => 'required|in:contact,company,deal,lead,invoice,quote',
            'color' => 'nullable|string|max:7',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $tag = Tag::create($request->all());

        return response()->json(['success' => true, 'data' => $tag, 'message' => 'Tag created'], 201);
    }

    public function show(Tag $tag)
    {
        $tag->load(['contacts', 'companies', 'deals']);

        return response()->json(['success' => true, 'data' => $tag]);
    }

    public function update(Request $request, Tag $tag)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255|unique:tags,name,' . $tag->id,
            'color' => 'nullable|string|max:7',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $tag->update($request->all());

        return response()->json(['success' => true, 'data' => $tag, 'message' => 'Tag updated']);
    }

    public function destroy(Tag $tag)
    {
        // Remove tag from all entities
        $tag->contacts()->detach();
        $tag->companies()->detach();
        $tag->deals()->detach();

        $tag->delete();

        return response()->json(['success' => true, 'message' => 'Tag deleted']);
    }

    public function assign(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tag_id' => 'required|exists:tags,id',
            'entity_type' => 'required|in:contact,company,deal,lead',
            'entity_ids' => 'required|array|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $tag = Tag::find($request->tag_id);

        switch ($request->entity_type) {
            case 'contact':
                $tag->contacts()->syncWithoutDetaching($request->entity_ids);
                break;
            case 'company':
                $tag->companies()->syncWithoutDetaching($request->entity_ids);
                break;
            case 'deal':
                $tag->deals()->syncWithoutDetaching($request->entity_ids);
                break;
        }

        return response()->json(['success' => true, 'message' => 'Tag assigned']);
    }

    public function remove(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'tag_id' => 'required|exists:tags,id',
            'entity_type' => 'required|in:contact,company,deal,lead',
            'entity_ids' => 'required|array|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $tag = Tag::find($request->tag_id);

        switch ($request->entity_type) {
            case 'contact':
                $tag->contacts()->detach($request->entity_ids);
                break;
            case 'company':
                $tag->companies()->detach($request->entity_ids);
                break;
            case 'deal':
                $tag->deals()->detach($request->entity_ids);
                break;
        }

        return response()->json(['success' => true, 'message' => 'Tag removed']);
    }
}
