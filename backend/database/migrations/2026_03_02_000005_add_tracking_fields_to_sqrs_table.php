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
        Schema::table('sqrs', function (Blueprint $table) {
            // Track who created and updated the SQR
            $table->unsignedBigInteger('created_by')->nullable()->after('organization_id');
            $table->unsignedBigInteger('updated_by')->nullable()->after('created_by');
            
            // Owner field - set when assignee is assigned
            $table->unsignedBigInteger('owner_id')->nullable()->after('assigned_to');
            
            // Add foreign key constraints
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('updated_by')->references('id')->on('users')->onDelete('set null');
            $table->foreign('owner_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sqrs', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
            $table->dropForeign(['owner_id']);
            $table->dropColumn(['created_by', 'updated_by', 'owner_id']);
        });
    }
};
