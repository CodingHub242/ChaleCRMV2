<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'customer_id',
        'deal_id',
        'order_date',
        'due_date',
        'status',
        'subtotal',
        'tax_amount',
        'discount_amount',
        'shipping_amount',
        'total',
        'notes',
        'terms',
        'shipping_address',
        'billing_address',
    ];

    protected $casts = [
        'order_date' => 'date',
        'due_date' => 'date',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'shipping_amount' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    // Order statuses
    const STATUS_DRAFT = 'draft';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_PROCESSING = 'processing';
    const STATUS_SHIPPED = 'shipped';
    const STATUS_DELIVERED = 'delivered';
    const STATUS_CANCELLED = 'cancelled';

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($order) {
            if (empty($order->order_number)) {
                $order->order_number = 'SO-' . date('Ymd') . '-' . str_pad(static::count() + 1, 5, '0', STR_PAD_LEFT);
            }
        });
    }

    /**
     * Get the customer associated with this order
     */
    public function customer()
    {
        return $this->belongsTo(Contact::class, 'customer_id');
    }

    /**
     * Get the deal associated with this order
     */
    public function deal()
    {
        return $this->belongsTo(Deal::class, 'deal_id');
    }

    /**
     * Get the order items
     */
    public function items()
    {
        return $this->hasMany(SalesOrderItem::class, 'order_id');
    }

    /**
     * Get the associated invoice
     */
    public function invoice()
    {
        return $this->hasOne(Invoice::class, 'sales_order_id');
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
     * Convert to invoice
     */
    public function convertToInvoice()
    {
        $invoice = Invoice::create([
            'invoice_number' => 'INV-' . date('Ymd') . '-' . str_pad(Invoice::count() + 1, 5, '0', STR_PAD_LEFT),
            'customer_id' => $this->customer_id,
            'deal_id' => $this->deal_id,
            'sales_order_id' => $this->id,
            'invoice_date' => now(),
            'due_date' => now()->addDays(30),
            'status' => 'draft',
            'subtotal' => $this->subtotal,
            'tax_amount' => $this->tax_amount,
            'discount_amount' => $this->discount_amount,
            'shipping_amount' => $this->shipping_amount,
            'total' => $this->total,
            'notes' => $this->notes,
            'terms' => $this->terms,
        ]);

        // Copy items
        foreach ($this->items as $item) {
            $invoice->items()->create([
                'product_id' => $item->product_id,
                'description' => $item->description,
                'quantity' => $item->quantity,
                'unit_price' => $item->unit_price,
                'discount' => $item->discount,
                'tax_rate' => $item->tax_rate,
                'amount' => $item->amount,
            ]);
        }

        return $invoice;
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
        return $query->whereIn('status', [self::STATUS_DRAFT, self::STATUS_CONFIRMED, self::STATUS_PROCESSING]);
    }
}
