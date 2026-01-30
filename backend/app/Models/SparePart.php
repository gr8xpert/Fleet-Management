<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SparePart extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'part_number',
        'category',
        'description',
        'quantity',
        'min_quantity',
        'unit_price',
        'location',
        'vendor_id',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'min_quantity' => 'integer',
            'unit_price' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    public function vendor()
    {
        return $this->belongsTo(Vendor::class);
    }

    public function logs()
    {
        return $this->hasMany(SparePartLog::class);
    }

    public function isLowStock(): bool
    {
        return $this->quantity <= $this->min_quantity;
    }

    public function scopeLowStock($query)
    {
        return $query->whereColumn('quantity', '<=', 'min_quantity');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
