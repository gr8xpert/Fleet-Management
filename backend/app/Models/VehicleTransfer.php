<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleTransfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'from_owner',
        'to_owner',
        'transfer_date',
        'transfer_amount',
        'old_plate_number',
        'new_plate_number',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'transfer_date' => 'date',
            'transfer_amount' => 'decimal:2',
        ];
    }

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
