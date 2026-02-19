<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    public function overview(Request $request)
    {
        $fromDate = $request->from_date ?? now()->startOfMonth();
        $toDate = $request->to_date ?? now();

        $overview = [
            'total_revenue' => DB::table('invoices')->whereBetween('invoice_date', [$fromDate, $toDate])->sum('total'),
            'total_deals' => DB::table('deals')->whereBetween('created_at', [$fromDate, $toDate])->count(),
            'total_contacts' => DB::table('contacts')->whereBetween('created_at', [$fromDate, $toDate])->count(),
            'total_companies' => DB::table('companies')->whereBetween('created_at', [$fromDate, $toDate])->count(),
            'conversion_rate' => $this->calculateConversionRate($fromDate, $toDate),
            'average_deal_size' => DB::table('deals')->whereBetween('created_at', [$fromDate, $toDate])->avg('value'),
            'deals_by_stage' => $this->getDealsByStage($fromDate, $toDate),
            'revenue_by_month' => $this->getRevenueByMonth($fromDate, $toDate),
        ];

        return response()->json(['success' => true, 'data' => $overview]);
    }

    public function sales(Request $request)
    {
        $fromDate = $request->from_date ?? now()->startOfMonth();
        $toDate = $request->to_date ?? now();

        $sales = [
            'total_sales' => DB::table('invoices')->whereBetween('invoice_date', [$fromDate, $toDate])->sum('total'),
            'total_orders' => DB::table('invoices')->whereBetween('invoice_date', [$fromDate, $toDate])->count(),
            'average_order_value' => DB::table('invoices')->whereBetween('invoice_date', [$fromDate, $toDate])->avg('total'),
            'sales_by_product' => $this->getSalesByProduct($fromDate, $toDate),
            'sales_by_customer' => $this->getSalesByCustomer($fromDate, $toDate),
            'top_performing_products' => $this->getTopProducts($fromDate, $toDate),
        ];

        return response()->json(['success' => true, 'data' => $sales]);
    }

    public function pipeline(Request $request)
    {
        $pipeline = [
            'total_pipeline_value' => DB::table('deals')->where('status', 'active')->sum('value'),
            'deals_count' => DB::table('deals')->where('status', 'active')->count(),
            'by_stage' => DB::table('deals')
                ->select('stage', DB::raw('count(*) as count'), DB::raw('sum(value) as total_value'))
                ->where('status', 'active')
                ->groupBy('stage')
                ->get(),
            'won_deals' => DB::table('deals')->where('stage', 'won')->count(),
            'lost_deals' => DB::table('deals')->where('stage', 'lost')->count(),
            'conversion_by_stage' => $this->getStageConversion(),
        ];

        return response()->json(['success' => true, 'data' => $pipeline]);
    }

    public function performance(Request $request)
    {
        $fromDate = $request->from_date ?? now()->startOfMonth();
        $toDate = $request->to_date ?? now();

        $performance = [
            'tasks_completed' => DB::table('tasks')->whereBetween('completed_at', [$fromDate, $toDate])->count(),
            'calls_logged' => DB::table('calls')->whereBetween('call_date', [$fromDate, $toDate])->count(),
            'meetings_scheduled' => DB::table('activities')->whereBetween('activity_date', [$fromDate, $toDate])
                ->where('type', 'meeting')->count(),
            'emails_sent' => DB::table('activities')->whereBetween('activity_date', [$fromDate, $toDate])
                ->where('type', 'email')->count(),
            'lead_response_time' => $this->getAverageResponseTime(),
            'activity_by_user' => $this->getActivityByUser($fromDate, $toDate),
        ];

        return response()->json(['success' => true, 'data' => $performance]);
    }

    public function generateReport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:sales,pipeline,performance,custom',
            'from_date' => 'required|date',
            'to_date' => 'required|date|after:from_date',
            'filters' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Generate report based on type
        $report = [
            'type' => $request->type,
            'period' => [
                'from' => $request->from_date,
                'to' => $request->to_date,
            ],
            'generated_at' => now(),
            'data' => $this->generateReportData($request->type, $request->from_date, $request->to_date),
        ];

        return response()->json(['success' => true, 'data' => $report]);
    }

    private function calculateConversionRate($from, $to)
    {
        $total = DB::table('deals')->whereBetween('created_at', [$from, $to])->count();
        $won = DB::table('deals')->whereBetween('created_at', [$from, $to])->where('stage', 'won')->count();

        return $total > 0 ? ($won / $total) * 100 : 0;
    }

    private function getDealsByStage($from, $to)
    {
        return DB::table('deals')
            ->select('stage', DB::raw('count(*) as count'), DB::raw('sum(value) as value'))
            ->whereBetween('created_at', [$from, $to])
            ->groupBy('stage')
            ->get();
    }

    private function getRevenueByMonth($from, $to)
    {
        return DB::table('invoices')
            ->select(DB::raw('MONTH(invoice_date) as month'), DB::raw('SUM(total) as revenue'))
            ->whereBetween('invoice_date', [$from, $to])
            ->groupBy('month')
            ->get();
    }

    private function getSalesByProduct($from, $to)
    {
        return DB::table('invoice_items')
            ->join('products', 'invoice_items.product_id', '=', 'products.id')
            ->join('invoices', 'invoice_items.invoice_id', '=', 'invoices.id')
            ->whereBetween('invoices.invoice_date', [$from, $to])
            ->select('products.name', DB::raw('SUM(invoice_items.quantity) as quantity'), DB::raw('SUM(invoice_items.amount) as revenue'))
            ->groupBy('products.id')
            ->get();
    }

    private function getSalesByCustomer($from, $to)
    {
        return DB::table('invoices')
            ->join('contacts', 'invoices.customer_id', '=', 'contacts.id')
            ->whereBetween('invoices.invoice_date', [$from, $to])
            ->select('contacts.name', DB::raw('SUM(invoices.total) as total'))
            ->groupBy('contacts.id')
            ->orderByDesc('total')
            ->limit(10)
            ->get();
    }

    private function getTopProducts($from, $to)
    {
        return DB::table('invoice_items')
            ->join('products', 'invoice_items.product_id', '=', 'products.id')
            ->join('invoices', 'invoice_items.invoice_id', '=', 'invoices.id')
            ->whereBetween('invoices.invoice_date', [$from, $to])
            ->select('products.name', DB::raw('COUNT(*) as orders'), DB::raw('SUM(invoice_items.amount) as revenue'))
            ->groupBy('products.id')
            ->orderByDesc('revenue')
            ->limit(10)
            ->get();
    }

    private function getStageConversion()
    {
        return ['stage_conversion_data' => 'implementation_needed'];
    }

    private function getAverageResponseTime()
    {
        return ['average_hours' => 0];
    }

    private function getActivityByUser($from, $to)
    {
        return DB::table('activities')
            ->join('users', 'activities.user_id', '=', 'users.id')
            ->whereBetween('activities.created_at', [$from, $to])
            ->select('users.name', DB::raw('COUNT(*) as activities'))
            ->groupBy('users.id')
            ->get();
    }

    private function generateReportData($type, $from, $to)
    {
        return ['report_data' => 'implementation_needed'];
    }
}
