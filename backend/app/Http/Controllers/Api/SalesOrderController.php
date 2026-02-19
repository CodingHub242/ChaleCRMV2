<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SalesOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = SalesOrder::query()->with(['customer', 'deal', 'items']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by customer
        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->customer_id);
        }

        // Date range filter
        if ($request->has('from_date')) {
            $query->whereDate('order_date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('order_date', '<=', $request->to_date);
        }

        // Search
        if ($request->has('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('order_number', 'like', '%' . $request->search . '%')
                  ->orWhereHas('customer', function ($cq) use ($request) {
                      $cq->where('name', 'like', '%' . $request->search . '%');
                  });
            });
        }

        // Sort
        $sortBy = $request->sort_by ?? 'created_at';
        $sortOrder = $request->sort_order ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        $perPage = $request->per_page ?? 15;
        $orders = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|exists:contacts,id',
            'deal_id' => 'nullable|exists:deals,id',
            'order_date' => 'required|date',
            'due_date' => 'nullable|date',
            'status' => 'in:draft,confirmed,processing,shipped,delivered,cancelled',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'terms' => 'nullable|string',
            'shipping_address' => 'nullable|string',
            'billing_address' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $salesOrder = SalesOrder::create($request->all());
        
        // Create order items
        foreach ($request->items as $item) {
            $salesOrder->items()->create($item);
        }

        $salesOrder->load(['customer', 'deal', 'items.product']);

        return response()->json([
            'success' => true,
            'data' => $salesOrder,
            'message' => 'Sales order created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(SalesOrder $salesOrder)
    {
        $salesOrder->load(['customer', 'deal', 'items.product', 'invoice']);

        return response()->json([
            'success' => true,
            'data' => $salesOrder
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, SalesOrder $salesOrder)
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'sometimes|exists:contacts,id',
            'deal_id' => 'nullable|exists:deals,id',
            'order_date' => 'sometimes|date',
            'due_date' => 'nullable|date',
            'status' => 'sometimes|in:draft,confirmed,processing,shipped,delivered,cancelled',
            'notes' => 'nullable|string',
            'terms' => 'nullable|string',
            'shipping_address' => 'nullable|string',
            'billing_address' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $salesOrder->update($request->all());

        // Update items if provided
        if ($request->has('items')) {
            $salesOrder->items()->delete();
            foreach ($request->items as $item) {
                $salesOrder->items()->create($item);
            }
        }

        $salesOrder->load(['customer', 'deal', 'items.product']);

        return response()->json([
            'success' => true,
            'data' => $salesOrder,
            'message' => 'Sales order updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SalesOrder $salesOrder)
    {
        $salesOrder->items()->delete();
        $salesOrder->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sales order deleted successfully'
        ]);
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, SalesOrder $salesOrder)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:draft,confirmed,processing,shipped,delivered,cancelled'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $salesOrder->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'data' => $salesOrder,
            'message' => 'Order status updated successfully'
        ]);
    }

    /**
     * Convert sales order to invoice
     */
    public function convertToInvoice(SalesOrder $salesOrder)
    {
        $invoice = $salesOrder->convertToInvoice();

        return response()->json([
            'success' => true,
            'data' => $invoice,
            'message' => 'Invoice created successfully'
        ], 201);
    }

    /**
     * Send sales order to customer
     */
    public function sendToCustomer(SalesOrder $salesOrder)
    {
        // Implementation would send email with PDF attachment
        // Mail::to($salesOrder->customer->email)->send(new SalesOrderMail($salesOrder));

        return response()->json([
            'success' => true,
            'message' => 'Sales order sent to customer'
        ]);
    }

    /**
     * Get order statistics
     */
    public function statistics(Request $request)
    {
        $query = SalesOrder::query();

        if ($request->has('from_date')) {
            $query->whereDate('order_date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('order_date', '<=', $request->to_date);
        }

        $stats = [
            'total_orders' => $query->count(),
            'total_revenue' => $query->sum('total'),
            'pending_orders' => $query->whereIn('status', ['draft', 'confirmed', 'processing'])->count(),
            'completed_orders' => $query->where('status', 'delivered')->count(),
            'cancelled_orders' => $query->where('status', 'cancelled')->count(),
            'average_order_value' => $query->avg('total'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
