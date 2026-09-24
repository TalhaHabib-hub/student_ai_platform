<?php

namespace App\Http\Controllers;

use App\Models\PaperTest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class PaperTestController extends Controller
{
    public function show(Request $request, $id)
{
    $paperTest = PaperTest::where('id', $id)
        ->where('user_id', $request->user()->id)
        ->first();

    if (!$paperTest) {
        return response()->json(['error' => 'Not found'], 404);
    }

    return response()->json($paperTest);
}

public function submit(Request $request, $id)
{
    $request->validate([
        'answers' => 'required|array',
        'time_taken_seconds' => 'required|integer',
    ]);

    $paperTest = PaperTest::where('id', $id)
        ->where('user_id', $request->user()->id)
        ->first();

    if (!$paperTest) {
        return response()->json(['error' => 'Not found'], 404);
    }

    $questions = $paperTest->questions;
    $submittedAnswers = $request->answers; // array of selected options, same order as questions

    $correctCount = 0;
    $wrongCount = 0;
    $results = [];

    foreach ($questions as $index => $question) {
        $selected = $submittedAnswers[$index] ?? null;
        $isCorrect = $selected === $question['correct_answer'];

        if ($isCorrect) {
            $correctCount++;
        } else {
            $wrongCount++;
        }

        $results[] = [
            'selected' => $selected,
            'is_correct' => $isCorrect,
        ];
    }

    $paperTest->update([
        'answers' => $results,
        'correct_count' => $correctCount,
        'wrong_count' => $wrongCount,
        'time_taken_seconds' => $request->time_taken_seconds,
    ]);

    return response()->json($paperTest);
}

public function explainWrong(Request $request, $id)
{
    $request->validate(['question_index' => 'required|integer']);

    $paperTest = PaperTest::where('id', $id)->where('user_id', $request->user()->id)->first();
    if (!$paperTest) {
        return response()->json(['error' => 'Not found'], 404);
    }

    $index = $request->question_index;
    $questions = $paperTest->questions;
    $answers = $paperTest->answers;
    $question = $questions[$index];
    $selected = $answers[$index]['selected'] ?? 'no answer';

    $apiKey = config('services.gemini.key');

    $prompt = "Question: {$question['question']}\n" .
              "Options: " . implode(', ', $question['options']) . "\n" .
              "Listed correct answer: {$question['correct_answer']}\n" .
              "Student selected: {$selected}\n\n" .
              "Using your own subject knowledge, double-check whether the 'Listed correct answer' is actually right — paper answer keys can be wrong. " .
              "Respond ONLY with valid JSON (no markdown) in this exact format: " .
              '{"actual_correct_answer": "the option that is truly correct", "student_was_actually_correct": true or false, "explanation": "around 15 words explaining why"}';

    $response = Http::timeout(30)->post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={$apiKey}",
        ['contents' => [['parts' => [['text' => $prompt]]]]]
    );

    if ($response->failed()) {
        return response()->json(['error' => 'Could not generate explanation'], 500);
    }

    $text = $response->json('candidates.0.content.parts.0.text');
    $cleanText = trim(str_replace(['```json', '```'], '', $text));
    $result = json_decode($cleanText, true);

    if (!$result || !isset($result['explanation'])) {
        return response()->json(['error' => 'Could not parse explanation'], 500);
    }

    $corrected = false;

    if (!empty($result['student_was_actually_correct']) && $result['actual_correct_answer'] !== $question['correct_answer']) {
        $questions[$index]['correct_answer'] = $result['actual_correct_answer'];
        $answers[$index]['is_correct'] = true;

        $correctCount = collect($answers)->where('is_correct', true)->count();
        $wrongCount = count($answers) - $correctCount;

        $paperTest->update([
            'questions' => $questions,
            'answers' => $answers,
            'correct_count' => $correctCount,
            'wrong_count' => $wrongCount,
        ]);

        $corrected = true;
    }

    return response()->json([
        'explanation' => $result['explanation'],
        'corrected' => $corrected,
        'paper_test' => $paperTest->fresh(),
    ]);
}

public function index(Request $request)
{
    return PaperTest::where('user_id', $request->user()->id)
        ->latest()
        ->get();
}

public function destroy(Request $request, $id)
{
    $paperTest = PaperTest::where('id', $id)
        ->where('user_id', $request->user()->id)
        ->first();

    if (!$paperTest) {
        return response()->json(['error' => 'Not found'], 404);
    }

    $paperTest->delete();

    return response()->json(['message' => 'Deleted']);
}
    public function extract(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10240',
        ]);

        $file = $request->file('file');
        $mimeType = $file->getMimeType();
        $base64 = base64_encode(file_get_contents($file->getPathname()));

        $apiKey = config('services.gemini.key');

        $prompt = "This is a photo of an exam paper with multiple choice questions. " .
                  "Extract every question you can read, with its options and the correct answer if you can determine it " .
                  "(if you cannot determine the correct answer from the paper itself, make your best subject-matter judgement). " .
                  "Return ONLY valid JSON, no markdown, no explanation, in this exact format: " .
                  '[{"question": "...", "options": ["A", "B", "C", "D"], "correct_answer": "A"}]';

        $response = Http::timeout(60)->post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={$apiKey}",
            [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                            [
                                'inline_data' => [
                                    'mime_type' => $mimeType,
                                    'data' => $base64,
                                ]
                            ]
                        ]
                    ]
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
            return response()->json(['error' => 'Could not read questions from this file. Try a clearer photo.'], 500);
        }

        $paperTest = PaperTest::create([
            'user_id' => $request->user()->id,
            'title' => $request->title ?? 'Untitled Paper',
            'questions' => $questions,
        ]);

        return response()->json($paperTest);
    }
}
