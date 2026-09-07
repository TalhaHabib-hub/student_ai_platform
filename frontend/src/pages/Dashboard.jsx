import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Dashboard() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        api.get('/user', {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => setUser(response.data))
        .catch(() => {
            localStorage.removeItem('token');
            navigate('/login');
        });
    }, []);

    const handleLogout = async () => {
        const token = localStorage.getItem('token');
        try {
            await api.post('/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
        } catch (e) {}
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] text-gray-400">
            Loading...
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f0f1a]">
            <nav className="border-b border-white/10 px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    StudyMate AI
                </h1>
                <button
                    onClick={handleLogout}
                    className="text-sm text-gray-400 hover:text-red-400 transition"
                >
                    Log Out
                </button>
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-10">
                <h2 className="text-3xl font-bold text-white mb-1">Welcome, {user.name} 👋</h2>
                <p className="text-gray-400 mb-8">{user.email}</p>

                <div className="grid sm:grid-cols-2 gap-6">
                    <Link
                        to="/quiz"
                        className="group bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-600/10"
                    >
                        <div className="text-3xl mb-3">📝</div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition">Generate a Quiz</h3>
                        <p className="text-gray-400 text-sm mt-1">Turn your notes into a practice quiz using AI.</p>
                    </Link>

                    <Link
                        to="/my-quizzes"
                        className="group bg-white/5 hover:bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-600/10"
                    >
                        <div className="text-3xl mb-3">📚</div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-purple-400 transition">My Quizzes</h3>
                        <p className="text-gray-400 text-sm mt-1">Review quizzes you've already generated.</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;