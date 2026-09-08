import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

function Settings() {
    const [confirmText, setConfirmText] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleDeleteAccount = async () => {
        if (confirmText !== 'DELETE') {
            setError('Please type DELETE to confirm.');
            return;
        }

        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');

        try {
            await api.delete('/account', {
                headers: { Authorization: `Bearer ${token}` },
            });
            localStorage.removeItem('token');
            navigate('/register');
        } catch (err) {
            setError('Could not delete account. Try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white border-b border-slate-200 px-6 py-4">
                <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-700 font-medium">← Back to Dashboard</Link>
            </nav>

            <div className="max-w-xl mx-auto px-6 py-10">
                <h2 className="text-3xl font-bold text-slate-900 mb-1">Settings</h2>
                <p className="text-slate-500 mb-8">Manage your account</p>

                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Profile Photo</h3>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            const token = localStorage.getItem('token');
                            const formData = new FormData();
                            formData.append('photo', file);
                            try {
                                await api.post('/profile-photo', formData, {
                                    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
                                });
                                window.location.reload();
                            } catch (err) {
                                alert('Could not upload photo.');
                            }
                        }}
                        className="text-slate-600 text-sm"
                    />
                </div>

                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-red-600 mb-2">Delete Account</h3>
                    <p className="text-slate-500 text-sm mb-4">
                        This permanently deletes your account and all your quizzes. This cannot be undone.
                    </p>

                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder='Type "DELETE" to confirm'
                        className="w-full bg-white border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-400 mb-3"
                    />

                    {error && (
                        <p className="text-red-600 text-sm mb-3">{error}</p>
                    )}

                    <button
                        onClick={handleDeleteAccount}
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 transition"
                    >
                        {loading ? 'Deleting...' : 'Delete My Account'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Settings;