import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

function ThemeToggle() {
    const { darkMode, setDarkMode } = useTheme();

    return (
        <button
            onClick={() => setDarkMode(!darkMode)}
            className="w-10 h-10 rounded-full flex items-center justify-center border border-slate-200 dark:border-orange-500/30 bg-white dark:bg-black hover:bg-slate-50 dark:hover:bg-zinc-900 transition"
        >
            {darkMode ? (
                <Sun className="w-4 h-4 text-orange-400" />
            ) : (
                <Moon className="w-4 h-4 text-slate-600" />
            )}
        </button>
    );
}

export default ThemeToggle;