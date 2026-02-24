import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../api';
import { LogOut, Wrench, LayoutDashboard, Users, Plus, UserCircle } from 'lucide-react';

const roleLabels = {
    user: 'ผู้พักอาศัย',
    technician: 'ช่างซ่อม',
    admin: 'ผู้ดูแลระบบ',
};

const roleBadgeColors = {
    user: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    technician: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    admin: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const navLinkBase =
        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200';
    const navLinkActive = 'bg-white/15 text-white shadow-lg shadow-white/5';
    const navLinkInactive = 'text-gray-300 hover:bg-white/10 hover:text-white';

    return (
        <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/10 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-shadow">
                            <Wrench size={18} className="text-white" />
                        </div>
                        <span className="text-lg font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent hidden sm:block">
                            DormFix
                        </span>
                    </Link>

                    {/* Nav Links */}
                    <div className="flex items-center gap-2">
                        <Link
                            to="/dashboard"
                            className={`${navLinkBase} ${isActive('/dashboard') ? navLinkActive : navLinkInactive}`}
                        >
                            <LayoutDashboard size={16} />
                            <span className="hidden sm:inline">แดชบอร์ด</span>
                        </Link>

                        {user?.role === 'user' && (
                            <Link
                                to="/create-ticket"
                                className={`${navLinkBase} ${isActive('/create-ticket') ? navLinkActive : navLinkInactive}`}
                            >
                                <Plus size={16} />
                                <span className="hidden sm:inline">แจ้งซ่อม</span>
                            </Link>
                        )}

                        {user?.role === 'admin' && (
                            <Link
                                to="/users"
                                className={`${navLinkBase} ${isActive('/users') ? navLinkActive : navLinkInactive}`}
                            >
                                <Users size={16} />
                                <span className="hidden sm:inline">ผู้ใช้งาน</span>
                            </Link>
                        )}
                    </div>

                    {/* User Info + Logout */}
                    <div className="flex items-center gap-3">
                        <Link to="/profile" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                            {user?.avatar ? (
                                <img
                                    src={getImageUrl(user.avatar)}
                                    alt="avatar"
                                    className="w-9 h-9 rounded-full object-cover border-2 border-white/20"
                                />
                            ) : (
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white/20">
                                    {user?.name?.charAt(0)}
                                </div>
                            )}
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-white">{user?.name}</p>
                                <span
                                    className={`inline-block px-2 py-0.5 text-xs rounded-full border ${roleBadgeColors[user?.role]}`}
                                >
                                    {roleLabels[user?.role]}
                                </span>
                            </div>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 transition-all duration-200 text-sm"
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
