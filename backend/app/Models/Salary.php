<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Salary extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'year',
        'month',
        'basic_salary',
        'allowances',
        'overtime',
        'deductions',
        'advance_deduction',
        'fine_deduction',
        'net_salary',
        'status',
        'payment_date',
        'payment_method',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'month' => 'integer',
            'basic_salary' => 'decimal:2',
            'allowances' => 'decimal:2',
            'overtime' => 'decimal:2',
            'deductions' => 'decimal:2',
            'advance_deduction' => 'decimal:2',
            'fine_deduction' => 'decimal:2',
            'net_salary' => 'decimal:2',
            'payment_date' => 'date',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            $model->net_salary = $model->basic_salary
                + $model->allowances
                + $model->overtime
                - $model->deductions
                - $model->advance_deduction
                - $model->fine_deduction;
        });
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function deductedAdvances()
    {
        return $this->hasMany(SalaryAdvance::class, 'deducted_from_salary_id');
    }

    public function getMonthNameAttribute(): string
    {
        return date('F', mktime(0, 0, 0, $this->month, 1));
    }

    public function getPeriodAttribute(): string
    {
        return $this->month_name . ' ' . $this->year;
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopePaid($query)
    {
        return $query->where('status', 'paid');
    }
}
