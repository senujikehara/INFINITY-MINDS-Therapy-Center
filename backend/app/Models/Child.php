<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Child extends Model
{
    protected $fillable = [
        'branch_id',
        'therapy_type_id',
        'full_name',
        'dob',
        'gender',
        'photo_path',
        'enrollment_date',
        'status',
        'created_by',
    ];

    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }

    public function therapyType()
    {
        return $this->belongsTo(TherapyType::class);
    }

    public function sensitiveData()
    {
        return $this->hasOne(ChildSensitiveData::class);
    }

    public function healthInfo()
    {
        return $this->hasOne(ChildHealthInfo::class);
    }

    public function parents()
    {
        return $this->belongsToMany(User::class, 'parent_child_links', 'child_id', 'parent_user_id')
                    ->withPivot('relationship')
                    ->withTimestamps();
    }

    public function sessions()
    {
        return $this->hasMany(Session::class);
    }

    public function progressReports()
    {
        return $this->hasMany(ProgressReport::class);
    }

    public function behaviorReports()
    {
        return $this->hasMany(BehaviorReport::class);
    }
}
