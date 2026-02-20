<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'vendor_id',
        'subtotal',
        'tax',
        'discount',
        'total',
        'status',
        'order_date',
        'delivery_date',
        'notes',
    ];

    protected $casts = [
        'order_date' => 'date',
        'delivery_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax' => 'decimal:2',
        'discount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function vendor()
    {
        return $this->belongsTo(Company::class, 'vendor_id');
    }

    public function items()
    {
        return $this->morphMany(OrderItem::class, 'orderable');
    }
}
