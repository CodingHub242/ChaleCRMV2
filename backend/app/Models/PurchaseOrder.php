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
        'order_date',
        'expected_delivery_date',
        'status',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'shipping_amount',
        'total',
        'notes',
        'shipping_address',
        'billing_address',
    ];

    protected $casts = [
        'order_date' => 'date',
        'expected_delivery_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'shipping_amount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    // Order statuses
    const STATUS_DRAFT = 'draft';
    const STATUS_SUBMITTED = 'submitted';
    const STATUS_APPROVED = 'approved';
    const STATUS_ORDERED = 'ordered';
    const STATUS_RECEIVED = 'received';
    const STATUS_PARTIAL = 'partial';
    const STATUS_CANCELLED = 'cancelled';

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = 'PO-' . date('Ymd') . '-' . str_pad(static::count() + 1, 5, '0', STR_PAD_LEFT);
            }
        });
    }

    /**
     * Get the vendor associated with this order
     */
    public function vendor()
    {
        return $this->belongsTo(Company::class, 'vendor_id');
    }

    /**
     * Get the order items
     */
    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class, 'order_id');
    }

    /**
     * Get the receipts
     */
    public function receipts()
    {
        return $this->hasMany(PurchaseReceipt::class, 'order_id');
    }

    /**
     * Calculate totals
     */
    public function calculateTotals()
    {
        $subtotal = $this->items->sum(function ($item) {
            return $item->quantity * $item->unit_price;
        });

        $this->subtotal = $subtotal;
        $this->total = $subtotal 
            + ($this->tax_amount ?? 0) 
            + ($this->shipping_amount ?? 0) 
            - ($this->discount_amount ?? 0);

        $this->save();
    }

    /**
     * Scope for orders by status
     */
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    /**
     * Scope for pending orders
     */
    public function scopePending($query)
    {
        return $query->whereIn('status', [self::STATUS_DRAFT, self::STATUS_SUBMITTED, self::STATUS_APPROVED, self::STATUS_ORDERED]);
    }
}
