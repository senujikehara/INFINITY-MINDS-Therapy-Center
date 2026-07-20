<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChildHealthInfo extends Model
{
    protected $table = 'children_health_info';

    protected $fillable = [
        'child_id',
        'allergies',
        'medical_conditions',
        'special_needs',
        'emergency_contact_name',
        'emergency_contact_phone',
        'notes',
        'updated_by',
    ];

    public function child()
    {
        return $this->belongsTo(Child::class);
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
