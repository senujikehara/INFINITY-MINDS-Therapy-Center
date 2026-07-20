<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChildSensitiveData extends Model
{
    protected $table = 'children_sensitive_data';

    protected $fillable = [
        'child_id',
        'ic_number',
        'guardian_ic',
        'home_address',
        'application_form_path',
        'id_document_paths',
        'encrypted_at',
        'updated_by',
    ];

    protected $casts = [
        'ic_number' => 'encrypted',
        'guardian_ic' => 'encrypted',
        'id_document_paths' => 'array',
        'encrypted_at' => 'datetime',
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
