import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { Trash2, ChevronUp, ChevronDown } from 'lucide-react';

function MyQuizzes() {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openQuizId, setOpenQuizId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        api.get('/quizzes', {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => setQuizzes(response.data))
        .catch(() => setError('Could not load your quizzes.'))
        .finally(() => setLoading(false));
    }, []);

    const toggleQuiz = (id) => {
        setOpenQuizId(openQuizId === id ? null : id);
    };
    const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this quiz?')) return;

    const token = localStorage.getItem('token');
    try {
        await api.delete(`/quizzes/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setQuizzes(quizzes.filter((q) => q.id !== id));
    } catch (err) {
        alert('Could not delete quiz.');
    }
};
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] text-gray-400">
            Loading your quizzes...
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f0f1a]">
            <nav className="border-b border-white/10 px-6 py-4">
                <Link to="/dashboard" className="text-indigo-400 hover:text-indigo-300 font-medium">← Back to Dashboard</Link>
            </nav>

            <div className="max-w-2xl mx-auto px-6 py-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-white">My Quizzes</h2>
                    <Link
                        to="/quiz"
                        className="text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-lg px-4 py-2 transition shadow-lg shadow-indigo-600/30"
                    >
                        + New Quiz
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-2 mb-4">
                        {error}
                    </div>
                )}

                {quizzes.length === 0 && !error && (
                    <p className="text-gray-400">You haven't generated any quizzes yet.</p>
                )}

                <div className="space-y-4">
                    {quizzes.map((quiz) => (
                        <div key={quiz.id} className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-5">
  <div
    onClick={() => toggleQuiz(quiz.id)}
    className="cursor-pointer flex justify-between items-start"
>
    <div>
        <p className="font-medium text-white">
            {quiz.source_notes.length > 60
                ? quiz.source_notes.slice(0, 60) + '...'
                : quiz.source_notes}
        </p>
        <p className="text-xs text-gray-500 mt-1">
            {new Date(quiz.created_at).toLocaleString()} · {quiz.questions.length} questions
        </p>
    </div>
    <div className="flex items-center gap-3">
        <button
    onClick={(e) => handleDelete(quiz.id, e)}
    className="text-red-400 hover:text-red-300"
>
    <Trash2 className="w-4 h-4" />
</button>
{openQuizId === quiz.id ? (
    <ChevronUp className="w-4 h-4 text-gray-500" />
) : (
    <ChevronDown className="w-4 h-4 text-gray-500" />
)}
    </div>
</div>

                            {openQuizId === quiz.id && (
                                <div className="mt-4 space-y-3 border-t border-white/10 pt-4">
                                    {quiz.questions.map((q, index) => (
                                        <div key={index}>
                                            <p className="font-medium text-gray-200 text-sm mb-2">{index + 1}. {q.question}</p>
                                            <ul className="space-y-1">
                                                {q.options.map((option, i) => (
                                                    <li
                                                        key={i}
                                                        className={`px-3 py-1.5 rounded-lg text-sm ${
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
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MyQuizzes;