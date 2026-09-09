import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import api from '../api';
import ThemeToggle from '../components/ThemeToggle';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/login', { email, password });
            localStorage.setItem('token', response.data.token);
            navigate('/dashboard');
        } catch (err) {
            setError('Invalid email or password.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center px-4 relative overflow-hidden transition-colors">
    <div className="absolute -top-20 -left-20 w-72 h-72 bg-indigo-200 dark:bg-orange-900/30 rounded-full blur-3xl opacity-50"></div>
    <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-200 dark:bg-orange-900/20 rounded-full blur-3xl opacity-50"></div>

    <div className="absolute top-6 right-6">
        <ThemeToggle />
    </div>

    <div className="relative bg-white dark:bg-zinc-950 shadow-xl rounded-3xl p-8 w-full max-w-md border border-slate-100 dark:border-orange-500/20">
        <Link to="/" className="flex items-center gap-2 mb-6">
            <GraduationCap className="w-7 h-7 text-indigo-600 dark:text-orange-500" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">StudyMate<span className="text-indigo-600 dark:text-orange-500">AI</span></span>
        </Link>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Welcome back</h2>
        <p className="text-slate-500 dark:text-zinc-400 mb-6">Log in to continue learning</p>

        {error && (
            <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-2 mb-4">
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-orange-500 focus:border-transparent"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-black border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-orange-500 focus:border-transparent"
            />
            <button
                type="submit"
                className="w-full bg-indigo-600 dark:bg-orange-600 hover:bg-indigo-700 dark:hover:bg-orange-500 text-white font-semibold rounded-xl py-2.5 transition"
            >
                Log In
            </button>
        </form>

        <p className="text-sm text-slate-500 dark:text-zinc-400 mt-6 text-center">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 dark:text-orange-500 font-medium hover:underline">
                Register
            </Link>
        </p>
    </div>
</div>
    );
}

export default Login;