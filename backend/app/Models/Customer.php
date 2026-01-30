<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'company_name',
        'contact_person',
        'email',
        'phone',
        'phone_alternate',
        'address',
        'trn_number',
        'type',
        'credit_limit',
        'payment_terms',
        'is_active',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'credit_limit' => 'decimal:2',
            'payment_terms' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function income()
    {
        return $this->hasMany(Income::class);
    }

    public function cheques()
    {
        return $this->hasMany(Cheque::class);
    }

    public function getTotalRevenueAttribute(): float
    {
        return $this->income()->sum('amount');
    }

    public function getOutstandingAmountAttribute(): float
    {
        return $this->income()
            ->whereIn('status', ['pending', 'partial'])
            ->sum('amount');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
