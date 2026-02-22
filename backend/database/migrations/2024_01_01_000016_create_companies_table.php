<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCompaniesTable extends Migration
{
    public function up(): void
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->string('email', 255)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('mobile', 50)->nullable();
            $table->string('website', 255)->nullable();
            $table->string('industry', 100)->nullable();
            $table->string('address', 500)->nullable();
            $table->string('city', 100)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('country', 100)->nullable();
            $table->string('zip_code', 20)->nullable();
            $table->string('logo', 500)->nullable();
            $table->timestamps();

            $table->index('name');
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('companies');
    }
}
