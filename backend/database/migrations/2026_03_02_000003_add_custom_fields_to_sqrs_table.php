<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddCustomFieldsToSqrsTable extends Migration
{
    public function up(): void
    {
        Schema::table('sqrs', function (Blueprint $table) {
            // Add custom_fields JSON column
            $table->json('custom_fields')->nullable()->after('resolution_notes');
            
            // Add Escalated status if not exists (needs DB reset or manual update)
            // Note: This won't modify enum in MySQL, needs table recreation
        });
    }

    public function down(): void
    {
        Schema::table('sqrs', function (Blueprint $table) {
            $table->dropColumn('custom_fields');
        });
    }
}
