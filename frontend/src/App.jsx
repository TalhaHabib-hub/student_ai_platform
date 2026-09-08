import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import QuizGenerator from './pages/QuizGenerator';
import MyQuizzes from './pages/MyQuizzes';
import Settings from './pages/Settings';
import PaperUpload from './pages/PaperUpload';
import PaperTest from './pages/PaperTest';
import MyPaperTests from './pages/MyPaperTests';
import Landing from './pages/Landing';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                
                <Route path="/my-paper-tests" element={<MyPaperTests />} />
                <Route path="/paper-test/:id" element={<PaperTest />} />
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/quiz" element={<QuizGenerator />} />
                <Route path="/my-quizzes" element={<MyQuizzes />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/paper-upload" element={<PaperUpload />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;