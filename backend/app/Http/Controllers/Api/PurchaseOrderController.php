<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PurchaseOrderController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = PurchaseOrder::query()->with(['vendor', 'items']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by vendor
        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
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
                  ->orWhereHas('vendor', function ($cq) use ($request) {
                      $cq->where('name', 'like', '%' . $request->search . '%');
                  });
            });
        }

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
            'vendor_id' => 'required|exists:companies,id',
            'order_date' => 'required|date',
            'expected_delivery_date' => 'nullable|date',
            'status' => 'in:draft,submitted,approved,ordered,received,partial,cancelled',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
            'shipping_address' => 'nullable|string',
            'billing_address' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $purchaseOrder = PurchaseOrder::create($request->all());

        foreach ($request->items as $item) {
            $purchaseOrder->items()->create($item);
        }

        $purchaseOrder->load(['vendor', 'items.product']);

        return response()->json([
            'success' => true,
            'data' => $purchaseOrder,
            'message' => 'Purchase order created successfully'
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->load(['vendor', 'items.product', 'receipts']);

        return response()->json([
            'success' => true,
            'data' => $purchaseOrder
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        $validator = Validator::make($request->all(), [
            'vendor_id' => 'sometimes|exists:companies,id',
            'order_date' => 'sometimes|date',
            'expected_delivery_date' => 'nullable|date',
            'status' => 'sometimes|in:draft,submitted,approved,ordered,received,partial,cancelled',
            'notes' => 'nullable|string',
            'shipping_address' => 'nullable|string',
            'billing_address' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $purchaseOrder->update($request->all());

        if ($request->has('items')) {
            $purchaseOrder->items()->delete();
            foreach ($request->items as $item) {
                $purchaseOrder->items()->create($item);
            }
        }

        $purchaseOrder->load(['vendor', 'items.product']);

        return response()->json([
            'success' => true,
            'data' => $purchaseOrder,
            'message' => 'Purchase order updated successfully'
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(PurchaseOrder $purchaseOrder)
    {
        $purchaseOrder->items()->delete();
        $purchaseOrder->delete();

        return response()->json([
            'success' => true,
            'message' => 'Purchase order deleted successfully'
        ]);
    }

    /**
     * Update order status
     */
    public function updateStatus(Request $request, PurchaseOrder $purchaseOrder)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:draft,submitted,approved,ordered,received,partial,cancelled'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $purchaseOrder->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'data' => $purchaseOrder,
            'message' => 'Order status updated successfully'
        ]);
    }

    /**
     * Mark items as received
     */
    public function receiveItems(Request $request, PurchaseOrder $purchaseOrder)
    {
        $validator = Validator::make($request->all(), [
            'items' => 'required|array',
            'items.*.item_id' => 'required|exists:purchase_order_items,id',
            'items.*.quantity_received' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        foreach ($request->items as $item) {
            $orderItem = $purchaseOrder->items()->find($item['item_id']);
            if ($orderItem) {
                $orderItem->update(['quantity_received' => $item['quantity_received']]);
            }
        }

        // Check if all items received
        $allReceived = $purchaseOrder->items->every(function ($item) {
            return $item->quantity_received >= $item->quantity;
        });

        if ($allReceived) {
            $purchaseOrder->update(['status' => 'received']);
        } else {
            $purchaseOrder->update(['status' => 'partial']);
        }

        $purchaseOrder->load('items');

        return response()->json([
            'success' => true,
            'data' => $purchaseOrder,
            'message' => 'Items received successfully'
        ]);
    }

    /**
     * Get purchase order statistics
     */
    public function statistics(Request $request)
    {
        $query = PurchaseOrder::query();

        if ($request->has('from_date')) {
            $query->whereDate('order_date', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('order_date', '<=', $request->to_date);
        }

        $stats = [
            'total_orders' => $query->count(),
            'total_spent' => $query->sum('total'),
            'pending_orders' => $query->whereIn('status', ['draft', 'submitted', 'approved', 'ordered'])->count(),
            'received_orders' => $query->where('status', 'received')->count(),
            'cancelled_orders' => $query->where('status', 'cancelled')->count(),
            'average_order_value' => $query->avg('total'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}
