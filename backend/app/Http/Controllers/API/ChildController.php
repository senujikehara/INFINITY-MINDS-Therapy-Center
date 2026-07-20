<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Child;
use App\Models\ChildSensitiveData;
use App\Models\ChildHealthInfo;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ChildController extends Controller
{
    /**
     * Create child (Super Admin, Admin).
     */
    public function store(Request $request)
    {
        $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'therapy_type_id' => 'nullable|exists:therapy_types,id',
            'full_name' => 'required|string|max:255',
            'dob' => 'required|date',
            'gender' => 'required|in:male,female,other',
            'photo_path' => 'nullable|string',
            'enrollment_date' => 'required|date',
            
            // Sensitive fields (passed securely to sub-table)
            'ic_number' => 'required|string',
            'guardian_ic' => 'required|string',
            'home_address' => 'required|string',
            'application_form_path' => 'nullable|string',
            
            // Health fields
            'allergies' => 'nullable|string',
            'medical_conditions' => 'nullable|string',
            'special_needs' => 'nullable|string',
            'emergency_contact_name' => 'required|string',
            'emergency_contact_phone' => 'required|string',
        ]);

        // 1. Create Child Record
        $child = Child::create([
            'branch_id' => $request->branch_id,
            'therapy_type_id' => $request->therapy_type_id,
            'full_name' => $request->full_name,
            'dob' => $request->dob,
            'gender' => $request->gender,
            'photo_path' => $request->photo_path,
            'enrollment_date' => $request->enrollment_date,
            'status' => 'active',
            'created_by' => $request->user()->id,
        ]);

        // 2. Create Sensitive Data Record (AES-encrypted in model cast)
        ChildSensitiveData::create([
            'child_id' => $child->id,
            'ic_number' => $request->ic_number,
            'guardian_ic' => $request->guardian_ic,
            'home_address' => $request->home_address,
            'application_form_path' => $request->application_form_path,
            'updated_by' => $request->user()->id,
        ]);

        // 3. Create Health Info Record
        ChildHealthInfo::create([
            'child_id' => $child->id,
            'allergies' => $request->allergies,
            'medical_conditions' => $request->medical_conditions,
            'special_needs' => $request->special_needs,
            'emergency_contact_name' => $request->emergency_contact_name,
            'emergency_contact_phone' => $request->emergency_contact_phone,
            'updated_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Child registered successfully.',
            'child' => $child
        ], Response::HTTP_CREATED);
    }

    /**
     * View Child Sensitive Info (Only Super Admin, Admin).
     */
    public function getSensitiveData($id, Request $request)
    {
        $child = Child::findOrFail($id);
        
        // Force audit logging for sensitive data retrieval
        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'view_child_sensitive_data',
            'table_name' => 'children_sensitive_data',
            'record_id' => $child->id,
            'ip_address' => $request->ip(),
        ]);

        $sensitive = $child->sensitiveData;

        return response()->json([
            'child_id' => $child->id,
            'ic_number' => $sensitive->ic_number,       // auto-decrypted by Laravel model cast
            'guardian_ic' => $sensitive->guardian_ic,   // auto-decrypted
            'home_address' => $sensitive->home_address,
            'application_form_path' => $sensitive->application_form_path,
            'id_document_paths' => $sensitive->id_document_paths,
        ]);
    }

    /**
     * View Child Health Info (Visible to Admin, Trainer, Parent).
     */
    public function getHealthInfo($id, Request $request)
    {
        $child = Child::findOrFail($id);
        
        // Check if Parent role is attempting to access a child that isn't theirs
        if ($request->user()->hasRole('parent')) {
            $isLinked = $request->user()->children()->where('child_id', $child->id)->exists();
            if (!$isLinked) {
                return response()->json(['message' => 'Unauthorized access to child health records.'], Response::HTTP_FORBIDDEN);
            }
        }

        $health = $child->healthInfo;

        return response()->json([
            'child_id' => $child->id,
            'allergies' => $health->allergies,
            'medical_conditions' => $health->medical_conditions,
            'special_needs' => $health->special_needs,
            'emergency_contact_name' => $health->emergency_contact_name,
            'emergency_contact_phone' => $health->emergency_contact_phone,
            'notes' => $health->notes,
        ]);
    }

    /**
     * Edit Child Health Info (Trainer, Parent, Admin).
     */
    public function updateHealthInfo(Request $request, $id)
    {
        $child = Child::findOrFail($id);

        if ($request->user()->hasRole('parent')) {
            $isLinked = $request->user()->children()->where('child_id', $child->id)->exists();
            if (!$isLinked) {
                return response()->json(['message' => 'Unauthorized.'], Response::HTTP_FORBIDDEN);
            }
        }

        $request->validate([
            'allergies' => 'nullable|string',
            'medical_conditions' => 'nullable|string',
            'special_needs' => 'nullable|string',
            'emergency_contact_name' => 'required|string',
            'emergency_contact_phone' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $health = $child->healthInfo;
        $health->update([
            'allergies' => $request->allergies,
            'medical_conditions' => $request->medical_conditions,
            'special_needs' => $request->special_needs,
            'emergency_contact_name' => $request->emergency_contact_name,
            'emergency_contact_phone' => $request->emergency_contact_phone,
            'notes' => $request->notes,
            'updated_by' => $request->user()->id,
        ]);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'update_child_health_info',
            'table_name' => 'children_health_info',
            'record_id' => $health->id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Child health information updated successfully.',
            'data' => $health
        ]);
    }
}
