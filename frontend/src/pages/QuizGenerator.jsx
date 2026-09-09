import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, X, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';
import api from '../api';
import ThemeToggle from '../components/ThemeToggle';

function QuizGenerator() {
    const [notes, setNotes] = useState('');
    const [files, setFiles] = useState([]);
    const [numQuestions, setNumQuestions] = useState(5);
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [explanations, setExplanations] = useState({});
    const [explainingIndex, setExplainingIndex] = useState(null);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setQuiz(null);

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        if (!notes.trim() && files.length === 0) {
            setError('Please paste notes or upload at least one file.');
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            if (notes.trim()) formData.append('notes', notes);
            files.forEach((f) => formData.append('files[]', f));
            formData.append('num_questions', numQuestions);

            const response = await api.post('/generate-quiz', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setQuiz(response.data);
            setSelectedAnswers({});
            setSubmitted(false);
            setExplanations({});
        } catch (err) {
            setError('Could not generate quiz. Try shorter notes or fewer/smaller files.');
        } finally {
            setLoading(false);
        }
    };

    const addFiles = (newFiles) => {
        setFiles((prev) => [...prev, ...Array.from(newFiles)]);
    };

    const removeFile = (index) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
    };

    const selectAnswer = (questionIndex, option) => {
        if (submitted) return;
        setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: option }));
    };

    const handleSubmitQuiz = async () => {
        setSubmitting(true);
        const token = localStorage.getItem('token');
        const answersArray = quiz.questions.map((_, i) => selectedAnswers[i] ?? null);

        try {
            const response = await api.post(
                `/quizzes/${quiz.id}/submit`,
                { answers: answersArray },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setQuiz(response.data);
            setSubmitted(true);
        } catch (err) {
            setError('Could not submit quiz.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleExplain = async (index) => {
        setExplainingIndex(index);
        const token = localStorage.getItem('token');
        try {
            const response = await api.post(
                `/quizzes/${quiz.id}/explain`,
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

    return (
    <div className="min-h-screen bg-slate-50 dark:bg-black transition-colors">
    <nav className="bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-orange-500/20 px-6 py-4 flex justify-between items-center">
        <Link to="/dashboard" className="text-indigo-600 dark:text-orange-500 hover:text-indigo-700 dark:hover:text-orange-400 font-medium">← Back to Dashboard</Link>
        <ThemeToggle />
    </nav>

    <div className="max-w-2xl mx-auto px-6 py-10">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Generate a Quiz</h2>
        <p className="text-slate-500 dark:text-zinc-400 mb-6">Paste notes, or upload photos, PDFs, or text files — you can add several.</p>

        <form onSubmit={handleGenerate} className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-orange-500/20 rounded-2xl p-6 shadow-sm">
            <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Paste your study notes here..."
                rows={6}
                className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-orange-500 resize-none"
            />

            <div className="text-center text-slate-400 dark:text-zinc-600 text-sm my-3">— and/or —</div>

            <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className={`border-2 border-dashed rounded-xl px-4 py-8 text-center cursor-pointer transition ${
                    dragActive ? 'border-indigo-400 dark:border-orange-500 bg-indigo-50 dark:bg-orange-500/10' : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
            >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.txt,.jpg,.jpeg,.png"
                            multiple
                            className="hidden"
                            onChange={(e) => addFiles(e.target.files)}
                        />
                                       <p className="text-slate-500">
                    Drag & drop photos, PDFs, or text files here, or click to browse (multiple allowed)
                </p>
            </div>

            {files.length > 0 && (
                <div className="mt-3 space-y-2">
                    {files.map((f, i) => (
                        <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                            <span className="flex items-center gap-2 text-sm text-indigo-600 truncate">
                                <FileText className="w-4 h-4 shrink-0" /> {f.name}
                            </span>
                            <button
                                type="button"
                                onClick={() => removeFile(i)}
                                className="text-slate-400 hover:text-red-500"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4">
                <label className="text-slate-700 text-sm font-medium block mb-2">
                    Number of questions: <span className="text-indigo-600 font-bold">{numQuestions}</span>
                </label>
                <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>5</span>
                    <span>50</span>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 transition"
            >
                {loading ? 'Generating...' : 'Generate Quiz'}
            </button>
        </form>

        {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2 mt-4">
                {error}
            </div>
        )}

              {quiz && (
    <div className="mt-8 space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Your Quiz</h3>

        {submitted && (
            <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-orange-500/20 rounded-2xl p-6 shadow-sm flex gap-6">
                <div>
                    <p className="text-slate-500 dark:text-zinc-400 text-sm">Correct</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{quiz.correct_count}</p>
                </div>
                <div>
                    <p className="text-slate-500 dark:text-zinc-400 text-sm">Wrong</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{quiz.wrong_count}</p>
                </div>
            </div>
        )}

        {quiz.questions.map((q, index) => {
            const selected = selectedAnswers[index];
            const isCorrect = submitted && selected === q.answer;
            const isWrong = submitted && selected && selected !== q.answer;

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
                                            const isTheCorrectAnswer = option === q.answer;

                                                                       let optionStyle = 'bg-slate-50 dark:bg-black text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-800';
                            if (submitted) {
                                if (isTheCorrectAnswer) {
                                    optionStyle = 'bg-green-50 dark:bg-green-500/10 border-green-300 dark:border-green-500/30 text-green-700 dark:text-green-400 font-medium';
                                } else if (isSelected) {
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
                                                                                       className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition ${optionStyle} ${!submitted ? 'hover:border-indigo-400 dark:hover:border-orange-500 cursor-pointer' : 'cursor-default'}`}
                                                >
                                                    {option}
                                                </button>
                                            );
                                        })}
                                    </div>

                                                       {isWrong && (
                        <div className="mt-3">
                            {explanations[index] ? (
                                <p className="text-sm text-slate-600 dark:text-zinc-400 bg-slate-50 dark:bg-black rounded-lg px-3 py-2">
                                    {explanations[index]}
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

                                               {!submitted && (
                            <button
                                onClick={handleSubmitQuiz}
                                disabled={submitting}
                                className="w-full bg-indigo-600 dark:bg-orange-600 hover:bg-indigo-700 dark:hover:bg-orange-500 disabled:opacity-50 text-white font-semibold rounded-xl py-3 transition"
                            >
                                {submitting ? 'Submitting...' : 'Submit Quiz'}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default QuizGenerator;