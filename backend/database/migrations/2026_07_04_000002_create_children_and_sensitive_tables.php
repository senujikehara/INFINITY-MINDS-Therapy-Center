<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Children Table
        Schema::create('children', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');
            $table->foreignId('therapy_type_id')->nullable(); // Set in next migration/seeder
            $table->string('full_name');
            $table->date('dob');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->string('photo_path')->nullable();
            $table->date('enrollment_date');
            $table->enum('status', ['active', 'inactive', 'graduated'])->default('active');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // 2. Children Sensitive Data Table
        // Separate table, restricted to Admin and Super Admin roles.
        Schema::create('children_sensitive_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_id')->constrained('children')->onDelete('cascade');
            $table->text('ic_number'); // Store as encrypted string
            $table->text('guardian_ic'); // Store as encrypted string
            $table->text('home_address')->nullable();
            $table->string('application_form_path')->nullable();
            $table->json('id_document_paths')->nullable(); // Store JSON array of file paths
            $table->timestamp('encrypted_at')->nullable();
            $table->foreignId('updated_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // 3. Children Health Info Table
        // Health info is visible to Trainer, Parent, and Admin.
        Schema::create('children_health_info', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_id')->constrained('children')->onDelete('cascade');
            $table->text('allergies')->nullable();
            $table->text('medical_conditions')->nullable();
            $table->text('special_needs')->nullable();
            $table->string('emergency_contact_name');
            $table->string('emergency_contact_phone');
            $table->text('notes')->nullable();
            $table->foreignId('updated_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // 4. Parent-Child Links Table (Many-to-Many relationship)
        Schema::create('parent_child_links', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('child_id')->constrained('children')->onDelete('cascade');
            $table->string('relationship'); // 'mother', 'father', 'guardian'
            $table->timestamps();
            
            $table->unique(['parent_user_id', 'child_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('parent_child_links');
        Schema::dropIfExists('children_health_info');
        Schema::dropIfExists('children_sensitive_data');
        Schema::dropIfExists('children');
    }
};
