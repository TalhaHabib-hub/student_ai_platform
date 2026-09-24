<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class QuizController extends Controller
{
   public function submit(Request $request, $id)
{
    $request->validate([
        'answers' => 'required|array',
    ]);

    $quiz = Quiz::where('id', $id)->where('user_id', $request->user()->id)->first();
    if (!$quiz) {
        return response()->json(['error' => 'Not found'], 404);
    }

    $questions = $quiz->questions;
    $submittedAnswers = $request->answers;
    $correctCount = 0;
    $wrongCount = 0;
    $results = [];

    foreach ($questions as $index => $question) {
        $selected = $submittedAnswers[$index] ?? null;
        $isCorrect = $selected === $question['answer'];

        if ($isCorrect) $correctCount++; else $wrongCount++;

        $results[] = ['selected' => $selected, 'is_correct' => $isCorrect];
    }

    $quiz->update([
        'answers' => $results,
        'correct_count' => $correctCount,
        'wrong_count' => $wrongCount,
    ]);

    return response()->json($quiz);
}

public function explainWrong(Request $request, $id)
{
    $request->validate(['question_index' => 'required|integer']);

    $quiz = Quiz::where('id', $id)->where('user_id', $request->user()->id)->first();
    if (!$quiz) {
        return response()->json(['error' => 'Not found'], 404);
    }

    $index = $request->question_index;
    $questions = $quiz->questions;
    $answers = $quiz->answers;
    $question = $questions[$index];
    $selected = $answers[$index]['selected'] ?? 'no answer';

    $apiKey = config('services.gemini.key');

    $prompt = "Question: {$question['question']}\n" .
              "Options: " . implode(', ', $question['options']) . "\n" .
              "Listed correct answer: {$question['answer']}\n" .
              "Student selected: {$selected}\n\n" .
              "Using your own subject knowledge, double-check whether the 'Listed correct answer' is actually right. " .
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

    if (!empty($result['student_was_actually_correct']) && $result['actual_correct_answer'] !== $question['answer']) {
        $questions[$index]['answer'] = $result['actual_correct_answer'];
        $answers[$index]['is_correct'] = true;

        $correctCount = collect($answers)->where('is_correct', true)->count();
        $wrongCount = count($answers) - $correctCount;

        $quiz->update([
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
        'quiz' => $quiz->fresh(),
    ]);
}

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
        'notes' => 'nullable|string',
        'files' => 'nullable|array',
        'files.*' => 'file|mimes:pdf,txt,jpg,jpeg,png|max:10240',
        'num_questions' => 'nullable|integer|min:5|max:50',
    ]);

    $noteText = $request->notes ?? '';
    $apiKey = config('services.gemini.key');

    if ($request->hasFile('files')) {
        foreach ($request->file('files') as $file) {
            $extension = strtolower($file->getClientOriginalExtension());

            if ($extension === 'pdf') {
                $parser = new \Smalot\PdfParser\Parser();
                $pdf = $parser->parseFile($file->getPathname());
                $noteText .= "\n" . $pdf->getText();
            } elseif ($extension === 'txt') {
                $noteText .= "\n" . file_get_contents($file->getPathname());
            } else {
                // Image: use Gemini vision to read the text from it
                $base64 = base64_encode(file_get_contents($file->getPathname()));
                $mimeType = $file->getMimeType();

                $visionResponse = Http::timeout(60)->post(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={$apiKey}",
                    [
                        'contents' => [[
                            'parts' => [
                                ['text' => 'Extract all readable text from this image of study notes. Return only the extracted text, nothing else.'],
                                ['inline_data' => ['mime_type' => $mimeType, 'data' => $base64]]
                            ]
                        ]]
                    ]
                );

                if ($visionResponse->successful()) {
                    $extractedText = $visionResponse->json('candidates.0.content.parts.0.text');
                    $noteText .= "\n" . $extractedText;
                }
            }
        }
    }

    if (!$noteText || strlen(trim($noteText)) < 20) {
        return response()->json(['error' => 'Could not extract enough text from the provided notes or files.'], 422);
    }

    $numQuestions = $request->num_questions ?? 5;

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
