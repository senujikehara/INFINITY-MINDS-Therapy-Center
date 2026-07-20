<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\ChildController;
use App\Http\Controllers\API\ReportController;
use App\Http\Controllers\API\SessionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Authenticated routes
Route::middleware('auth:sanctum')->group(function () {
    
    // Auth profile actions
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'profile']);

    /*
    |--------------------------------------------------------------------------
    | Children Management Module
    |--------------------------------------------------------------------------
    */
    // Register new children (restricted to Admin, Super Admin)
    Route::post('/children', [ChildController::class, 'store'])
         ->middleware('role:super_admin,admin');

    // Retrieve sensitive IC details (restricted to Admin, Super Admin)
    Route::get('/children/{id}/sensitive', [ChildController::class, 'getSensitiveData'])
         ->middleware('role:super_admin,admin');

    // Health records access: Admin, Trainer, and Parent
    Route::get('/children/{id}/health', [ChildController::class, 'getHealthInfo'])
         ->middleware('role:super_admin,admin,trainer,parent');
         
    Route::put('/children/{id}/health', [ChildController::class, 'updateHealthInfo'])
         ->middleware('role:super_admin,admin,trainer,parent');

    /*
    |--------------------------------------------------------------------------
    | Reporting Module
    |--------------------------------------------------------------------------
    */
    // Progress Reports: Trainers create & view
    Route::post('/reports/progress', [ReportController::class, 'storeProgressReport'])
         ->middleware('role:super_admin,trainer');

    // Behavior Reports: Trainer submits review
    Route::post('/reports/behavior', [ReportController::class, 'storeBehaviorReport'])
         ->middleware('role:super_admin,trainer');

    // Behavior Review: Principal authorizes report (Principal exclusive, Super Admin allowed)
    Route::put('/reports/behavior/{id}/review', [ReportController::class, 'reviewBehaviorReport'])
         ->middleware('role:super_admin,principal');

    // PDF Download: All authorized roles can request PDFs
    Route::get('/reports/{id}/pdf', [ReportController::class, 'downloadPdf'])
         ->middleware('role:super_admin,admin,principal,trainer,parent');

    /*
    |--------------------------------------------------------------------------
    | Scheduling & Timetable Module
    |--------------------------------------------------------------------------
    */
    // Manage sessions: Trainers, Admins, Super Admins
    Route::get('/sessions', [SessionController::class, 'index']);
    Route::post('/sessions', [SessionController::class, 'store'])
         ->middleware('role:super_admin,trainer');
    Route::put('/sessions/{id}', [SessionController::class, 'update'])
         ->middleware('role:super_admin,trainer');
    Route::post('/sessions/{id}/attendance', [SessionController::class, 'markAttendance'])
         ->middleware('role:super_admin,trainer');
});
