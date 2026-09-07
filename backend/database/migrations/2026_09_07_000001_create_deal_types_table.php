<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deal_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('color')->nullable();
            $table->boolean('is_default')->default(false);
            $table->unsignedBigInteger('organization_id')->nullable();
            $table->timestamps();
        });

        Schema::table('deals', function (Blueprint $table) {
            $table->unsignedBigInteger('deal_type_id')->nullable()->after('group_id');
            $table->foreign('deal_type_id')->references('id')->on('deal_types')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('deals', function (Blueprint $table) {
            $table->dropForeign(['deal_type_id']);
            $table->dropColumn('deal_type_id');
        });

        Schema::dropIfExists('deal_types');
    }
};
