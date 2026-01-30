<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cheque extends Model
{
    use HasFactory;

    protected $fillable = [
        'type',
        'cheque_number',
        'bank_name',
        'account_number',
        'amount',
        'cheque_date',
        'deposit_date',
        'customer_id',
        'vendor_id',
        'payee_name',
        'purpose',
        'status',
        'clearance_date',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'cheque_date' => 'date',
            'deposit_date' => 'date',
            'clearance_date' => 'date',
        ];
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeCleared($query)
    {
        return $query->where('status', 'cleared');
    }

    public function scopeBounced($query)
    {
        return $query->where('status', 'bounced');
    }

    public function scopeReceived($query)
    {
        return $query->where('type', 'received');
    }

    public function scopeIssued($query)
    {
        return $query->where('type', 'issued');
    }
}
