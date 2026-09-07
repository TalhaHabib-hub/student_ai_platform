import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { FileText } from 'lucide-react';

function QuizGenerator() {
    const [notes, setNotes] = useState('');
    const [file, setFile] = useState(null);
    const [numQuestions, setNumQuestions] = useState(5);
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const handleGenerate = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setQuiz(null);

        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        if (!notes.trim() && !file) {
            setError('Please paste notes or upload a file.');
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            if (notes.trim()) formData.append('notes', notes);
            if (file) formData.append('file', file);
            formData.append('num_questions', numQuestions);

            const response = await api.post('/generate-quiz', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });
            setQuiz(response.data);
        } catch (err) {
            setError('Could not generate quiz. Try shorter notes or a smaller file.');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (selectedFile) => {
        if (selectedFile) {
            setFile(selectedFile);
            setNotes('');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f0f1a]">
            <nav className="border-b border-white/10 px-6 py-4">
                <Link to="/dashboard" className="text-indigo-400 hover:text-indigo-300 font-medium">← Back to Dashboard</Link>
            </nav>

            <div className="max-w-2xl mx-auto px-6 py-10">
                <h2 className="text-3xl font-bold text-white mb-1">Generate a Quiz</h2>
                <p className="text-gray-400 mb-6">Paste your notes or upload a PDF/text file.</p>

                <form onSubmit={handleGenerate} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
                    <textarea
                        value={notes}
                        onChange={(e) => { setNotes(e.target.value); setFile(null); }}
                        placeholder="Paste your study notes here..."
                        rows={6}
                        className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />

                    <div className="text-center text-gray-500 text-sm my-3">— or —</div>

                    <div
                        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current.click()}
                        className={`border-2 border-dashed rounded-lg px-4 py-8 text-center cursor-pointer transition ${
                            dragActive ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/20 hover:border-white/40'
                        }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.txt"
                            className="hidden"
                            onChange={(e) => handleFileSelect(e.target.files[0])}
                        />
                       {file ? (
    <p className="text-indigo-400 font-medium flex items-center justify-center gap-2">
        <FileText className="w-4 h-4" /> {file.name}
    </p>
) : (
                            <p className="text-gray-400">
                                Drag & drop a PDF or .txt file here, or click to browse
                            </p>
                        )}
                    </div>

                    <div className="mt-4">
                        <label className="text-gray-300 text-sm font-medium block mb-2">
                            Number of questions: <span className="text-indigo-400 font-bold">{numQuestions}</span>
                        </label>
                        <input
                            type="range"
                            min="5"
                            max="50"
                            step="5"
                            value={numQuestions}
                            onChange={(e) => setNumQuestions(Number(e.target.value))}
                            className="w-full accent-indigo-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>5</span>
                            <span>50</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-medium rounded-lg py-2.5 transition shadow-lg shadow-indigo-600/30"
                    >
                        {loading ? 'Generating...' : 'Generate Quiz'}
                    </button>
                </form>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-2 mt-4">
                        {error}
                    </div>
                )}

                {quiz && (
                    <div className="mt-8 space-y-4">
                        <h3 className="text-lg font-semibold text-white">Your Quiz</h3>
                        {quiz.questions.map((q, index) => (
                            <div key={index} className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-5">
                                <p className="font-medium text-white mb-3">{index + 1}. {q.question}</p>
                                <ul className="space-y-2">
                                    {q.options.map((option, i) => (
                                        <li
                                            key={i}
                                            className={`px-3 py-2 rounded-lg text-sm ${
                                                option === q.answer
                                                    ? 'bg-green-500/10 border border-green-500/30 text-green-400 font-medium'
                                                    : 'bg-white/5 text-gray-300'
                                            }`}
                                        >
                                            {option === q.answer ? '✓ ' : ''}{option}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default QuizGenerator;