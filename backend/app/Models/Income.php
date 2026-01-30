<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Income extends Model
{
    use HasFactory;

    protected $table = 'income';

    protected $fillable = [
        'category_id',
        'customer_id',
        'vehicle_id',
        'income_date',
        'description',
        'amount',
        'payment_method',
        'reference_number',
        'invoice_number',
        'status',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'income_date' => 'date',
            'amount' => 'decimal:2',
        ];
    }

    public function category()
    {
        return $this->belongsTo(IncomeCategory::class, 'category_id');
    }

    public function customer()
    {
        return $this->belongsTo(Customer::class);
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeForPeriod($query, $startDate, $endDate)
    {
        return $query->whereBetween('income_date', [$startDate, $endDate]);
    }

    public function scopeReceived($query)
    {
        return $query->where('status', 'received');
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['pending', 'partial']);
    }
}
