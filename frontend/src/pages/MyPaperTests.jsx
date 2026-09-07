import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Clock, CheckCircle2, XCircle } from 'lucide-react';
import api from '../api';

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
        <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] text-gray-400">
            Loading your paper tests...
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f0f1a]">
            <nav className="border-b border-white/10 px-6 py-4">
                <Link to="/dashboard" className="text-indigo-400 hover:text-indigo-300 font-medium">← Back to Dashboard</Link>
            </nav>

            <div className="max-w-2xl mx-auto px-6 py-10">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-white">My Paper Tests</h2>
                    <Link
                        to="/paper-upload"
                        className="text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-lg px-4 py-2 transition shadow-lg shadow-indigo-600/30"
                    >
                        + New Paper
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-2 mb-4">
                        {error}
                    </div>
                )}

                {tests.length === 0 && !error && (
                    <p className="text-gray-400">You haven't uploaded any paper tests yet.</p>
                )}

                <div className="space-y-4">
                    {tests.map((test) => {
                        const attempted = test.correct_count !== null;

                        return (
                            <Link
                                key={test.id}
                                to={`/paper-test/${test.id}`}
                                className="block bg-white/5 backdrop-blur border border-white/10 rounded-xl p-5 hover:bg-white/10 transition"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-white">{test.title}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(test.created_at).toLocaleString()} · {test.questions.length} questions
                                        </p>

                                        {attempted ? (
                                            <div className="flex items-center gap-4 mt-3 text-sm">
                                                <span className="flex items-center gap-1 text-green-400">
                                                    <CheckCircle2 className="w-4 h-4" /> {test.correct_count}
                                                </span>
                                                <span className="flex items-center gap-1 text-red-400">
                                                    <XCircle className="w-4 h-4" /> {test.wrong_count}
                                                </span>
                                                <span className="flex items-center gap-1 text-gray-400">
                                                    <Clock className="w-4 h-4" /> {formatTime(test.time_taken_seconds)}
                                                </span>
                                            </div>
                                        ) : (
                                            <p className="text-xs text-indigo-400 mt-3">Not attempted yet — click to start</p>
                                        )}
                                    </div>

                                    <button
                                        onClick={(e) => handleDelete(test.id, e)}
                                        className="text-red-400 hover:text-red-300 shrink-0 ml-3"
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