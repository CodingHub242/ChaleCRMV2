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
        Schema::create('email_accounts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('organization_id')->nullable();
            $table->string('email');
            $table->string('name')->nullable();
            $table->string('imap_host');
            $table->integer('imap_port')->default(993);
            $table->string('imap_encryption')->default('ssl'); // ssl, tls, null
            $table->string('username');
            $table->string('password'); // encrypted
            $table->string('smtp_host')->nullable();
            $table->integer('smtp_port')->default(587)->nullable();
            $table->string('smtp_encryption')->default('tls')->nullable();
            $table->boolean('is_active')->default(true);
            $table->boolean('is_default')->default(false);
            $table->boolean('auto_create_sqr')->default(true); // Auto-create SQR from emails
            $table->timestamp('last_sync_at')->nullable();
            $table->timestamps();

            $table->index('organization_id');
        });

        // Add fields to sqrs table for email tracking
        Schema::table('sqrs', function (Blueprint $table) {
            $table->string('email_message_id')->nullable()->after('resolution_notes');
            $table->string('from_email')->nullable()->after('email_message_id');
            $table->index('email_message_id');
            $table->index('from_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('email_accounts');
        
        Schema::table('sqrs', function (Blueprint $table) {
            $table->dropIndex(['email_message_id', 'from_email']);
            $table->dropColumn(['email_message_id', 'from_email']);
        });
    }
};