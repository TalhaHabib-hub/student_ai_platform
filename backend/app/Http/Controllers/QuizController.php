<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class QuizController extends Controller
{
    public function destroy(Request $request, $id)
{
    $quiz = Quiz::where('id', $id)
        ->where('user_id', $request->user()->id)
        ->first();

    if (!$quiz) {
        return response()->json(['error' => 'Quiz not found'], 404);
    }

    $quiz->delete();

    return response()->json(['message' => 'Quiz deleted']);
}
public function generate(Request $request)
{
    $request->validate([
        'notes' => 'nullable|string|min:20',
        'file' => 'nullable|file|mimes:pdf,txt|max:10240',
        'num_questions' => 'nullable|integer|min:5|max:50',
    ]);

    $noteText = $request->notes;

    if ($request->hasFile('file')) {
        $file = $request->file('file');

        if ($file->getClientOriginalExtension() === 'pdf') {
            $parser = new \Smalot\PdfParser\Parser();
            $pdf = $parser->parseFile($file->getPathname());
            $noteText = $pdf->getText();
        } else {
            $noteText = file_get_contents($file->getPathname());
        }
    }

    if (!$noteText || strlen(trim($noteText)) < 20) {
        return response()->json(['error' => 'Could not extract enough text from the provided notes or file.'], 422);
    }

    $numQuestions = $request->num_questions ?? 5;
    $apiKey = config('services.gemini.key');

    $prompt = "Based on these study notes, create exactly {$numQuestions} multiple choice questions. " .
              "Return ONLY valid JSON (no markdown, no explanation) in this exact format: " .
              '[{"question": "...", "options": ["A", "B", "C", "D"], "answer": "A"}]' .
              "\n\nNotes:\n" . $noteText;

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
        'source_notes' => substr($noteText, 0, 2000),
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
