<?php

namespace App\Http\Controllers;

use App\Models\Quiz;
use App\Models\PaperTest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class StatsController extends Controller
{
    public function overview(Request $request)
    {
        $userId = $request->user()->id;

        $quizzes = Quiz::where('user_id', $userId)->whereNotNull('correct_count')->get();
        $paperTests = PaperTest::where('user_id', $userId)->whereNotNull('correct_count')->get();

        $totalCorrect = $quizzes->sum('correct_count') + $paperTests->sum('correct_count');
        $totalWrong = $quizzes->sum('wrong_count') + $paperTests->sum('wrong_count');
        $totalQuestions = $totalCorrect + $totalWrong;
        $accuracy = $totalQuestions > 0 ? round(($totalCorrect / $totalQuestions) * 100, 1) : 0;

        $attempts = collect();

        foreach ($quizzes as $q) {
            $total = $q->correct_count + $q->wrong_count;
            $attempts->push([
                'type' => 'Quiz',
                'title' => $q->source_notes ? substr($q->source_notes, 0, 40) : 'Quiz',
                'date' => $q->updated_at->format('Y-m-d'),
                'weekday' => $q->updated_at->format('D'),
                'correct' => $q->correct_count,
                'wrong' => $q->wrong_count,
                'accuracy' => $total > 0 ? round(($q->correct_count / $total) * 100, 1) : 0,
            ]);
        }

        foreach ($paperTests as $p) {
            $total = $p->correct_count + $p->wrong_count;
            $attempts->push([
                'type' => 'Paper Test',
                'title' => $p->title,
                'date' => $p->updated_at->format('Y-m-d'),
                'weekday' => $p->updated_at->format('D'),
                'correct' => $p->correct_count,
                'wrong' => $p->wrong_count,
                'accuracy' => $total > 0 ? round(($p->correct_count / $total) * 100, 1) : 0,
            ]);
        }

        $sorted = $attempts->sortBy('date')->values();

        $weekdayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        $byWeekday = collect($weekdayOrder)->map(fn ($day) => [
            'day' => $day,
            'count' => $sorted->where('weekday', $day)->count(),
        ]);

        return response()->json([
            'total_quizzes' => $quizzes->count(),
            'total_paper_tests' => $paperTests->count(),
            'total_attempts' => $quizzes->count() + $paperTests->count(),
            'total_questions' => $totalQuestions,
            'total_correct' => $totalCorrect,
            'total_wrong' => $totalWrong,
            'accuracy' => $accuracy,
            'by_weekday' => $byWeekday,
            'trend' => $sorted->take(-10)->values(),
            'recent_attempts' => $sorted->reverse()->take(5)->values(),
        ]);
    }

    public function roadmap(Request $request)
    {
        $userId = $request->user()->id;

        $quizzes = Quiz::where('user_id', $userId)->whereNotNull('answers')->get();
        $paperTests = PaperTest::where('user_id', $userId)->whereNotNull('answers')->get();

        $wrongItems = [];

        foreach ($quizzes as $quiz) {
            foreach ($quiz->questions as $i => $q) {
                $ans = $quiz->answers[$i] ?? null;
                if ($ans && !$ans['is_correct']) {
                    $wrongItems[] = "Q: {$q['question']} | Correct: {$q['answer']} | Selected: " . ($ans['selected'] ?? 'none');
                }
            }
        }

        foreach ($paperTests as $test) {
            foreach ($test->questions as $i => $q) {
                $ans = $test->answers[$i] ?? null;
                if ($ans && !$ans['is_correct']) {
                    $wrongItems[] = "Q: {$q['question']} | Correct: {$q['correct_answer']} | Selected: " . ($ans['selected'] ?? 'none');
                }
            }
        }

        if (empty($wrongItems)) {
            return response()->json([
                'has_data' => false,
                'message' => 'Not enough attempted quizzes yet to generate a roadmap. Take a few quizzes or paper tests first.',
            ]);
        }

        $apiKey = config('services.gemini.key');
        $wrongText = implode("\n", array_slice($wrongItems, 0, 60));

        $prompt = "A student got these questions wrong across their practice quizzes:\n\n{$wrongText}\n\n" .
                  "Identify their subject strengths and weaknesses, and suggest a short study roadmap. " .
                  "Return ONLY valid JSON (no markdown) in this exact format: " .
                  '{"strengths": ["...", "..."], "weaknesses": ["...", "..."], "roadmap": [{"step": "...", "why": "..."}]}' .
                  " Keep each strength/weakness under 12 words, and give 3-5 roadmap steps.";

        $response = Http::timeout(45)->post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={$apiKey}",
            ['contents' => [['parts' => [['text' => $prompt]]]]]
        );

        if ($response->failed()) {
            return response()->json(['error' => 'Could not generate roadmap'], 500);
        }

        $text = $response->json('candidates.0.content.parts.0.text');
        $cleanText = trim(str_replace(['```json', '```'], '', $text));
        $result = json_decode($cleanText, true);

        if (!$result) {
            return response()->json(['error' => 'Could not parse roadmap'], 500);
        }

        return response()->json(array_merge(['has_data' => true], $result));
    }
}