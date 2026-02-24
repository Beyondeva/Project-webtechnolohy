import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useThemeClasses } from '../hooks/useThemeClasses';
import { getImageUrl } from '../api';
import { LogOut, Wrench, LayoutDashboard, Users, Plus, Sun, Moon } from 'lucide-react';

const roleLabels = {
    user: 'ผู้พักอาศัย',
    technician: 'ช่างซ่อม',
    admin: 'ผู้ดูแลระบบ',
};

export default function Navbar() {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const t = useThemeClasses();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const navLinkBase =
        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200';

    return (
        <nav className={`${t.navBg} shadow-2xl`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
                            <Wrench size={18} className="text-white" />
                        </div>
                        <span className={`text-lg font-bold ${t.logoText} hidden sm:block`}>
                            DormFix
                        </span>
                    </Link>

                    {/* Nav Links */}
                    <div className="flex items-center gap-2">
                        <Link
                            to="/dashboard"
                            className={`${navLinkBase} ${isActive('/dashboard') ? t.navLinkActive : t.navLinkInactive}`}
                        >
                            <LayoutDashboard size={16} />
                            <span className="hidden sm:inline">แดชบอร์ด</span>
                        </Link>

                        {user?.role === 'user' && (
                            <Link
                                to="/create-ticket"
                                className={`${navLinkBase} ${isActive('/create-ticket') ? t.navLinkActive : t.navLinkInactive}`}
                            >
                                <Plus size={16} />
                                <span className="hidden sm:inline">แจ้งซ่อม</span>
                            </Link>
                        )}

                        {user?.role === 'admin' && (
                            <Link
                                to="/users"
                                className={`${navLinkBase} ${isActive('/users') ? t.navLinkActive : t.navLinkInactive}`}
                            >
                                <Users size={16} />
                                <span className="hidden sm:inline">ผู้ใช้งาน</span>
                            </Link>
                        )}
                    </div>

                    {/* Right: Theme Toggle + User Info + Logout */}
                    <div className="flex items-center gap-3">
                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-lg transition-all duration-200 ${isDark
                                ? 'bg-white/5 border border-white/10 text-amber-300 hover:bg-amber-500/20'
                                : 'bg-gray-100 border border-gray-200 text-indigo-600 hover:bg-indigo-50'
                                }`}
                            title={isDark ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'}
                        >
                            {isDark ? <Sun size={16} /> : <Moon size={16} />}
                        </button>

                        <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            {user?.avatar ? (
                                <img
                                    src={getImageUrl(user.avatar)}
                                    alt="avatar"
                                    className={`w-9 h-9 rounded-full object-cover border-2 ${isDark ? 'border-white/20' : 'border-gray-300'}`}
                                />
                            ) : (
                                <div className={`w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm border-2 ${isDark ? 'border-white/20' : 'border-gray-300'}`}>
                                    {user?.name?.charAt(0)}
                                </div>
                            )}
                            <div className="text-right hidden sm:block">
                                <p className={`text-sm font-medium ${t.textPrimary}`}>{user?.name}</p>
                                <span
                                    className={`inline-block px-2 py-0.5 text-xs rounded-full border ${t.roleBadgeColors[user?.role]}`}
                                >
                                    {roleLabels[user?.role]}
                                </span>
                            </div>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${t.btnLogout}`}
                        >
                            <LogOut size={16} />
                            <span className="hidden sm:inline">ออก</span>
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
