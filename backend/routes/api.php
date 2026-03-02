<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Organization routes (public - for creating org during setup)
Route::post('organizations', [App\Http\Controllers\Api\OrganizationController::class, 'store']);

// Public auth routes
Route::post('login', [App\Http\Controllers\Api\AuthController::class, 'login']);
Route::post('register', [App\Http\Controllers\Api\AuthController::class, 'register']);

// Auth routes - require authentication for all other routes
Route::middleware('auth:sanctum')->group(function () {
    // User & Organization
    Route::get('user', function (Request $request) {
        return $request->user();
    });
    
    // User Profile
    Route::get('user/profile', [App\Http\Controllers\Api\UserController::class, 'profile']);
    Route::put('user/profile', [App\Http\Controllers\Api\UserController::class, 'updateProfile']);
    
    // Organization management
    Route::get('organization/current', [App\Http\Controllers\Api\OrganizationController::class, 'current']);
    Route::put('organization', [App\Http\Controllers\Api\OrganizationController::class, 'update']);
    Route::get('organization/users', [App\Http\Controllers\Api\OrganizationController::class, 'users']);
    Route::post('organization/users/invite', [App\Http\Controllers\Api\OrganizationController::class, 'inviteUser']);
    Route::put('organization/users/{user}/role', [App\Http\Controllers\Api\OrganizationController::class, 'updateUserRole']);
    Route::delete('organization/users/{user}', [App\Http\Controllers\Api\OrganizationController::class, 'removeUser']);

    // Logout
    Route::post('logout', function (Request $request) {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['success' => true]);
    });

    // Campaigns
Route::apiResource('campaigns', App\Http\Controllers\Api\CampaignController::class);

// Sales Orders
Route::apiResource('sales-orders', App\Http\Controllers\Api\SalesOrderController::class);

// Purchase Orders
Route::apiResource('purchase-orders', App\Http\Controllers\Api\PurchaseOrderController::class);

// Contracts
Route::apiResource('contracts', App\Http\Controllers\Api\ContractController::class);
Route::post('contracts/{contract}/send-for-signature', [App\Http\Controllers\Api\ContractController::class, 'sendForSignature']);
Route::post('contracts/{contract}/sign', [App\Http\Controllers\Api\ContractController::class, 'sign']);

// Products
Route::apiResource('products', App\Http\Controllers\Api\ProductController::class);

// Workflow Automation
Route::apiResource('workflows', App\Http\Controllers\Api\WorkflowController::class);
Route::post('workflows/{workflow}/activate', [App\Http\Controllers\Api\WorkflowController::class, 'activate']);
Route::post('workflows/{workflow}/deactivate', [App\Http\Controllers\Api\WorkflowController::class, 'deactivate']);

// Email Templates
Route::apiResource('email-templates', App\Http\Controllers\Api\EmailTemplateController::class);
Route::post('email-templates/{id}/preview', [App\Http\Controllers\Api\EmailTemplateController::class, 'preview']);
Route::post('email-templates/{id}/duplicate', [App\Http\Controllers\Api\EmailTemplateController::class, 'duplicate']);

// Email Sending
Route::post('email/send', [App\Http\Controllers\Api\EmailController::class, 'send']);
Route::get('email/history', [App\Http\Controllers\Api\EmailController::class, 'history']);
Route::post('contacts/{id}/send-email', [App\Http\Controllers\Api\EmailController::class, 'sendToContact']);

// Contacts
Route::apiResource('contacts', App\Http\Controllers\Api\ContactController::class);

// Contact Sync from External API (Chale App)
Route::get('contacts/sync/status', [App\Http\Controllers\Api\ContactSyncController::class, 'status']);
Route::post('contacts/sync', [App\Http\Controllers\Api\ContactSyncController::class, 'sync']);

// Companies
Route::apiResource('companies', App\Http\Controllers\Api\CompanyController::class);

// Document Templates
Route::apiResource('document-templates', App\Http\Controllers\Api\DocumentTemplateController::class);
Route::post('document-templates/{template}/generate', [App\Http\Controllers\Api\DocumentTemplateController::class, 'generate']);

// Telephony
Route::apiResource('calls', App\Http\Controllers\Api\CallController::class);
Route::post('calls/{call}/record', [App\Http\Controllers\Api\CallController::class, 'record']);
Route::get('calls/{call}/recording', [App\Http\Controllers\Api\CallController::class, 'getRecording']);

// Social Media
Route::apiResource('social-posts', App\Http\Controllers\Api\SocialPostController::class);
Route::post('social-posts/{post}/publish', [App\Http\Controllers\Api\SocialPostController::class, 'publish']);

// Analytics & Reports
Route::get('analytics/overview', [App\Http\Controllers\Api\AnalyticsController::class, 'overview']);
Route::get('analytics/sales', [App\Http\Controllers\Api\AnalyticsController::class, 'sales']);
Route::get('analytics/pipeline', [App\Http\Controllers\Api\AnalyticsController::class, 'pipeline']);
Route::get('analytics/performance', [App\Http\Controllers\Api\AnalyticsController::class, 'performance']);
Route::post('analytics/reports/generate', [App\Http\Controllers\Api\AnalyticsController::class, 'generateReport']);

// Sales Forecasting
Route::get('forecasting/predictions', [App\Http\Controllers\Api\ForecastController::class, 'predictions']);
Route::post('forecasting/analyze', [App\Http\Controllers\Api\ForecastController::class, 'analyze']);

// Customer Segmentation
Route::apiResource('segments', App\Http\Controllers\Api\SegmentController::class);
Route::post('segments/{segment}/analyze', [App\Http\Controllers\Api\SegmentController::class, 'analyze']);

// Tags & Labels
Route::apiResource('tags', App\Http\Controllers\Api\TagController::class);
Route::apiResource('labels', App\Http\Controllers\Api\LabelController::class);

// Duplicate Detection
Route::post('duplicates/check', [App\Http\Controllers\Api\DuplicateController::class, 'check']);
Route::post('duplicates/merge', [App\Http\Controllers\Api\DuplicateController::class, 'merge']);

// Data Enrichment
Route::post('enrichment/enrich', [App\Http\Controllers\Api\EnrichmentController::class, 'enrich']);
Route::get('enrichment/providers', [App\Http\Controllers\Api\EnrichmentController::class, 'providers']);

// SQR (Service Quality Requests)
Route::get('sqrs/counts', [App\Http\Controllers\Api\SqrController::class, 'counts']);
Route::patch('sqrs/{id}/status', [App\Http\Controllers\Api\SqrController::class, 'updateStatus']);
Route::apiResource('sqrs', App\Http\Controllers\Api\SqrController::class);

// Custom Fields
Route::apiResource('custom-fields', App\Http\Controllers\Api\CustomFieldController::class);

// Deals
Route::get('/deals/counts', [App\Http\Controllers\Api\DealController::class, 'counts']);
Route::apiResource('deals', App\Http\Controllers\Api\DealController::class);
Route::patch('deals/{id}/stage', [App\Http\Controllers\Api\DealController::class, 'updateStage']);

// Deal Groups (for Sales Pipeline)
Route::apiResource('deal-groups', App\Http\Controllers\Api\DealGroupController::class);
Route::get('deal-groups/{id}/stage-counts', [App\Http\Controllers\Api\DealGroupController::class, 'stageCounts']);

// Activities
Route::get('activities', [App\Http\Controllers\Api\ActivityController::class, 'index']);
Route::get('activities/recent', [App\Http\Controllers\Api\ActivityController::class, 'recent']);
Route::get('activities/for-subject', [App\Http\Controllers\Api\ActivityController::class, 'forSubject']);
Route::get('activities/statistics', [App\Http\Controllers\Api\ActivityController::class, 'statistics']);
Route::post('activities', [App\Http\Controllers\Api\ActivityController::class, 'store']);
Route::get('activities/{activity}', [App\Http\Controllers\Api\ActivityController::class, 'show']);
Route::delete('activities/{activity}', [App\Http\Controllers\Api\ActivityController::class, 'destroy']);

}); // End auth middleware group
