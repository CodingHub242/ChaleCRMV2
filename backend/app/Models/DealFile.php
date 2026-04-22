<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DealFile extends Model
{
    protected $table = 'deal_files';
    
    protected $fillable = [
        'deal_id',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
    ];

    public function deal()
    {
        return $this->belongsTo(Deal::class);
    }
}