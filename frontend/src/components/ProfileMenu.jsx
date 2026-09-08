import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Settings as SettingsIcon, LogOut } from 'lucide-react';
import api from '../api';

function ProfileMenu({ user }) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        const token = localStorage.getItem('token');
        try {
            await api.post('/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
        } catch (e) {}
        localStorage.removeItem('token');
        navigate('/login');
    };

    const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setOpen(!open)}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200 hover:border-indigo-400 transition flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-500"
            >
                {user.profile_photo_url ? (
                    <img
                        src={user.profile_photo_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-white font-semibold">{initial}</span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-slate-900 font-medium text-sm truncate">{user.name}</p>
                        <p className="text-slate-500 text-xs truncate">{user.email}</p>
                    </div>
                    <Link
                        to="/settings"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                        <SettingsIcon className="w-4 h-4" /> Settings
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                        <LogOut className="w-4 h-4" /> Log Out
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProfileMenu;