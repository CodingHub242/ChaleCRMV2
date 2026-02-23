<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Adds organization_id to all CRM data tables for multi-tenancy
     */
    public function up(): void
    {
        // Contacts table
        Schema::table('contacts', function (Blueprint $table) {
            $table->foreignId('organization_id')
                ->nullable()
                ->constrained('organizations')
                ->onDelete('cascade');
        });

        // Companies table
        Schema::table('companies', function (Blueprint $table) {
            $table->foreignId('organization_id')
                ->nullable()
                ->constrained('organizations')
                ->onDelete('cascade');
        });

        // Activities table
        Schema::table('activities', function (Blueprint $table) {
            $table->foreignId('organization_id')
                ->nullable()
                ->constrained('organizations')
                ->onDelete('cascade');
        });

        // Calls table
        Schema::table('calls', function (Blueprint $table) {
            $table->foreignId('organization_id')
                ->nullable()
                ->constrained('organizations')
                ->onDelete('cascade');
        });

        // Campaigns table
        Schema::table('campaigns', function (Blueprint $table) {
            $table->foreignId('organization_id')
                ->nullable()
                ->constrained('organizations')
                ->onDelete('cascade');
        });

        // Contracts table
        Schema::table('contracts', function (Blueprint $table) {
            $table->foreignId('organization_id')
                ->nullable()
                ->constrained('organizations')
                ->onDelete('cascade');
        });

        // Email histories table
        Schema::table('email_histories', function (Blueprint $table) {
            $table->foreignId('organization_id')
                ->nullable()
                ->constrained('organizations')
                ->onDelete('cascade');
        });

        // Email templates table
        Schema::table('email_templates', function (Blueprint $table) {
            $table->foreignId('organization_id')
                ->nullable()
                ->constrained('organizations')
                ->onDelete('cascade');
        });

        // Products table
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('organization_id')
                ->nullable()
                ->constrained('organizations')
                ->onDelete('cascade');
        });

        // Purchase orders table
        Schema::table('purchase_orders', function (Blueprint $table) {
            $table->foreignId('organization_id')
                ->nullable()
                ->constrained('organizations')
                ->onDelete('cascade');
        });

        // Sales orders table
        Schema::table('sales_orders', function (Blueprint $table) {
            $table->foreignId('organization_id')
                ->nullable()
                ->constrained('organizations')
                ->onDelete('cascade');
        });

        // Segments table
        Schema::table('segments', function (Blueprint $table) {
            $table->foreignId('organization_id')
                ->nullable()
                ->constrained('organizations')
                ->onDelete('cascade');
        });

        // Social posts table
        Schema::table('social_posts', function (Blueprint $table) {
            $table->foreignId('organization_id')
                ->nullable()
                ->constrained('organizations')
                ->onDelete('cascade');
        });

        // SQRs table
        Schema::table('sqrs', function (Blueprint $table) {
            $table->foreignId('organization_id')
                ->nullable()
                ->constrained('organizations')
                ->onDelete('cascade');
        });

        // Tags table
        Schema::table('tags', function (Blueprint $table) {
            $table->foreignId('organization_id')
                ->nullable()
                ->constrained('organizations')
                ->onDelete('cascade');
        });

        // Workflows table
        Schema::table('workflows', function (Blueprint $table) {
            $table->foreignId('organization_id')
                ->nullable()
                ->constrained('organizations')
                ->onDelete('cascade');
        });

        // Document templates table
        Schema::table('document_templates', function (Blueprint $table) {
            $table->foreignId('organization_id')
                ->nullable()
                ->constrained('organizations')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = [
            'contacts', 'companies', 'activities', 'calls', 'campaigns',
            'contracts', 'email_histories', 'email_templates', 'products',
            'purchase_orders', 'sales_orders', 'segments', 'social_posts',
            'sqrs', 'tags', 'workflows', 'document_templates'
        ];

        foreach ($tables as $table) {
            Schema::table($table, function (Blueprint $table) {
                $table->dropForeign(['organization_id']);
                $table->dropColumn('organization_id');
            });
        }
    }
};
