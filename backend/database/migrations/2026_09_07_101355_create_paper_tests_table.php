<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paper_tests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title')->nullable();
            $table->json('questions'); // [{question, options, correct_answer}]
            $table->json('answers')->nullable(); // [{selected, is_correct}] filled after submission
            $table->integer('correct_count')->nullable();
            $table->integer('wrong_count')->nullable();
            $table->integer('time_taken_seconds')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paper_tests');
    }
};