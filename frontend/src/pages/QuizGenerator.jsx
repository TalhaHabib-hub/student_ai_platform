import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function QuizGenerator() {
    const [notes, setNotes] = useState('');
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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

        try {
            const response = await api.post(
                '/generate-quiz',
                { notes },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setQuiz(response.data);
        } catch (err) {
            setError('Could not generate quiz. Try shorter or clearer notes.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f1a]">
            <nav className="border-b border-white/10 px-6 py-4">
                <Link to="/dashboard" className="text-indigo-400 hover:text-indigo-300 font-medium">← Back to Dashboard</Link>
            </nav>

            <div className="max-w-2xl mx-auto px-6 py-10">
                <h2 className="text-3xl font-bold text-white mb-1">Generate a Quiz</h2>
                <p className="text-gray-400 mb-6">Paste your study notes and get an instant practice quiz.</p>

                <form onSubmit={handleGenerate} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Paste your study notes here..."
                        rows={8}
                        required
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 transition shadow-lg shadow-indigo-600/30"
                    >
                        {loading ? 'Generating...' : 'Generate Quiz'}
                    </button>
                </form>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-2 mt-4">
                        {error}
                    </div>
                )}

                {quiz && (
                    <div className="mt-8 space-y-4">
                        <h3 className="text-lg font-semibold text-white">Your Quiz</h3>
                        {quiz.questions.map((q, index) => (
                            <div key={index} className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-5">
                                <p className="font-medium text-white mb-3">{index + 1}. {q.question}</p>
                                <ul className="space-y-2">
                                    {q.options.map((option, i) => (
                                        <li
                                            key={i}
                                            className={`px-3 py-2 rounded-lg text-sm ${
                                                option === q.answer
                                                    ? 'bg-green-500/10 border border-green-500/30 text-green-400 font-medium'
                                                    : 'bg-white/5 text-gray-300'
                                            }`}
                                        >
                                            {option === q.answer ? '✓ ' : ''}{option}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default QuizGenerator;