<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class DuplicateController extends Controller
{
    public function check(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'entity_type' => 'required|in:contact,company',
            'entity_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $entityType = $request->entity_type;
        $entityId = $request->entity_id;

        $duplicates = [];

        if ($entityType === 'contact') {
            $duplicates = $this->findContactDuplicates($entityId);
        } elseif ($entityType === 'company') {
            $duplicates = $this->findCompanyDuplicates($entityId);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'duplicates' => $duplicates,
                'count' => count($duplicates),
            ]
        ]);
    }

    public function merge(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'entity_type' => 'required|in:contact,company',
            'primary_id' => 'required|integer',
            'secondary_ids' => 'required|array|min:1',
            'merge_strategy' => 'nullable|in:primary_wins,latest_wins,manual',
            'field_mapping' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $entityType = $request->entity_type;
        $primaryId = $request->primary_id;
        $secondaryIds = $request->secondary_ids;
        $mergeStrategy = $request->merge_strategy ?? 'primary_wins';

        if ($entityType === 'contact') {
            $this->mergeContacts($primaryId, $secondaryIds, $mergeStrategy);
        } elseif ($entityType === 'company') {
            $this->mergeCompanies($primaryId, $secondaryIds, $mergeStrategy);
        }

        return response()->json([
            'success' => true,
            'message' => 'Entities merged successfully'
        ]);
    }

    private function findContactDuplicates($excludeId = null)
    {
        $query = DB::table('contacts')
            ->select('email', DB::raw('COUNT(*) as count'))
            ->whereNotNull('email')
            ->where('email', '!=', '');

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        $emailDuplicates = $query->groupBy('email')
            ->having('count', '>', 1)
            ->pluck('email');

        $duplicates = [];

        if ($emailDuplicates->isNotEmpty()) {
            $duplicateContacts = DB::table('contacts')
                ->whereIn('email', $emailDuplicates)
                ->get();

            foreach ($duplicateContacts->groupBy('email') as $email => $contacts) {
                $duplicates[] = [
                    'type' => 'email',
                    'value' => $email,
                    'entities' => $contacts,
                ];
            }
        }

        // Check for name duplicates
        $query = DB::table('contacts')
            ->select('first_name', 'last_name', DB::raw('COUNT(*) as count'))
            ->whereNotNull('first_name')
            ->whereNotNull('last_name');

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        $nameDuplicates = $query->groupBy('first_name', 'last_name')
            ->having('count', '>', 1)
            ->get();

        foreach ($nameDuplicates as $dup) {
            $contacts = DB::table('contacts')
                ->where('first_name', $dup->first_name)
                ->where('last_name', $dup->last_name)
                ->get();

            $duplicates[] = [
                'type' => 'name',
                'value' => $dup->first_name . ' ' . $dup->last_name,
                'entities' => $contacts,
            ];
        }

        return $duplicates;
    }

    private function findCompanyDuplicates($excludeId = null)
    {
        $query = DB::table('companies')
            ->select('name', DB::raw('COUNT(*) as count'))
            ->whereNotNull('name')
            ->where('name', '!=', '');

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        $nameDuplicates = $query->groupBy('name')
            ->having('count', '>', 1)
            ->pluck('name');

        $duplicates = [];

        if ($nameDuplicates->isNotEmpty()) {
            $duplicateCompanies = DB::table('companies')
                ->whereIn('name', $nameDuplicates)
                ->get();

            foreach ($duplicateCompanies->groupBy('name') as $name => $companies) {
                $duplicates[] = [
                    'type' => 'name',
                    'value' => $name,
                    'entities' => $companies,
                ];
            }
        }

        return $duplicates;
    }

    private function mergeContacts($primaryId, $secondaryIds, $strategy)
    {
        $primary = DB::table('contacts')->find($primaryId);

        foreach ($secondaryIds as $secondaryId) {
            $secondary = DB::table('contacts')->find($secondaryId);

            if (!$secondary) continue;

            // Move related deals
            DB::table('deals')
                ->where('contact_id', $secondaryId)
                ->update(['contact_id' => $primaryId]);

            // Move related activities
            DB::table('activities')
                ->where('contact_id', $secondaryId)
                ->update(['contact_id' => $primaryId]);

            // Delete secondary contact
            DB::table('contacts')->where('id', $secondaryId)->delete();
        }
    }

    private function mergeCompanies($primaryId, $secondaryIds, $strategy)
    {
        foreach ($secondaryIds as $secondaryId) {
            // Move related contacts
            DB::table('contacts')
                ->where('company_id', $secondaryId)
                ->update(['company_id' => $primaryId]);

            // Move related deals
            DB::table('deals')
                ->where('company_id', $secondaryId)
                ->update(['company_id' => $primaryId]);

            // Delete secondary company
            DB::table('companies')->where('id', $secondaryId)->delete();
        }
    }
}
