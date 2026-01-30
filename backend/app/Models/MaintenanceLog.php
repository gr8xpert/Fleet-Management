<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaintenanceLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'type',
        'service_date',
        'km_at_service',
        'next_service_km',
        'next_service_date',
        'description',
        'parts_cost',
        'labor_cost',
        'total_cost',
        'vendor_id',
        'status',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'service_date' => 'date',
            'next_service_date' => 'date',
            'km_at_service' => 'integer',
            'next_service_km' => 'integer',
            'parts_cost' => 'decimal:2',
            'labor_cost' => 'decimal:2',
            'total_cost' => 'decimal:2',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($model) {
            $model->total_cost = $model->parts_cost + $model->labor_cost;
        });
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled')
            ->where('next_service_date', '>=', now());
    }

    public function scopeDue($query)
    {
        return $query->where('status', 'scheduled')
            ->where(function ($q) {
                $q->where('next_service_date', '<=', now())
                    ->orWhereRaw('next_service_km <= (SELECT current_km FROM vehicles WHERE vehicles.id = maintenance_logs.vehicle_id)');
            });
    }
}
