<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        $products = Product::latest()->get();
        return response()->json($products);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|unique:products',
            'category' => 'nullable|string',
            'description' => 'nullable|string',
            'unit_price' => 'nullable|numeric',
            'quantity' => 'nullable|integer',
            'low_stock_threshold' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $product = Product::create($validated);
        return response()->json($product, 201);
    }

    public function show(Product $product)
    {
        return response()->json($product);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'sku' => 'nullable|string|unique:products,sku,' . $product->id,
            'category' => 'nullable|string',
            'description' => 'nullable|string',
            'unit_price' => 'nullable|numeric',
            'quantity' => 'nullable|integer',
            'low_stock_threshold' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        $product->update($validated);
        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return response()->json(['message' => 'Product deleted']);
    }
}
