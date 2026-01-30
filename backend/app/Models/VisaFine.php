<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisaFine extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'visa_id',
        'fine_type',
        'amount',
        'fine_date',
        'status',
        'payment_date',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'fine_date' => 'date',
            'payment_date' => 'date',
        ];
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function visa()
    {
        return $this->belongsTo(Visa::class);
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
