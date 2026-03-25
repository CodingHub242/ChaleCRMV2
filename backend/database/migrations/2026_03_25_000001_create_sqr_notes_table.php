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
        Schema::create('sqr_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sqr_id')->constrained('sqrs')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('zoho_users')->onDelete('cascade');
            $table->text('content');
            $table->timestamps();
            
            // Index for faster queries
            $table->index('sqr_id');
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sqr_notes');
    }
};