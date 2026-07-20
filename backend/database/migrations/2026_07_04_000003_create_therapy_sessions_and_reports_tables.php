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
        // 1. Therapy Types Table
        Schema::create('therapy_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('color_tag', 7)->default('#8B5CF6'); // hex color code (e.g. #8B5CF6 for Speech, etc)
            $table->timestamps();
        });

        // Add foreign key constraint to children table created in previous migration
        Schema::table('children', function (Blueprint $table) {
            $table->foreign('therapy_type_id')->references('id')->on('therapy_types')->onDelete('set null');
        });

        // 2. Sessions Table
        Schema::create('sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');
            $table->foreignId('child_id')->constrained('children')->onDelete('cascade');
            $table->foreignId('trainer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('therapy_type_id')->constrained('therapy_types')->onDelete('cascade');
            $table->dateTime('session_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_recurring')->default(false);
            $table->string('recurrence_rule')->nullable(); // e.g. "WEEKLY"
            $table->foreignId('parent_session_id')->nullable()->constrained('sessions')->onDelete('set null'); // links replacement session to original
            $table->enum('status', ['scheduled', 'completed', 'cancelled', 'replaced'])->default('scheduled');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // 3. Attendance Table
        Schema::create('attendance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('sessions')->onDelete('cascade');
            $table->time('check_in_time')->nullable();
            $table->time('check_out_time')->nullable();
            $table->foreignId('marked_by_trainer_id')->constrained('users')->onDelete('cascade');
            $table->string('marked_via')->default('mobile_app');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 4. Progress Reports Table
        Schema::create('progress_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_id')->constrained('children')->onDelete('cascade');
            $table->foreignId('trainer_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('session_id')->nullable()->constrained('sessions')->onDelete('set null');
            $table->date('report_date');
            $table->text('notes');
            $table->json('media_links')->nullable(); // JSON array of file paths / Drive-style links
            $table->boolean('visible_to_parent')->default(true);
            $table->timestamps();
        });

        // 5. Behavior Reports Table
        Schema::create('behavior_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_id')->constrained('children')->onDelete('cascade');
            $table->foreignId('trainer_id')->constrained('users')->onDelete('cascade');
            $table->date('report_date');
            $table->text('positive_notes')->nullable();
            $table->text('negative_notes')->nullable();
            $table->enum('status', ['pending_review', 'authorized', 'rejected'])->default('pending_review');
            $table->foreignId('principal_id')->nullable()->constrained('users')->onDelete('set null');
            $table->text('principal_comment')->nullable();
            $table->timestamp('authorized_at')->nullable();
            $table->enum('visibility', ['private', 'public'])->default('private'); // visible to parents only when public
            $table->timestamps();
        });

        // 6. Media Files Table (polymorphic file tracking)
        Schema::create('media_files', function (Blueprint $table) {
            $table->id();
            $table->string('owner_type'); // 'progress_report', 'behavior_report', 'child_document'
            $table->unsignedBigInteger('owner_id');
            $table->string('file_path');
            $table->string('file_type'); // 'image', 'video', 'document'
            $table->integer('file_size_kb');
            $table->foreignId('uploaded_by')->constrained('users')->onDelete('cascade');
            $table->timestamp('uploaded_at')->useCurrent();
        });

        // 7. PDF Reports Table
        Schema::create('pdf_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('child_id')->constrained('children')->onDelete('cascade');
            $table->string('report_type'); // 'progress', 'behavior'
            $table->foreignId('generated_by_user_id')->constrained('users')->onDelete('cascade'); // Auditing only (hidden from template)
            $table->string('file_path');
            $table->timestamp('generated_at')->useCurrent();
        });

        // 8. Academic Calendar Events Table
        Schema::create('academic_calendar_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('event_date');
            $table->enum('event_type', ['holiday', 'notice', 'semester_break'])->default('notice');
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        // 9. Todos Table
        Schema::create('todos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('due_date')->nullable();
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium');
            $table->enum('status', ['pending', 'done'])->default('pending');
            $table->timestamps();
        });

        // 10. Notifications Table
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('message');
            $table->string('type'); // 'reminder', 'report_published', 'cancellation'
            $table->boolean('is_read')->default(false);
            $table->timestamps();
        });

        // 11. Audit Logs Table
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('action'); // 'view_ic', 'edit_health', 'authorize_report'
            $table->string('table_name');
            $table->unsignedBigInteger('record_id')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('children', function (Blueprint $table) {
            $table->dropForeign(['therapy_type_id']);
        });
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('todos');
        Schema::dropIfExists('academic_calendar_events');
        Schema::dropIfExists('pdf_reports');
        Schema::dropIfExists('media_files');
        Schema::dropIfExists('behavior_reports');
        Schema::dropIfExists('progress_reports');
        Schema::dropIfExists('attendance');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('therapy_types');
    }
};
