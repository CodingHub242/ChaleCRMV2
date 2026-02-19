<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class EnrichmentController extends Controller
{
    public function enrich(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'entity_type' => 'required|in:contact,company',
            'entity_id' => 'required|integer',
            'provider' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $entityType = $request->entity_type;
        $entityId = $request->entity_id;
        $provider = $request->provider ?? 'clearbit';

        // Mock enrichment data - in production, integrate with Clearbit, FullContact, etc.
        $enrichedData = $this->fetchEnrichmentData($entityType, $entityId, $provider);

        return response()->json([
            'success' => true,
            'data' => [
                'provider' => $provider,
                'enriched_data' => $enrichedData,
                'enriched_at' => now(),
            ]
        ]);
    }

    public function providers()
    {
        $providers = [
            [
                'id' => 'clearbit',
                'name' => 'Clearbit',
                'description' => 'Company and person enrichment',
                'fields' => ['company', 'person', 'email', 'social'],
            ],
            [
                'id' => 'fullcontact',
                'name' => 'FullContact',
                'description' => 'Person and company enrichment',
                'fields' => ['person', 'company', 'social'],
            ],
            [
                'id' => 'zoomInfo',
                'name' => 'ZoomInfo',
                'description' => 'B2B contact and company data',
                'fields' => ['person', 'company', 'phone', 'email'],
            ],
        ];

        return response()->json(['success' => true, 'data' => $providers]);
    }

    public function bulkEnrich(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'entity_type' => 'required|in:contact,company',
            'entity_ids' => 'required|array|min:1|max:100',
            'provider' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $results = [];
        foreach ($request->entity_ids as $entityId) {
            $enrichedData = $this->fetchEnrichmentData(
                $request->entity_type,
                $entityId,
                $request->provider ?? 'clearbit'
            );

            $results[] = [
                'entity_id' => $entityId,
                'enriched_data' => $enrichedData,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => [
                'results' => $results,
                'total' => count($results),
            ]
        ]);
    }

    private function fetchEnrichmentData($entityType, $entityId, $provider)
    {
        // Mock data - replace with actual API integration
        return [
            'provider' => $provider,
            'data' => [
                'company' => [
                    'name' => 'Sample Company',
                    'domain' => 'sample.com',
                    'industry' => 'Technology',
                    'employees' => rand(10, 1000),
                    'revenue' => '$' . rand(1, 100) . 'M',
                    'description' => 'A sample company for enrichment',
                ],
                'person' => [
                    'name' => 'John Doe',
                    'title' => 'CEO',
                    'email' => 'john@sample.com',
                    'linkedin' => 'https://linkedin.com/in/johndoe',
                    'location' => 'San Francisco, CA',
                ],
                'social' => [
                    'linkedin' => 'https://linkedin.com/company/sample',
                    'twitter' => 'https://twitter.com/sample',
                    'facebook' => 'https://facebook.com/sample',
                ],
            ],
            'confidence' => 0.85,
        ];
    }
}
