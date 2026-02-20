<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalesOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'contact_id',
        'company_id',
        'deal_id',
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

    public function contact()
    {
        return $this->belongsTo(Contact::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function deal()
    {
        return $this->belongsTo(Deal::class);
    }

    public function items()
    {
        return $this->morphMany(OrderItem::class, 'orderable');
    }
}
