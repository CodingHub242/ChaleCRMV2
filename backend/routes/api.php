<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes (TEMPORARILY WITHOUT AUTH FOR TESTING)
|--------------------------------------------------------------------------
*/

// Remove auth:sanctum temporarily to test - add back after fixing Sanctum config

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
