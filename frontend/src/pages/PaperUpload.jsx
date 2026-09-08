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
        <div className="min-h-screen bg-slate-50">
            <nav className="bg-white border-b border-slate-200 px-6 py-4">
                <Link to="/my-paper-tests" className="text-indigo-600 hover:text-indigo-700 font-medium">← Back to My Paper Tests</Link>
            </nav>

            <div className="max-w-2xl mx-auto px-6 py-10">
                <h2 className="text-3xl font-bold text-slate-900 mb-1">Digital Paper Sheet</h2>
                <p className="text-slate-500 mb-6">Upload a photo or PDF of an exam paper and take it as an interactive test.</p>

                <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Paper title (e.g. MDCAT Biology Mock 25)"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl px-4 py-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />

                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                        className={`border-2 border-dashed rounded-xl px-4 py-10 text-center cursor-pointer transition ${
                            dragActive ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-slate-300'
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
                            <p className="text-indigo-600 font-medium flex items-center justify-center gap-2">
                                <FileText className="w-4 h-4" /> {file.name}
                            </p>
                        ) : (
                            <p className="text-slate-500">
                                Drag & drop a photo or PDF of the paper, or click to browse
                            </p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 transition"
                    >
                        {loading ? 'Reading paper...' : 'Read Paper & Start Test'}
                    </button>
                </form>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2 mt-4">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PaperUpload;