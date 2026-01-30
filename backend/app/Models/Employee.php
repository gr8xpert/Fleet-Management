<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Crypt;

class Employee extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'employee_id',
        'name',
        'name_arabic',
        'type',
        'nationality',
        'passport_number',
        'passport_expiry',
        'emirates_id',
        'emirates_id_expiry',
        'license_number',
        'license_expiry',
        'phone',
        'phone_alternate',
        'address',
        'join_date',
        'basic_salary',
        'salary_card_number',
        'salary_card_pin_encrypted',
        'bank_name',
        'bank_account',
        'status',
        'photo',
        'notes',
    ];

    protected $hidden = [
        'salary_card_pin_encrypted',
    ];

    protected function casts(): array
    {
        return [
            'passport_expiry' => 'date',
            'emirates_id_expiry' => 'date',
            'license_expiry' => 'date',
            'join_date' => 'date',
            'basic_salary' => 'decimal:2',
        ];
    }

    public function setSalaryCardPinEncryptedAttribute($value)
    {
        $this->attributes['salary_card_pin_encrypted'] = $value ? Crypt::encryptString($value) : null;
    }

    public function getDecryptedPin(): ?string
    {
        return $this->salary_card_pin_encrypted
            ? Crypt::decryptString($this->salary_card_pin_encrypted)
            : null;
    }

    public function visas()
    {
        return $this->hasMany(Visa::class);
    }

    public function currentVisa()
    {
        return $this->hasOne(Visa::class)
            ->where('status', 'active')
            ->latest('expiry_date');
    }

    public function visaApplications()
    {
        return $this->hasMany(VisaApplication::class);
    }

    public function salaries()
    {
        return $this->hasMany(Salary::class);
    }

    public function advances()
    {
        return $this->hasMany(SalaryAdvance::class);
    }

    public function fines()
    {
        return $this->hasMany(Fine::class, 'driver_id');
    }

    public function attendance()
    {
        return $this->hasMany(EmployeeAttendance::class);
    }

    public function leaves()
    {
        return $this->hasMany(EmployeeLeave::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeDrivers($query)
    {
        return $query->where('type', 'driver');
    }

    public function scopeWithExpiringDocuments($query, $days = 30)
    {
        return $query->where(function ($q) use ($days) {
            $q->whereBetween('passport_expiry', [now(), now()->addDays($days)])
                ->orWhereBetween('emirates_id_expiry', [now(), now()->addDays($days)])
                ->orWhereBetween('license_expiry', [now(), now()->addDays($days)]);
        });
    }
}
