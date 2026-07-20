<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Session extends Model
{
    protected $fillable = [
        'branch_id',
        'child_id',
        'trainer_id',
        'therapy_type_id',
        'session_date',
        'start_time',
        'end_time',
        'is_recurring',
        'recurrence_rule',
        'parent_session_id',
        'status',
        'created_by',
    ];

    protected $casts = [
        'is_recurring' => 'boolean',
        'session_date' => 'date',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function child()
    {
        return $this->belongsTo(Child::class);
    }

    public function trainer()
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }

    public function therapyType()
    {
        return $this->belongsTo(TherapyType::class);
    }

    public function attendance()
    {
        return $this->hasOne(Attendance::class);
    }

    // Replacement relations (self-join)
    public function originalSession()
    {
        return $this->belongsTo(Session::class, 'parent_session_id');
    }

    public function replacementSessions()
    {
        return $this->hasMany(Session::class, 'parent_session_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
