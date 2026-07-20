<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BehaviorReport extends Model
{
    protected $fillable = [
        'child_id',
        'trainer_id',
        'report_date',
        'positive_notes',
        'negative_notes',
        'status', // 'pending_review', 'authorized', 'rejected'
        'principal_id',
        'principal_comment',
        'authorized_at',
        'visibility', // 'private', 'public'
    ];

    protected $casts = [
        'report_date' => 'date',
        'authorized_at' => 'datetime',
    ];

    public function child()
    {
        return $this->belongsTo(Child::class);
    }

    public function trainer()
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }

    public function principal()
    {
        return $this->belongsTo(User::class, 'principal_id');
    }

    // Helper check for parent view visibility
    public function isVisibleToParent(): bool
    {
        return $this->status === 'authorized' && $this->visibility === 'public';
    }
}
