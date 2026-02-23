<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateActivitiesTable extends Migration
{
    public function up()
    {
        Schema::create('activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('zoho_users')->onDelete('set null');
            $table->string('activity_type', 50);
            $table->text('description');
            $table->string('subject_type', 100)->nullable();
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->timestamp('activity_date')->useCurrent();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['subject_type', 'subject_id']);
            $table->index('activity_type');
            $table->index('activity_date');
            $table->index('user_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('activities');
    }
}
