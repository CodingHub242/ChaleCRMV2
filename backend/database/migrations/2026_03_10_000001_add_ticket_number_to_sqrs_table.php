<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddTicketNumberToSqrsTable extends Migration
{
    public function up(): void
    {
        Schema::table('sqrs', function (Blueprint $table) {
            $table->string('ticket_number', 50)->nullable()->unique()->after('title');
            $table->index('ticket_number');
        });
    }

    public function down(): void
    {
        Schema::table('sqrs', function (Blueprint $table) {
            $table->dropIndex(['ticket_number']);
            $table->dropUnique(['ticket_number']);
            $table->dropColumn('ticket_number');
        });
    }
}
