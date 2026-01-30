<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalaryAdvance extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'amount',
        'advance_date',
        'reason',
        'status',
        'deducted_from_salary_id',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'advance_date' => 'date',
        ];
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function deductedFromSalary()
    {
        return $this->belongsTo(Salary::class, 'deducted_from_salary_id');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
