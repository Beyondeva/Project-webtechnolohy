import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useThemeClasses } from '../hooks/useThemeClasses';
import api from '../api';
import { Wrench, User, Lock, AlertCircle, Loader2, Sun, Moon } from 'lucide-react';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const t = useThemeClasses();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const { data } = await api.post('/login', { username, password });
            login(data);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen ${t.pageBg} flex items-center justify-center px-4`}>
            {/* Theme toggle */}
            <button
                onClick={toggleTheme}
                className={`fixed top-4 right-4 p-2.5 rounded-xl transition-all duration-200 z-50 ${isDark
                    ? 'bg-white/10 border border-white/10 text-amber-300 hover:bg-amber-500/20'
                    : 'bg-white border border-gray-200 text-indigo-600 hover:bg-indigo-50 shadow-md'
                    }`}
                title={isDark ? 'เปลี่ยนเป็นธีมสว่าง' : 'เปลี่ยนเป็นธีมมืด'}
            >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Ambient glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-1/4 left-1/4 w-96 h-96 ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-500/20'} rounded-full blur-3xl`}></div>
                <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 ${isDark ? 'bg-purple-500/10' : 'bg-purple-500/15'} rounded-full blur-3xl`}></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/30 mb-4">
                        <Wrench size={32} className="text-white" />
                    </div>
                    <h1 className={`text-3xl font-bold ${t.titleGradient}`}>
                        DormFix
                    </h1>
                    <p className={`${t.textSecondary} mt-2`}>ระบบแจ้งซ่อมหอพัก</p>
                </div>

                {/* Card */}
                <div className={`${t.card} rounded-2xl p-8 shadow-2xl`}>
                    <h2 className={`text-xl font-semibold ${t.textPrimary} mb-6 text-center`}>เข้าสู่ระบบ</h2>

                    {error && (
                        <div className={`mb-4 p-3 ${t.errorBg} rounded-xl flex items-center gap-2 text-sm`}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className={`block text-sm font-medium ${t.textLabel} mb-2`}>ชื่อผู้ใช้</label>
                            <div className="relative">
                                <User size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.textMuted}`} />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="กรอกชื่อผู้ใช้"
                                    required
                                    className={`w-full ${t.input} rounded-xl py-3 pl-10 pr-4 ${t.inputFocus} transition-all`}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={`block text-sm font-medium ${t.textLabel} mb-2`}>รหัสผ่าน</label>
                            <div className="relative">
                                <Lock size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${t.textMuted}`} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="กรอกรหัสผ่าน"
                                    required
                                    className={`w-full ${t.input} rounded-xl py-3 pl-10 pr-4 ${t.inputFocus} transition-all`}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    กำลังเข้าสู่ระบบ...
                                </>
                            ) : (
                                'เข้าสู่ระบบ'
                            )}
                        </button>
                    </form>

                    {/* Demo credentials */}
                    <div className={`mt-6 p-4 rounded-xl border ${t.demoBg}`}>
                        <p className={`text-xs ${t.textSecondary} mb-3 font-medium`}>บัญชีทดสอบ:</p>
                        <div className={`space-y-1.5 text-xs ${t.demoText}`}>
                            <p><span className="text-indigo-400">ผู้พักอาศัย:</span> user1 / pass1</p>
                            <p><span className="text-amber-400">ช่างซ่อม:</span> tech1 / pass1</p>
                            <p><span className="text-rose-400">ผู้ดูแล:</span> admin / admin123</p>
                        </div>
                    </div>

                    <div className="mt-6 text-center">
                        <p className={`text-sm ${t.textSecondary}`}>
                            ยังไม่มีบัญชี?{' '}
                            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline">
                                สมัครสมาชิก
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
