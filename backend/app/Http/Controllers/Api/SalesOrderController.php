<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SalesOrder;
use Illuminate\Http\Request;

class SalesOrderController extends Controller
{
    public function index()
    {
        $orders = SalesOrder::with(['contact', 'company', 'deal', 'items'])->latest()->get();
        return response()->json($orders);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'order_number' => 'required|string|unique:sales_orders',
            'contact_id' => 'nullable|exists:contacts,id',
            'company_id' => 'nullable|exists:companies,id',
            'deal_id' => 'nullable|exists:deals,id',
            'subtotal' => 'nullable|numeric',
            'tax' => 'nullable|numeric',
            'discount' => 'nullable|numeric',
            'total' => 'nullable|numeric',
            'status' => 'nullable|string',
            'order_date' => 'nullable|date',
            'delivery_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $order = SalesOrder::create($validated);
        return response()->json($order->load(['contact', 'company', 'deal', 'items']), 201);
    }

    public function show(SalesOrder $salesOrder)
    {
        return response()->json($salesOrder->load(['contact', 'company', 'deal', 'items']));
    }

    public function update(Request $request, SalesOrder $salesOrder)
    {
        $validated = $request->validate([
            'order_number' => 'sometimes|string|unique:sales_orders,order_number,' . $salesOrder->id,
            'contact_id' => 'nullable|exists:contacts,id',
            'company_id' => 'nullable|exists:companies,id',
            'deal_id' => 'nullable|exists:deals,id',
            'subtotal' => 'nullable|numeric',
            'tax' => 'nullable|numeric',
            'discount' => 'nullable|numeric',
            'total' => 'nullable|numeric',
            'status' => 'nullable|string',
            'order_date' => 'nullable|date',
            'delivery_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $salesOrder->update($validated);
        return response()->json($salesOrder->load(['contact', 'company', 'deal', 'items']));
    }

    public function destroy(SalesOrder $salesOrder)
    {
        $salesOrder->delete();
        return response()->json(['message' => 'Sales order deleted']);
    }
}
