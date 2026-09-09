import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import api from '../api';
import ThemeToggle from '../components/ThemeToggle';

function MyPaperTests() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        api.get('/paper-tests', {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => setTests(response.data))
        .catch(() => setError('Could not load your paper tests.'))
        .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm('Delete this paper test?')) return;

        const token = localStorage.getItem('token');
        try {
            await api.delete(`/paper-tests/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setTests(tests.filter((t) => t.id !== id));
        } catch (err) {
            alert('Could not delete paper test.');
        }
    };

    const formatTime = (totalSeconds) => {
        if (totalSeconds == null) return '—';
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black text-slate-400 dark:text-zinc-500">
        Loading your paper tests...
    </div>
);

return (
    <div className="min-h-screen bg-slate-50 dark:bg-black transition-colors">
        <nav className="bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-orange-500/20 px-6 py-4 flex justify-between items-center">
            <Link to="/dashboard" className="text-indigo-600 dark:text-orange-500 hover:text-indigo-700 dark:hover:text-orange-400 font-medium">← Back to Dashboard</Link>
            <ThemeToggle />
        </nav>

        <div className="max-w-2xl mx-auto px-6 py-10">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">My Paper Tests</h2>
                <Link
                    to="/paper-upload"
                    className="text-sm bg-indigo-600 dark:bg-orange-600 hover:bg-indigo-700 dark:hover:bg-orange-500 text-white font-semibold rounded-xl px-4 py-2 transition"
                >
                    + New Paper
                </Link>
            </div>

            {error && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-2 mb-4">
                    {error}
                </div>
            )}

            {tests.length === 0 && !error && (
                <p className="text-slate-500 dark:text-zinc-400">You haven't uploaded any paper tests yet.</p>
            )}

            <div className="space-y-4">
                {tests.map((test) => {
                    const attempted = test.correct_count !== null;

                    return (
                        <Link
                            key={test.id}
                            to={`/paper-test/${test.id}`}
                            className="block bg-white dark:bg-zinc-950 border border-slate-200 dark:border-orange-500/20 rounded-xl p-5 shadow-sm hover:shadow-md transition"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{test.title}</p>
                                    <p className="text-xs text-slate-400 dark:text-zinc-500 mt-1">
                                        {new Date(test.created_at).toLocaleString()} · {test.questions.length} questions
                                    </p>

                                    {attempted ? (
                                        <div className="flex items-center gap-4 mt-3 text-sm">
                                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                <CheckCircle2 className="w-4 h-4" /> {test.correct_count}
                                            </span>
                                            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                                                <XCircle className="w-4 h-4" /> {test.wrong_count}
                                            </span>
                                            <span className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
                                                <Clock className="w-4 h-4" /> {formatTime(test.time_taken_seconds)}
                                            </span>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-indigo-600 dark:text-orange-500 mt-3">Not attempted yet — click to start</p>
                                    )}
                                </div>

                                <button
                                    onClick={(e) => handleDelete(test.id, e)}
                                    className="text-red-500 dark:text-red-400 hover:text-red-600 shrink-0 ml-3"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    </div>
);
}

export default MyPaperTests;