<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contract extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'type', 'customer_id', 'company_id', 'deal_id',
        'start_date', 'end_date', 'value', 'status', 'content',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'value' => 'decimal:2',
    ];

    const TYPE_SALES = 'sales';
    const TYPE_SERVICE = 'service';
    const TYPE_NDA = 'nda';
    const TYPE_EMPLOYMENT = 'employment';
    const TYPE_PARTNERSHIP = 'partnership';
    const TYPE_OTHER = 'other';

    const STATUS_DRAFT = 'draft';
    const STATUS_PENDING = 'pending';
    const STATUS_ACTIVE = 'active';
    const STATUS_EXPIRED = 'expired';
    const STATUS_TERMINATED = 'terminated';
    const STATUS_CANCELLED = 'cancelled';

    public function customer()
    {
        return $this->belongsTo(Contact::class, 'customer_id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }

    public function deal()
    {
        return $this->belongsTo(Deal::class, 'deal_id');
    }

    public function signers()
    {
        return $this->hasMany(ContractSigner::class, 'contract_id');
    }

    public function signatures()
    {
        return $this->hasMany(ContractSignature::class, 'contract_id');
    }

    public function isExpired()
    {
        return $this->end_date && $this->end_date->isPast();
    }

    public function getDaysRemainingAttribute()
    {
        if ($this->end_date) {
            return now()->diffInDays($this->end_date, false);
        }
        return null;
    }
}
