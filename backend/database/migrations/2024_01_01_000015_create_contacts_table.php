<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateContactsTable extends Migration
{
    public function up(): void
    {
        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->string('first_name', 255);
            $table->string('last_name', 255);
            $table->string('email', 255);
            $table->string('phone', 50)->nullable();
            $table->string('mobile', 50)->nullable();
            $table->unsignedBigInteger('company_id')->nullable();
            $table->string('lead_status', 100)->nullable();
            $table->string('source', 100)->nullable();
            $table->string('avatar', 500)->nullable();
            $table->string('address', 500)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('country', 100)->nullable();
            $table->string('zip_code', 20)->nullable();
            $table->timestamps();

            $table->foreign('company_id')->references('id')->on('companies')->onDelete('set null');
            $table->index('email');
            $table->index('company_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contacts');
    }
}
