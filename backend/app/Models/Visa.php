<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Visa extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'visa_number',
        'uid_number',
        'visa_type',
        'issue_date',
        'expiry_date',
        'status',
        'sponsor_name',
        'visa_cost',
        'file_path',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'issue_date' => 'date',
            'expiry_date' => 'date',
            'visa_cost' => 'decimal:2',
        ];
    }

    public function employee()
    {
        return $this->belongsTo(Employee::class);
    }

    public function fines()
    {
        return $this->hasMany(VisaFine::class);
    }

    public function isExpired(): bool
    {
        return $this->expiry_date->isPast();
    }

    public function isExpiringSoon($days = 30): bool
    {
        return $this->expiry_date->isBetween(now(), now()->addDays($days));
    }

    public function daysUntilExpiry(): int
    {
        return now()->diffInDays($this->expiry_date, false);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeExpiring($query, $days = 30)
    {
        return $query->where('status', 'active')
            ->whereBetween('expiry_date', [now(), now()->addDays((int) $days)]);
    }

    public function scopeExpired($query)
    {
        return $query->where('expiry_date', '<', now());
    }
}
