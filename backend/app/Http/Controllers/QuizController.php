<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class QuizController extends Controller
{
    public function generate(Request $request)
    {
        $request->validate([
            'notes' => 'required|string|min:20',
        ]);

        $apiKey = config('services.gemini.key');

        $prompt = "Based on these study notes, create exactly 5 multiple choice questions. " .
                  "Return ONLY valid JSON (no markdown, no explanation) in this exact format: " .
                  '[{"question": "...", "options": ["A", "B", "C", "D"], "answer": "A"}]' .
                  "\n\nNotes:\n" . $request->notes;

        $response = Http::timeout(60)->post(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={$apiKey}",
            [
                'contents' => [
                    ['parts' => [['text' => $prompt]]]
                ]
            ]
        );

    if ($response->failed()) {
    return response()->json([
        'error' => 'AI request failed',
        'status' => $response->status(),
        'body' => $response->json(),
    ], 500);
}

        $text = $response->json('candidates.0.content.parts.0.text');
        $cleanText = trim(str_replace(['```json', '```'], '', $text));
        $questions = json_decode($cleanText, true);

        if (!$questions) {
            return response()->json(['error' => 'Could not parse AI response'], 500);
        }

        $quiz = Quiz::create([
            'user_id' => $request->user()->id,
            'source_notes' => $request->notes,
            'questions' => $questions,
        ]);

        return response()->json($quiz);
    }

    public function index(Request $request)
    {
        return Quiz::where('user_id', $request->user()->id)
            ->latest()
            ->get();
    }
}
