<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('calls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('contact_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('company_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('call_type', ['outbound', 'inbound'])->default('outbound');
            $table->enum('direction', ['internal', 'external'])->default('external');
            $table->enum('status', ['planned', 'completed', 'missed', 'voicemail'])->default('planned');
            $table->integer('duration')->nullable(); // in seconds
            $table->text('summary')->nullable();
            $table->text('notes')->nullable();
            $table->string('recording_url')->nullable();
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calls');
    }
};
