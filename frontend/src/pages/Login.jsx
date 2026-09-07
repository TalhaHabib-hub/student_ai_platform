import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
        <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] px-4 relative overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>

            <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-8 w-full max-w-md">
                <h2 className="text-3xl font-bold text-white mb-1">Welcome back</h2>
                <p className="text-gray-400 mb-6">Log in to continue learning</p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-2 mb-4">
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
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-lg py-2.5 transition shadow-lg shadow-indigo-600/30"
                    >
                        Log In
                    </button>
                </form>

                <p className="text-sm text-gray-400 mt-6 text-center">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-indigo-400 font-medium hover:text-indigo-300">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;