<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vendor extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'contact_person',
        'phone',
        'email',
        'address',
        'type',
        'notes',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function spareParts()
    {
        return $this->hasMany(SparePart::class);
    }

    public function maintenanceLogs()
    {
        return $this->hasMany(MaintenanceLog::class);
    }

    public function expenses()
    {
        return $this->hasMany(Expense::class);
    }

    public function cheques()
    {
        return $this->hasMany(Cheque::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
