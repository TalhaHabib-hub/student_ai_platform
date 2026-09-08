import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, HelpCircle, Clock } from 'lucide-react';
import api from '../api';

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
            setExplanations((prev) => ({ ...prev, [index]: response.data.explanation }));
        } catch (err) {
            setExplanations((prev) => ({ ...prev, [index]: 'Could not generate explanation.' }));
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
            Loading paper test...
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-red-600">
            {error}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <Link to="/my-paper-tests" className="text-indigo-600 hover:text-indigo-700 font-medium">← Back to My Paper Tests</Link>
                {!submitted && (
                    <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(secondsElapsed)}</span>
                    </div>
                )}
            </nav>

            <div className="max-w-2xl mx-auto px-6 py-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">{paperTest.title}</h2>

                {submitted && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 flex flex-wrap gap-6">
                        <div>
                            <p className="text-slate-500 text-sm">Correct</p>
                            <p className="text-2xl font-bold text-green-600">{paperTest.correct_count}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm">Wrong</p>
                            <p className="text-2xl font-bold text-red-600">{paperTest.wrong_count}</p>
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm">Time Taken</p>
                            <p className="text-2xl font-bold text-slate-900">{formatTime(paperTest.time_taken_seconds)}</p>
                        </div>
                    </div>
                )}

                <div className="space-y-5">
                    {paperTest.questions.map((q, index) => {
                        const selected = selectedAnswers[index];
                        const isCorrect = submitted && selected === q.correct_answer;
                        const isWrong = submitted && selected && selected !== q.correct_answer;

                        return (
                            <div key={index} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <p className="font-medium text-slate-900">{index + 1}. {q.question}</p>
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

                                        let optionStyle = 'bg-slate-50 text-slate-700 border-slate-200';
                                        if (submitted) {
                                            if (isTheCorrectAnswer) {
                                                optionStyle = 'bg-green-50 border-green-300 text-green-700 font-medium';
                                            } else if (isSelected && !isTheCorrectAnswer) {
                                                optionStyle = 'bg-red-50 border-red-300 text-red-700 font-medium';
                                            }
                                        } else if (isSelected) {
                                            optionStyle = 'bg-indigo-50 border-indigo-400 text-indigo-700 font-medium';
                                        }

                                        return (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => selectAnswer(index, option)}
                                                disabled={submitted}
                                                className={`w-full text-left px-4 py-2.5 rounded-lg border text-sm transition ${optionStyle} ${!submitted ? 'hover:border-indigo-400 cursor-pointer' : 'cursor-default'}`}
                                            >
                                                {option}
                                            </button>
                                        );
                                    })}
                                </div>

                                {isWrong && (
                                    <div className="mt-3">
                                        {explanations[index] ? (
                                            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                                                {explanations[index]}
                                            </p>
                                        ) : (
                                            <button
                                                onClick={() => handleExplain(index)}
                                                disabled={explainingIndex === index}
                                                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
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
                        className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl py-3 transition"
                    >
                        {submitting ? 'Submitting...' : 'Submit Test'}
                    </button>
                )}
            </div>
        </div>
    );
}

export default PaperTest;