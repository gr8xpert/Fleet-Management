<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Vehicle extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'bus_number',
        'plate_number',
        'plate_code',
        'chassis_number',
        'engine_number',
        'type',
        'make',
        'model',
        'year',
        'seating_capacity',
        'color',
        'owner_name',
        'owner_contact',
        'purchase_date',
        'purchase_price',
        'status',
        'current_km',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'purchase_date' => 'date',
            'purchase_price' => 'decimal:2',
            'current_km' => 'integer',
            'year' => 'integer',
            'seating_capacity' => 'integer',
        ];
    }

    public function documents()
    {
        return $this->hasMany(VehicleDocument::class);
    }

    public function mulkiya()
    {
        return $this->hasOne(VehicleDocument::class)
            ->where('document_type', 'mulkiya')
            ->where('is_active', true)
            ->latest('expiry_date');
    }

    public function insurance()
    {
        return $this->hasOne(VehicleDocument::class)
            ->where('document_type', 'insurance')
            ->where('is_active', true)
            ->latest('expiry_date');
    }

    public function transfers()
    {
        return $this->hasMany(VehicleTransfer::class);
    }

    public function maintenanceLogs()
    {
        return $this->hasMany(MaintenanceLog::class);
    }

    public function fines()
    {
        return $this->hasMany(Fine::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    public function income()
    {
        return $this->hasMany(Income::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeWithExpiringDocuments($query, $days = 30)
    {
        return $query->whereHas('documents', function ($q) use ($days) {
            $q->where('is_active', true)
                ->whereBetween('expiry_date', [now(), now()->addDays($days)]);
        });
    }
}
