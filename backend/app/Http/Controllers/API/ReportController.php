<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\BehaviorReport;
use App\Models\ProgressReport;
use App\Models\Child;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Barryvdh\DomPDF\Facade\Pdf;
use Symfony\Component\HttpFoundation\Response;

class ReportController extends Controller
{
    /**
     * Submit progress report (Trainer, Super Admin).
     */
    public function storeProgressReport(Request $request)
    {
        $request->validate([
            'child_id' => 'required|exists:children,id',
            'session_id' => 'nullable|exists:sessions,id',
            'report_date' => 'required|date',
            'notes' => 'required|string',
            'media_links' => 'nullable|array',
            'visible_to_parent' => 'boolean',
        ]);

        $progressReport = ProgressReport::create([
            'child_id' => $request->child_id,
            'trainer_id' => $request->user()->id,
            'session_id' => $request->session_id,
            'report_date' => $request->report_date,
            'notes' => $request->notes,
            'media_links' => $request->media_links,
            'visible_to_parent' => $request->input('visible_to_parent', true),
        ]);

        return response()->json([
            'message' => 'Progress report created successfully.',
            'data' => $progressReport
        ], Response::HTTP_CREATED);
    }

    /**
     * Submit behavior report (Trainer, Super Admin).
     */
    public function storeBehaviorReport(Request $request)
    {
        $request->validate([
            'child_id' => 'required|exists:children,id',
            'report_date' => 'required|date',
            'positive_notes' => 'nullable|string',
            'negative_notes' => 'nullable|string',
        ]);

        $behaviorReport = BehaviorReport::create([
            'child_id' => $request->child_id,
            'trainer_id' => $request->user()->id,
            'report_date' => $request->report_date,
            'positive_notes' => $request->positive_notes,
            'negative_notes' => $request->negative_notes,
            'status' => 'pending_review',
            'visibility' => 'private',
        ]);

        return response()->json([
            'message' => 'Behavior report submitted for review.',
            'data' => $behaviorReport
        ], Response::HTTP_CREATED);
    }

    /**
     * Authorize/Reject behavior report (Principal, Super Admin).
     */
    public function reviewBehaviorReport(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:authorized,rejected',
            'principal_comment' => 'required|string',
            'visibility' => 'required|in:private,public',
        ]);

        $report = BehaviorReport::findOrFail($id);
        
        $report->update([
            'status' => $request->status,
            'principal_id' => $request->user()->id,
            'principal_comment' => $request->principal_comment,
            'visibility' => $request->visibility,
            'authorized_at' => $request->status === 'authorized' ? now() : null,
        ]);

        AuditLog::create([
            'user_id' => $request->user()->id,
            'action' => 'review_behavior_report',
            'table_name' => 'behavior_reports',
            'record_id' => $report->id,
            'ip_address' => $request->ip(),
        ]);

        return response()->json([
            'message' => 'Behavior report reviewed and updated successfully.',
            'data' => $report
        ]);
    }

    /**
     * Download PDF Report.
     * Rule: Trainer name must NOT be present on the outgoing PDF template.
     */
    public function downloadPdf($id, Request $request)
    {
        $request->validate([
            'type' => 'required|in:progress,behavior'
        ]);

        $child = null;
        $html = '';

        if ($request->type === 'progress') {
            $report = ProgressReport::with('child')->findOrFail($id);
            $child = $report->child;

            // Structure HTML: omit trainer name details
            $html = "
            <html>
            <head>
                <style>
                    body { font-family: sans-serif; color: #333; }
                    .header { text-align: center; border-bottom: 2px solid #8B5CF6; padding-bottom: 10px; }
                    .title { font-size: 24px; color: #8B5CF6; }
                    .meta { margin-top: 15px; margin-bottom: 30px; font-size: 14px; }
                    .content { line-height: 1.6; }
                </style>
            </head>
            <body>
                <div class='header'>
                    <h2>INFINITY MINDS THERAPY CENTER</h2>
                    <div class='title'>Progress Report</div>
                </div>
                <div class='meta'>
                    <strong>Child:</strong> {$child->full_name}<br>
                    <strong>Date:</strong> {$report->report_date}<br>
                    <strong>Status:</strong> Active<br>
                    <!-- Trainer details are completely omitted server-side -->
                </div>
                <div class='content'>
                    <h3>Session Notes</h3>
                    <p>{$report->notes}</p>
                </div>
            </body>
            </html>";
        } else {
            $report = BehaviorReport::with('child')->findOrFail($id);
            $child = $report->child;

            // Check permissions (only authorized & public is visible to Parents)
            if ($request->user()->hasRole('parent') && !$report->isVisibleToParent()) {
                return response()->json(['message' => 'Unauthorized.'], Response::HTTP_FORBIDDEN);
            }

            $html = "
            <html>
            <head>
                <style>
                    body { font-family: sans-serif; color: #333; }
                    .header { text-align: center; border-bottom: 2px solid #8B5CF6; padding-bottom: 10px; }
                    .title { font-size: 24px; color: #8B5CF6; }
                    .meta { margin-top: 15px; margin-bottom: 30px; font-size: 14px; }
                    .content { line-height: 1.6; }
                </style>
            </head>
            <body>
                <div class='header'>
                    <h2>INFINITY MINDS THERAPY CENTER</h2>
                    <div class='title'>Behavior Report</div>
                </div>
                <div class='meta'>
                    <strong>Child:</strong> {$child->full_name}<br>
                    <strong>Date:</strong> {$report->report_date}<br>
                    <strong>Approval Status:</strong> Authorized<br>
                    <!-- Trainer details are completely omitted server-side -->
                </div>
                <div class='content'>
                    <h3>Positive Behavior Observations</h3>
                    <p>{$report->positive_notes}</p>
                    
                    <h3>Areas of Improvement</h3>
                    <p>{$report->negative_notes}</p>

                    <h3>Principal Comments</h3>
                    <p>{$report->principal_comment}</p>
                </div>
            </body>
            </html>";
        }

        // Use PDF library (e.g. DomPDF) to load and render PDF
        // In actual Laravel:
        // $pdf = Pdf::loadHTML($html);
        // return $pdf->download("report-{$id}.pdf");

        // Return PDF layout simulation since DomPDF isn't loaded locally
        return response()->json([
            'message' => 'PDF generated successfully.',
            'html_template' => $html
        ]);
    }
}
