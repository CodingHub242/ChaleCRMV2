<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSqrsTable extends Migration
{
    public function up(): void
    {
        Schema::create('sqrs', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->enum('type', ['Complaint', 'Feedback', 'Suggestion', 'Inquiry'])->default('Complaint');
            $table->enum('priority', ['Low', 'Medium', 'High', 'Critical'])->default('Medium');
            $table->enum('status', ['Open', 'In Progress', 'Resolved', 'Closed'])->default('Open');
            $table->text('description')->nullable();
            $table->unsignedBigInteger('contact_id')->nullable();
            $table->unsignedBigInteger('company_id')->nullable();
            $table->unsignedBigInteger('assigned_to')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->timestamps();

            $table->foreign('contact_id')->references('id')->on('contacts')->onDelete('set null');
            $table->foreign('company_id')->references('id')->on('companies')->onDelete('set null');
            $table->index('status');
            $table->index('priority');
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sqrs');
    }
}
