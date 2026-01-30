<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisaApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'application_type',
        'application_date',
        'expected_completion',
        'status',
        'fees_paid',
        'documents_submitted',
        'notes',
        'completion_date',
    ];

    protected function casts(): array
    {
        return [
            'application_date' => 'date',
            'expected_completion' => 'date',
            'completion_date' => 'date',
            'fees_paid' => 'decimal:2',
        ];
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['submitted', 'processing']);
    }
}
