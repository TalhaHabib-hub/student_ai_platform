<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaperTest extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'questions',
        'answers',
        'correct_count',
        'wrong_count',
        'time_taken_seconds',
    ];

    protected $casts = [
        'questions' => 'array',
        'answers' => 'array',
    ];
}
