import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Compass, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import api from '../api';

function Roadmap() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const load = () => {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        api.get('/stats/roadmap', {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => setData(response.data))
        .catch(() => setError('Could not generate your roadmap.'))
        .finally(() => setLoading(false));
    };

    useEffect(() => {
        load();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black transition-colors">
            <nav className="bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-orange-500/20 px-6 py-4 flex justify-between items-center">
                <Link to="/dashboard" className="text-indigo-600 dark:text-orange-500 hover:text-indigo-700 dark:hover:text-orange-400 font-medium">← Back to Dashboard</Link>
                <ThemeToggle />
            </nav>

            <div className="max-w-2xl mx-auto px-6 py-10">
                <div className="flex justify-between items-center mb-1">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Compass className="w-7 h-7 text-indigo-600 dark:text-orange-500" /> Your Roadmap
                    </h2>
                    <button
                        onClick={load}
                        disabled={loading}
                        className="flex items-center gap-1 text-sm text-indigo-600 dark:text-orange-500 hover:text-indigo-700 dark:hover:text-orange-400 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                </div>
                <p className="text-slate-500 dark:text-zinc-400 mb-8">AI-generated strengths, weaknesses, and next steps based on your mistakes so far.</p>

                {loading && <p className="text-slate-500 dark:text-zinc-400">Analyzing your past attempts...</p>}

                {error && (
                    <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-2">
                        {error}
                    </div>
                )}

                {!loading && data && data.has_data === false && (
                    <p className="text-slate-500 dark:text-zinc-400">{data.message}</p>
                )}

                {!loading && data && data.has_data && (
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-orange-500/20 rounded-2xl p-6 shadow-sm">
                            <h3 className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold mb-3">
                                <CheckCircle2 className="w-5 h-5" /> Strengths
                            </h3>
                            <ul className="space-y-2">
                                {data.strengths.map((s, i) => (
                                    <li key={i} className="text-slate-700 dark:text-zinc-300 text-sm bg-green-50 dark:bg-green-500/10 rounded-lg px-3 py-2">{s}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-orange-500/20 rounded-2xl p-6 shadow-sm">
                            <h3 className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold mb-3">
                                <AlertTriangle className="w-5 h-5" /> Weaknesses
                            </h3>
                            <ul className="space-y-2">
                                {data.weaknesses.map((w, i) => (
                                    <li key={i} className="text-slate-700 dark:text-zinc-300 text-sm bg-red-50 dark:bg-red-500/10 rounded-lg px-3 py-2">{w}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-orange-500/20 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-slate-900 dark:text-white font-semibold mb-3">Suggested Roadmap</h3>
                            <div className="space-y-3">
                                {data.roadmap.map((step, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="w-6 h-6 rounded-full bg-indigo-600 dark:bg-orange-600 text-white text-xs flex items-center justify-center shrink-0 mt-0.5">{i + 1}</div>
                                        <div>
                                            <p className="text-slate-900 dark:text-white font-medium text-sm">{step.step}</p>
                                            <p className="text-slate-500 dark:text-zinc-400 text-xs mt-0.5">{step.why}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Roadmap;