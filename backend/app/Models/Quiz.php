<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    use HasFactory;

   protected $fillable = [
    'user_id',
    'source_notes',
    'questions',
    'answers',
    'correct_count',
    'wrong_count',
];

protected $casts = [
    'questions' => 'array',
    'answers' => 'array',
];
}