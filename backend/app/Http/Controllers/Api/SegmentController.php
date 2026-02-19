<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Segment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class SegmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Segment::query();

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        $segments = $query->orderBy('name')->get();

        return response()->json(['success' => true, 'data' => $segments]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'type' => 'required|in:contact,company,lead,deal',
            'description' => 'nullable|string',
            'conditions' => 'required|array|min:1',
            'conditions.*.field' => 'required|string',
            'conditions.*.operator' => 'required|in:equals,not_equals,contains,greater_than,less_than,between,is_null,is_not_null',
            'conditions.*.value' => 'required',
            'logic' => 'nullable|in:and,or',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $segment = Segment::create($request->all());

        return response()->json(['success' => true, 'data' => $segment, 'message' => 'Segment created'], 201);
    }

    public function show(Segment $segment)
    {
        $segment->load('contacts');

        return response()->json(['success' => true, 'data' => $segment]);
    }

    public function update(Request $request, Segment $segment)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'conditions' => 'sometimes|array|min:1',
            'logic' => 'nullable|in:and,or',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $segment->update($request->all());

        return response()->json(['success' => true, 'data' => $segment, 'message' => 'Segment updated']);
    }

    public function destroy(Segment $segment)
    {
        $segment->delete();

        return response()->json(['success' => true, 'message' => 'Segment deleted']);
    }

    public function analyze(Request $request, Segment $segment)
    {
        $contacts = $this->getSegmentContacts($segment);

        $analysis = [
            'total_contacts' => $contacts->count(),
            'with_email' => $contacts->whereNotNull('email')->count(),
            'with_phone' => $contacts->whereNotNull('phone')->count(),
            'by_source' => $contacts->groupBy('source')->map->count(),
            'by_industry' => $contacts->whereNotNull('industry')->groupBy('industry')->map->count(),
            'recently_active' => $contacts->where('last_activity_at', '>=', now()->subDays(30))->count(),
        ];

        return response()->json(['success' => true, 'data' => $analysis]);
    }

    public function export(Segment $segment)
    {
        $contacts = $this->getSegmentContacts($segment);

        return response()->json([
            'success' => true,
            'data' => [
                'contacts' => $contacts->toArray(),
                'count' => $contacts->count(),
            ]
        ]);
    }

    private function getSegmentContacts($segment)
    {
        $query = DB::table('contacts');

        $logic = $segment->logic ?? 'and';

        foreach ($segment->conditions as $condition) {
            $field = $condition['field'];
            $operator = $condition['operator'];
            $value = $condition['value'];

            if ($logic === 'and') {
                $query->where(function ($q) use ($field, $operator, $value) {
                    $this->applyCondition($q, $field, $operator, $value);
                });
            } else {
                $query->orWhere(function ($q) use ($field, $operator, $value) {
                    $this->applyCondition($q, $field, $operator, $value);
                });
            }
        }

        return $query->get();
    }

    private function applyCondition($query, $field, $operator, $value)
    {
        switch ($operator) {
            case 'equals':
                $query->where($field, $value);
                break;
            case 'not_equals':
                $query->where($field, '!=', $value);
                break;
            case 'contains':
                $query->where($field, 'like', '%' . $value . '%');
                break;
            case 'greater_than':
                $query->where($field, '>', $value);
                break;
            case 'less_than':
                $query->where($field, '<', $value);
                break;
            case 'between':
                $query->whereBetween($field, $value);
                break;
            case 'is_null':
                $query->whereNull($field);
                break;
            case 'is_not_null':
                $query->whereNotNull($field);
                break;
        }
    }
}
