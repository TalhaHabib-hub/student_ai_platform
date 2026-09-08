import { Link } from 'react-router-dom';
import { ArrowRight, Phone, Users, GraduationCap, BookOpen, Sparkles } from 'lucide-react';

function Landing() {
    return (
        <div className="min-h-screen bg-slate-50 overflow-x-hidden">
            {/* Nav */}
            <nav className="flex items-center justify-between px-6 sm:px-10 py-5 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <GraduationCap className="w-7 h-7 text-indigo-600" />
                    <span className="text-xl font-bold text-slate-900">StudyMate<span className="text-indigo-600">AI</span></span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-slate-600 font-medium">
                    <a href="#" className="text-indigo-600">Home</a>
                    <a href="#features" className="hover:text-indigo-600">Features</a>
                    <a href="#about" className="hover:text-indigo-600">About</a>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/login"
                        className="hidden sm:block px-5 py-2 rounded-full border border-slate-300 text-slate-700 font-medium hover:bg-slate-100 transition"
                    >
                        Log In
                    </Link>
                    <Link
                        to="/register"
                        className="px-5 py-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition"
                    >
                        Sign Up
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-10 pb-20 grid lg:grid-cols-2 gap-12 items-center">
                <div>
                    <span className="inline-block bg-indigo-100 text-indigo-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
                        AI-Powered Learning
                    </span>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                        Learn <span className="text-indigo-600">Smarter</span>, Not Harder
                    </h1>

                    <p className="text-slate-500 text-lg mb-8 max-w-lg">
                        Turn your notes into quizzes, scan exam papers into interactive tests, and get instant AI feedback — all in one place.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 mb-10">
                        <Link
                            to="/register"
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-full transition"
                        >
                            Get Started <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a href="#features" className="flex items-center gap-2 text-slate-600 font-medium">
                            <Phone className="w-4 h-4 text-indigo-600" />
                            Learn how it works
                        </a>
                    </div>

                    <div className="flex flex-wrap gap-8">
                        <div>
                            <p className="text-2xl font-bold text-slate-900">1000+</p>
                            <p className="text-slate-500 text-sm">Quizzes Generated</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">AI-Graded</p>
                            <p className="text-slate-500 text-sm">Instant Feedback</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">100%</p>
                            <p className="text-slate-500 text-sm">Free to Try</p>
                        </div>
                    </div>
                </div>

                <div className="relative flex justify-center">
                    <div className="absolute -top-10 -left-6 w-40 h-40 bg-indigo-200 rounded-full blur-3xl opacity-60"></div>
                    <div className="absolute -bottom-10 -right-6 w-48 h-48 bg-purple-200 rounded-full blur-3xl opacity-60"></div>

                    <img
                        src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=800&auto=format&fit=crop"
                        alt="Student studying"
                        className="relative rounded-3xl shadow-2xl w-full max-w-md object-cover"
                    />

                    <div className="absolute top-6 -left-4 sm:left-0 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
                        <div className="bg-green-100 text-green-600 rounded-full w-10 h-10 flex items-center justify-center">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Active Students</p>
                            <p className="font-bold text-slate-900">5.5K</p>
                        </div>
                    </div>

                    <div className="absolute bottom-6 -right-4 sm:right-0 bg-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
                        <div className="bg-indigo-100 text-indigo-600 rounded-full w-10 h-10 flex items-center justify-center">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">Quizzes Made</p>
                            <p className="font-bold text-slate-900">4K</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div id="features" className="max-w-7xl mx-auto px-6 sm:px-10 pb-24">
                <h2 className="text-3xl font-bold text-slate-900 text-center mb-3">What You Can Do</h2>
                <p className="text-slate-500 text-center mb-12">Everything you need to study smarter, powered by AI.</p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <BookOpen className="w-8 h-8 text-indigo-600 mb-4" />
                        <h3 className="font-semibold text-slate-900 mb-2">Generate Quizzes</h3>
                        <p className="text-slate-500 text-sm">Paste notes or upload files — AI turns them into practice quizzes instantly.</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <GraduationCap className="w-8 h-8 text-purple-600 mb-4" />
                        <h3 className="font-semibold text-slate-900 mb-2">Digital Paper Sheet</h3>
                        <p className="text-slate-500 text-sm">Scan a physical exam paper and take it as an interactive timed test.</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                        <Sparkles className="w-8 h-8 text-pink-600 mb-4" />
                        <h3 className="font-semibold text-slate-900 mb-2">AI Explanations</h3>
                        <p className="text-slate-500 text-sm">Got a question wrong? Get an instant, clear explanation why.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Landing;