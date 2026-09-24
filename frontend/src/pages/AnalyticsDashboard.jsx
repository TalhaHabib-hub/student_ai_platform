import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import {
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import ThemeToggle from '../components/ThemeToggle';
import api from '../api';

const COLORS = ['#22c55e', '#ef4444'];

function AnalyticsDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        api.get('/stats/overview', {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => setStats(response.data))
        .catch(() => setError('Could not load your stats.'))
        .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black text-slate-400 dark:text-zinc-500">
            Loading your dashboard...
        </div>
    );

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-black text-red-600 dark:text-red-400">
            {error}
        </div>
    );

    const pieData = [
        { name: 'Correct', value: stats.total_correct },
        { name: 'Wrong', value: stats.total_wrong },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black transition-colors">
            <nav className="bg-white dark:bg-zinc-950 border-b border-slate-200 dark:border-orange-500/20 px-6 py-4 flex justify-between items-center">
                <Link to="/dashboard" className="text-indigo-600 dark:text-orange-500 hover:text-indigo-700 dark:hover:text-orange-400 font-medium">← Back to Dashboard</Link>
                <ThemeToggle />
            </nav>

            <div className="max-w-5xl mx-auto px-6 py-10">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                    <BarChart3 className="w-7 h-7 text-indigo-600 dark:text-orange-500" /> Your Progress
                </h2>
                <p className="text-slate-500 dark:text-zinc-400 mb-8">A look at how you've been doing across all quizzes and paper tests.</p>

                {stats.total_attempts === 0 ? (
                    <p className="text-slate-500 dark:text-zinc-400">Take a quiz or paper test and submit it to start seeing your stats here.</p>
                ) : (
                    <>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <StatCard label="Attempts" value={stats.total_attempts} />
                            <StatCard label="Questions Answered" value={stats.total_questions} />
                            <StatCard label="Accuracy" value={`${stats.accuracy}%`} accent />
                            <StatCard label="Wrong Answers" value={stats.total_wrong} />
                        </div>

                        <div className="grid lg:grid-cols-2 gap-6 mb-6">
                            <ChartCard title="Correct vs Wrong">
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={4}>
                                            {pieData.map((entry, i) => <Cell key={i} fill={COLORS[i]} />)}
                                        </Pie>
                                        <Legend />
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartCard>

                            <ChartCard title="Attempts by Weekday">
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={stats.by_weekday}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                        <XAxis dataKey="day" stroke="#888" fontSize={12} />
                                        <YAxis allowDecimals={false} stroke="#888" fontSize={12} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartCard>
                        </div>

                        <ChartCard title="Accuracy Trend (Last 10 Attempts)">
                            <ResponsiveContainer width="100%" height={260}>
                                <LineChart data={stats.trend}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                    <XAxis dataKey="date" stroke="#888" fontSize={12} />
                                    <YAxis domain={[0, 100]} stroke="#888" fontSize={12} unit="%" />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="accuracy" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Recent Attempts</h3>
                            <div className="space-y-2">
                                {stats.recent_attempts.map((a, i) => (
                                    <div key={i} className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-orange-500/20 rounded-xl px-4 py-3 flex justify-between items-center text-sm">
                                        <div>
                                            <span className="font-medium text-slate-900 dark:text-white">{a.type}</span>
                                            <span className="text-slate-400 dark:text-zinc-500"> · {a.title}</span>
                                        </div>
                                        <span className="text-slate-500 dark:text-zinc-400">{a.correct}/{a.correct + a.wrong} correct</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function StatCard({ label, value, accent }) {
    return (
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-orange-500/20 rounded-2xl p-5 shadow-sm">
            <p className="text-slate-500 dark:text-zinc-400 text-sm">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${accent ? 'text-indigo-600 dark:text-orange-500' : 'text-slate-900 dark:text-white'}`}>{value}</p>
        </div>
    );
}

function ChartCard({ title, children }) {
    return (
        <div className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-orange-500/20 rounded-2xl p-6 shadow-sm">
            <h3 className="text-slate-900 dark:text-white font-semibold mb-4">{title}</h3>
            {children}
        </div>
    );
}

export default AnalyticsDashboard;