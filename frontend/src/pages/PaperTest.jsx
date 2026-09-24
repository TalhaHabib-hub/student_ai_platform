import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, HelpCircle, Clock } from 'lucide-react';
import api from '../api';
import ThemeToggle from '../components/ThemeToggle';

function PaperTest() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [paperTest, setPaperTest] = useState(null);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [explanations, setExplanations] = useState({});
    const [explainingIndex, setExplainingIndex] = useState(null);
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        api.get(`/paper-tests/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
            setPaperTest(response.data);
            if (response.data.answers) {
                setSubmitted(true);
                const restored = {};
                response.data.answers.forEach((a, i) => { restored[i] = a.selected; });
                setSelectedAnswers(restored);
            } else {
                timerRef.current = setInterval(() => {
                    setSecondsElapsed((s) => s + 1);
                }, 1000);
            }
        })
        .catch(() => setError('Could not load this paper test.'))
        .finally(() => setLoading(false));

        return () => clearInterval(timerRef.current);
    }, [id]);

    const selectAnswer = (questionIndex, option) => {
        if (submitted) return;
        setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: option }));
    };

    const handleSubmit = async () => {
        clearInterval(timerRef.current);
        setSubmitting(true);
        setError('');

        const token = localStorage.getItem('token');
        const answersArray = paperTest.questions.map((_, i) => selectedAnswers[i] ?? null);

        try {
            const response = await api.post(
                `/paper-tests/${id}/submit`,
                { answers: answersArray, time_taken_seconds: secondsElapsed },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPaperTest(response.data);
            setSubmitted(true);
        } catch (err) {
            setError('Could not submit test.');
        } finally {
            setSubmitting(false);
        }
    };

   const handleExplain = async (index) => {
    setExplainingIndex(index);
    const token = localStorage.getItem('token');

    try {
        const response = await api.post(
            `/paper-tests/${id}/explain`,
            { question_index: index },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setExplanations((prev) => ({
            ...prev,
            [index]: { text: response.data.explanation, corrected: response.data.corrected },
        }));
        if (response.data.corrected && response.data.paper_test) {
            setPaperTest(response.data.paper_test);
        }
    } catch (err) {
        setExplanations((prev) => ({ ...prev, [index]: { text: 'Could not generate explanation.', corrected: false } }));
    } finally {
        setExplainingIndex(null);
    }
};

    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black text-slate-400 dark:text-zinc-500">
        Loading paper test...
    </div>
);

if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black text-red-600 dark:text-red-400">
        {error}
    </div>
);

return (
    <div className="min-h-screen bg-slate-50 dark:bg-black transition-colors">
        <nav className="bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-orange-500/20 px-6 py-4 flex justify-between items-center">
            <Link to="/my-paper-tests" className="text-indigo-600 dark:text-orange-500 hover:text-indigo-700 dark:hover:text-orange-400 font-medium">← Back to My Paper Tests</Link>
            <div className="flex items-center gap-4">
                {!submitted && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-zinc-400">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(secondsElapsed)}</span>
                    </div>
                )}
                <ThemeToggle />
            </div>
        </nav>

        <div className="max-w-2xl mx-auto px-6 py-10">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{paperTest.title}</h2>

            {submitted && (
                <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-orange-500/20 rounded-2xl p-6 shadow-sm mb-6 flex flex-wrap gap-6">
                    <div>
                        <p className="text-slate-500 dark:text-zinc-400 text-sm">Correct</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{paperTest.correct_count}</p>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-zinc-400 text-sm">Wrong</p>
                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">{paperTest.wrong_count}</p>
                    </div>
                    <div>
                        <p className="text-slate-500 dark:text-zinc-400 text-sm">Time Taken</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatTime(paperTest.time_taken_seconds)}</p>
                    </div>
                </div>
            )}

                <div className="space-y-5">
                    {paperTest.questions.map((q, index) => {
                        const selected = selectedAnswers[index];
                        const isCorrect = submitted && selected === q.correct_answer;
                        const isWrong = submitted && selected && selected !== q.correct_answer;

                        return (
                                                    <div key={index} className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-orange-500/20 rounded-xl p-5 shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <p className="font-medium text-slate-900 dark:text-white">{index + 1}. {q.question}</p>
                                    {submitted && (
                                        isCorrect ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 ml-2" />
                                        : isWrong ? <XCircle className="w-5 h-5 text-red-600 shrink-0 ml-2" />
                                        : null
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {q.options.map((option, i) => {
                                        const isSelected = selected === option;
                                        const isTheCorrectAnswer = option === q.correct_answer;

                                                                let optionStyle = 'bg-slate-50 dark:bg-black text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800';
                                        if (submitted) {
                                            if (isTheCorrectAnswer) {
                                                optionStyle = 'bg-green-50 dark:bg-green-500/10 border-green-300 dark:border-green-500/30 text-green-700 dark:text-green-400 font-medium';
                                            } else if (isSelected && !isTheCorrectAnswer) {
                                                optionStyle = 'bg-red-50 dark:bg-red-500/10 border-red-300 dark:border-red-500/30 text-red-700 dark:text-red-400 font-medium';
                                            }
                                        } else if (isSelected) {
                                            optionStyle = 'bg-indigo-50 dark:bg-orange-500/10 border-indigo-400 dark:border-orange-500 text-indigo-700 dark:text-orange-400 font-medium';
                                        }

                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => selectAnswer(index, option)}
                                                disabled={submitted}
                                                                                                className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition ${optionStyle} ${!submitted ? 'hover:border-indigo-400 dark:hover:border-orange-500 cursor-pointer' : 'cursor-default'}`}
                                            >
                                                {option}
                                            </button>
                                        );
                                    })}
                                </div>

                                                              {(isWrong || explanations[index]) && (
                                    <div className="mt-3">
                                       {explanations[index] ? (
    <p className={`text-sm rounded-lg px-3 py-2 ${
        explanations[index].corrected
            ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-500/10'
            : 'text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-black'
    }`}>
        {explanations[index].corrected && <strong>✓ Auto-corrected — your answer was actually right. </strong>}
        {explanations[index].text}
    </p>
) : (
                                            <button
                                                onClick={() => handleExplain(index)}
                                                disabled={explainingIndex === index}
                                                className="flex items-center gap-1 text-xs text-indigo-600 dark:text-orange-500 hover:text-indigo-700 dark:hover:text-orange-400 disabled:opacity-50"
                                            >
                                                <HelpCircle className="w-3.5 h-3.5" />
                                                {explainingIndex === index ? 'Thinking...' : 'Why?'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                             {!submitted && (
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="mt-6 w-full bg-indigo-600 dark:bg-orange-600 hover:bg-indigo-700 dark:hover:bg-orange-500 disabled:opacity-50 text-white font-semibold rounded-xl py-3 transition"
                    >
                        {submitting ? 'Submitting...' : 'Submit Test'}
                    </button>
                )}
            </div>
        </div>
    );
}

export default PaperTest;