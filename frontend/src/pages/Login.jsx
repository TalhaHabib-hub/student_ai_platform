import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import api from '../api';

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
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-indigo-200 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-200 rounded-full blur-3xl opacity-50"></div>

            <div className="relative bg-white shadow-xl rounded-3xl p-8 w-full max-w-md border border-slate-100">
                <Link to="/" className="flex items-center gap-2 mb-6">
                    <GraduationCap className="w-7 h-7 text-indigo-600" />
                    <span className="text-lg font-bold text-slate-900">StudyMate<span className="text-indigo-600">AI</span></span>
                </Link>

                <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
                <p className="text-slate-500 mb-6">Log in to continue learning</p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2 mb-4">
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
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                    />
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-2.5 transition"
                    >
                        Log In
                    </button>
                </form>

                <p className="text-sm text-slate-500 mt-6 text-center">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-indigo-600 font-medium hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;