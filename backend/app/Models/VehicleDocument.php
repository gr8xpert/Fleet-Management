<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'document_type',
        'document_number',
        'issue_date',
        'expiry_date',
        'cost',
        'file_path',
        'notes',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'issue_date' => 'date',
            'expiry_date' => 'date',
            'cost' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
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

    public function scopeExpiring($query, $days = 30)
    {
        return $query->where('is_active', true)
            ->whereBetween('expiry_date', [now(), now()->addDays((int) $days)]);
    }

    public function scopeExpired($query)
    {
        return $query->where('is_active', true)
            ->where('expiry_date', '<', now());
    }
}
