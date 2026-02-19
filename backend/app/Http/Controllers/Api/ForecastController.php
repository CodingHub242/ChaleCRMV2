<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ForecastController extends Controller
{
    public function predictions(Request $request)
    {
        $period = $request->period ?? 3; // months
        $fromDate = $request->from_date ?? now();

        // Simple prediction based on historical data
        $historicalData = $this->getHistoricalData($fromDate, $period);
        $predictions = $this->calculatePredictions($historicalData, $period);

        return response()->json([
            'success' => true,
            'data' => [
                'historical' => $historicalData,
                'predictions' => $predictions,
                'methodology' => 'moving_average',
                'confidence' => 0.75,
            ]
        ]);
    }

    public function analyze(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'deal_stage' => 'nullable|string',
            'time_period' => 'nullable|integer|min:1|max:12',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $query = DB::table('deals')->where('status', 'active');

        if ($request->deal_stage) {
            $query->where('stage', $request->deal_stage);
        }

        $deals = $query->get();
        $totalValue = $deals->sum('value');
        $weightedValue = $this->calculateWeightedValue($deals);

        $analysis = [
            'total_open_deals' => $deals->count(),
            'total_pipeline_value' => $totalValue,
            'weighted_forecast' => $weightedValue,
            'average_deal_size' => $deals->count() > 0 ? $totalValue / $deals->count() : 0,
            'by_stage' => $this->getDealStageBreakdown($deals),
            'probability_weighted' => $this->getProbabilityWeighted($deals),
        ];

        return response()->json(['success' => true, 'data' => $analysis]);
    }

    private function getHistoricalData($fromDate, $months)
    {
        $data = [];
        for ($i = $months; $i >= 1; $i--) {
            $date = now()->subMonths($i);
            $monthStart = $date->startOfMonth();
            $monthEnd = $date->endOfMonth();

            $revenue = DB::table('invoices')
                ->whereBetween('invoice_date', [$monthStart, $monthEnd])
                ->where('status', 'paid')
                ->sum('total');

            $deals = DB::table('deals')
                ->whereBetween('closed_at', [$monthStart, $monthEnd])
                ->where('stage', 'won')
                ->count();

            $data[] = [
                'month' => $date->format('Y-m'),
                'revenue' => $revenue,
                'deals_won' => $deals,
            ];
        }

        return $data;
    }

    private function calculatePredictions($historicalData, $period)
    {
        if (empty($historicalData)) {
            return [];
        }

        $revenues = array_column($historicalData, 'revenue');
        $average = array_sum($revenues) / count($revenues);
        
        // Simple linear trend
        $trend = $this->calculateTrend($revenues);

        $predictions = [];
        $lastRevenue = end($revenues);

        for ($i = 1; $i <= $period; $i++) {
            $predictedValue = $lastRevenue + ($trend * $i);
            $predictions[] = [
                'month' => now()->addMonths($i)->format('Y-m'),
                'predicted_revenue' => max(0, $predictedValue),
                'confidence_interval' => [
                    'low' => max(0, $predictedValue * 0.8),
                    'high' => $predictedValue * 1.2,
                ],
            ];
        }

        return $predictions;
    }

    private function calculateTrend($data)
    {
        $n = count($data);
        if ($n < 2) return 0;

        $xSum = 0;
        $ySum = 0;
        $xySum = 0;
        $x2Sum = 0;

        for ($i = 0; $i < $n; $i++) {
            $xSum += $i;
            $ySum += $data[$i];
            $xySum += $i * $data[$i];
            $x2Sum += $i * $i;
        }

        $slope = ($n * $xySum - $xSum * $ySum) / ($n * $x2Sum - $xSum * $xSum);

        return $slope;
    }

    private function calculateWeightedValue($deals)
    {
        $stageWeights = [
            'lead' => 0.1,
            'qualified' => 0.25,
            'proposal' => 0.5,
            'negotiation' => 0.75,
            'won' => 1.0,
        ];

        $weighted = 0;
        foreach ($deals as $deal) {
            $weight = $stageWeights[$deal->stage] ?? 0.5;
            $weighted += $deal->value * $weight;
        }

        return $weighted;
    }

    private function getDealStageBreakdown($deals)
    {
        return $deals->groupBy('stage')->map(function ($stageDeals) {
            return [
                'count' => $stageDeals->count(),
                'value' => $stageDeals->sum('value'),
            ];
        });
    }

    private function getProbabilityWeighted($deals)
    {
        $stageProbabilities = [
            'lead' => 10,
            'qualified' => 25,
            'proposal' => 50,
            'negotiation' => 75,
            'won' => 100,
        ];

        return $deals->sum(function ($deal) use ($stageProbabilities) {
            $probability = $stageProbabilities[$deal->stage] ?? 50;
            return ($deal->value * $probability) / 100;
        });
    }
}
