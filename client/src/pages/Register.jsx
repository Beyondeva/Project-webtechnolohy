import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useThemeClasses } from '../hooks/useThemeClasses';
import api from '../api';
import {
    Loader2,
    User,
    Lock,
    AtSign,
    Phone,
    UserPlus,
    AlertCircle,
    CheckCircle2,
    X,
    Eye,
    EyeOff,
    Sun,
    Moon,
    Wrench,
} from 'lucide-react';

export default function Register() {
    const { isDark, toggleTheme } = useTheme();
    const t = useThemeClasses();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: '',
        password: '',
        name: '',
        phone: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.username || !form.password || !form.name) {
            setError('กรุณากรอก ชื่อผู้ใช้ รหัสผ่าน และ ชื่อ-นามสกุล');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await api.post('/register', form);
            setSuccess('สมัครสมาชิกสำเร็จ! กำลังไปหน้าเข้าสู่ระบบ...');
            setTimeout(() => navigate('/login'), 1500);
        } catch (err) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen ${t.pageBg} flex items-center justify-center px-4 relative`}>
            {/* Ambient glow */}
            <div className={`absolute inset-0 overflow-hidden pointer-events-none ${isDark ? 'opacity-100' : 'opacity-30'}`}>
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl" />
            </div>

            {/* Theme toggle */}
            <button onClick={toggleTheme}
                className={`fixed top-4 right-4 z-50 p-3 rounded-xl backdrop-blur transition-all ${isDark
                    ? 'bg-white/10 border border-white/20 text-yellow-300 hover:bg-white/20'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 shadow-md'}`}>
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <img src="/logo.png" alt="DormFix" className="w-16 h-16 rounded-2xl shadow-lg shadow-indigo-500/30 mb-4 mx-auto" />
                    <h1 className={`text-3xl font-bold ${t.titleGradient}`}>DormFix</h1>
                    <p className={`${t.textSecondary} mt-1`}>สมัครสมาชิกใหม่</p>
                </div>

                {/* Form Card */}
                <div className={`${t.card} rounded-2xl p-8 shadow-2xl`}>
                    {error && (
                        <div className={`mb-4 p-3 ${t.errorBg} rounded-xl flex items-center gap-2 text-sm`}>
                            <AlertCircle size={16} />
                            {error}
                            <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
                        </div>
                    )}
                    {success && (
                        <div className={`mb-4 p-3 ${t.successBg} rounded-xl flex items-center gap-2 text-sm`}>
                            <CheckCircle2 size={16} />
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className={`block text-xs ${t.textMuted} mb-2 flex items-center gap-1.5`}>
                                <User size={14} />
                                ชื่อ-นามสกุล <span className="text-red-400">*</span>
                            </label>
                            <input type="text" name="name" value={form.name} onChange={handleChange}
                                placeholder="เช่น สมชาย ใจดี"
                                className={`w-full ${t.input} rounded-xl py-3 px-4 ${t.inputFocus} transition-all`} />
                        </div>

                        {/* Username */}
                        <div>
                            <label className={`block text-xs ${t.textMuted} mb-2 flex items-center gap-1.5`}>
                                <AtSign size={14} />
                                ชื่อผู้ใช้ (สำหรับเข้าสู่ระบบ) <span className="text-red-400">*</span>
                            </label>
                            <input type="text" name="username" value={form.username} onChange={handleChange}
                                placeholder="เช่น somchai01"
                                className={`w-full ${t.input} rounded-xl py-3 px-4 ${t.inputFocus} transition-all`} />
                        </div>

                        {/* Password */}
                        <div>
                            <label className={`block text-xs ${t.textMuted} mb-2 flex items-center gap-1.5`}>
                                <Lock size={14} />
                                รหัสผ่าน <span className="text-red-400">*</span>
                            </label>
                            <div className="relative">
                                <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                                    placeholder="กำหนดรหัสผ่าน"
                                    className={`w-full ${t.input} rounded-xl py-3 px-4 pr-12 ${t.inputFocus} transition-all`} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${t.textMuted} hover:${t.textLabel} transition-colors`}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className={`block text-xs ${t.textMuted} mb-2 flex items-center gap-1.5`}>
                                <Phone size={14} />
                                เบอร์โทรศัพท์ (ไม่บังคับ)
                            </label>
                            <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                                placeholder="เช่น 081-234-5678"
                                className={`w-full ${t.input} rounded-xl py-3 px-4 ${t.inputFocus} transition-all`} />
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2">
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                            สมัครสมาชิก
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className={`text-sm ${t.textSecondary}`}>
                            มีบัญชีอยู่แล้ว?{' '}
                            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline">
                                เข้าสู่ระบบ
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
