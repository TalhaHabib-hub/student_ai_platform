<?php
use App\Http\Controllers\QuizController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PaperTestController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/profile-photo', [AuthController::class, 'updateProfilePhoto']);
    Route::delete('/account', [AuthController::class, 'deleteAccount']);
    Route::delete('/quizzes/{id}', [QuizController::class, 'destroy']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/generate-quiz', [QuizController::class, 'generate']);
Route::get('/quizzes', [QuizController::class, 'index']);
Route::post('/paper-tests/extract', [PaperTestController::class, 'extract']);
Route::get('/paper-tests', [PaperTestController::class, 'index']);
Route::get('/paper-tests/{id}', [PaperTestController::class, 'show']);
Route::post('/paper-tests/{id}/submit', [PaperTestController::class, 'submit']);
Route::post('/paper-tests/{id}/explain', [PaperTestController::class, 'explainWrong']);
Route::delete('/paper-tests/{id}', [PaperTestController::class, 'destroy']);
});