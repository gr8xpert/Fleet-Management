<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Alert extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'message',
        'type',
        'priority',
        'alertable_type',
        'alertable_id',
        'due_date',
        'days_before',
        'is_read',
        'is_sent',
        'sent_at',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'days_before' => 'integer',
            'is_read' => 'boolean',
            'is_sent' => 'boolean',
            'sent_at' => 'datetime',
        ];
    }

    public function alertable()
    {
        return $this->morphTo();
    }

    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }

    public function scopeUnsent($query)
    {
        return $query->where('is_sent', false);
    }

    public function scopeByPriority($query, $priority)
    {
        return $query->where('priority', $priority);
    }

    public function scopeUrgent($query)
    {
        return $query->whereIn('priority', ['high', 'urgent']);
    }
}
