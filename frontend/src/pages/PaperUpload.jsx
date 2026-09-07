import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import api from '../api';

function PaperUpload() {
    const [file, setFile] = useState(null);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!file) {
            setError('Please upload a photo or PDF of the paper.');
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', title || 'Untitled Paper');

            const response = await api.post('/paper-tests/extract', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            navigate(`/paper-test/${response.data.id}`);
        } catch (err) {
            setError('Could not read the paper. Try a clearer photo.');
        } finally {
            setLoading(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f1a]">
            <nav className="border-b border-white/10 px-6 py-4">
                <Link to="/dashboard" className="text-indigo-400 hover:text-indigo-300 font-medium">← Back to Dashboard</Link>
            </nav>

            <div className="max-w-2xl mx-auto px-6 py-10">
                <h2 className="text-3xl font-bold text-white mb-1">Digital Paper Sheet</h2>
                <p className="text-gray-400 mb-6">Upload a photo or PDF of an exam paper and take it as an interactive test.</p>

                <form onSubmit={handleSubmit} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Paper title (e.g. MDCAT Biology Mock 25)"
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                        className={`border-2 border-dashed rounded-lg px-4 py-10 text-center cursor-pointer transition ${
                            dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/20 hover:border-white/40'
                        }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".jpg,.jpeg,.png,.pdf"
                            className="hidden"
                            onChange={(e) => setFile(e.target.files[0])}
                        />
                        {file ? (
                            <p className="text-indigo-400 font-medium flex items-center justify-center gap-2">
                                <FileText className="w-4 h-4" /> {file.name}
                            </p>
                        ) : (
                            <p className="text-gray-400">
                                Drag & drop a photo or PDF of the paper, or click to browse
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 transition shadow-lg shadow-indigo-600/30"
                    >
                        {loading ? 'Reading paper...' : 'Read Paper & Start Test'}
                    </button>
                </form>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-2 mt-4">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PaperUpload;