<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCustomFieldsTable extends Migration
{
    public function up(): void
    {
        Schema::create('custom_fields', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('label', 255);
            $table->enum('type', ['text', 'textarea', 'number', 'date', 'select', 'multiselect', 'checkbox', 'radio'])->default('text');
            $table->boolean('required')->default(false);
            $table->json('options')->nullable();
            $table->string('default_value')->nullable();
            $table->string('module', 50); // contact, company, deal, sqr, etc.
            $table->integer('display_order')->default(0);
            $table->unsignedBigInteger('organization_id')->nullable();
            $table->timestamps();

            $table->index('module');
            $table->index('organization_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_fields');
    }
}
