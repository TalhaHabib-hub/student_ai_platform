import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import QuizGenerator from './pages/QuizGenerator';
import MyQuizzes from './pages/MyQuizzes';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/quiz" element={<QuizGenerator />} />
                <Route path="/my-quizzes" element={<MyQuizzes />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;