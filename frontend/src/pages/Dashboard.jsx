import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, ScanLine, GraduationCap } from 'lucide-react';
import ProfileMenu from '../components/ProfileMenu';
import api from '../api';
import ThemeToggle from '../components/ThemeToggle';

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

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400">
            Loading...
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <GraduationCap className="w-6 h-6 text-indigo-600" />
                    <span className="text-lg font-bold text-slate-900">StudyMate<span className="text-indigo-600">AI</span></span>
                </div>
<div className="flex items-center gap-3">
        <ThemeToggle />
        
    </div>
                <ProfileMenu user={user} />
            </nav>

            <div className="max-w-4xl mx-auto px-6 py-10">
                <h2 className="text-3xl font-bold text-slate-900 mb-1">Welcome, {user.name}</h2>
                <p className="text-slate-500 mb-8">{user.email}</p>

                <div className="grid sm:grid-cols-2 gap-6">
                    <Link
                        to="/my-quizzes"
                        className="group bg-white hover:shadow-lg border border-slate-200 rounded-2xl p-6 transition hover:-translate-y-1"
                    >
                        <FileText className="w-8 h-8 mb-3 text-indigo-600" />
                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition">Generate a Quiz</h3>
                        <p className="text-slate-500 text-sm mt-1">Turn your notes into a practice quiz using AI.</p>
                    </Link>

                    <Link
                        to="/my-paper-tests"
                        className="group bg-white hover:shadow-lg border border-slate-200 rounded-2xl p-6 transition hover:-translate-y-1"
                    >
                        <ScanLine className="w-8 h-8 mb-3 text-purple-600" />
                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-purple-600 transition">Digital Paper Sheet</h3>
                        <p className="text-slate-500 text-sm mt-1">Upload an exam paper and take it as an interactive test.</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;