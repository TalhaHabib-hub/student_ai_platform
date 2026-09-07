<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->json('answers')->nullable()->after('questions');
            $table->integer('correct_count')->nullable()->after('answers');
            $table->integer('wrong_count')->nullable()->after('correct_count');
        });
    }

    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropColumn(['answers', 'correct_count', 'wrong_count']);
        });
    }
};