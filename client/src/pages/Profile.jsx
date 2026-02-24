import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../api';
import Navbar from '../components/Navbar';
import {
    ArrowLeft,
    Loader2,
    Camera,
    User,
    Lock,
    AtSign,
    Save,
    AlertCircle,
    CheckCircle2,
    X,
    Eye,
    EyeOff,
} from 'lucide-react';

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
    const fileRef = useRef(null);

    const isAdmin = user.role === 'admin';

    const [username, setUsername] = useState(user.username);
    const [name, setName] = useState(user.name);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const usernameChanged = !isAdmin && username !== user.username;
        const nameChanged = !isAdmin && name !== user.name;
        const passwordChanged = !isAdmin && password.length > 0;
        const avatarChanged = avatarFile !== null;

        if (!usernameChanged && !nameChanged && !passwordChanged && !avatarChanged) {
            setError('ไม่มีข้อมูลที่ต้องอัปเดต');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();
            formData.append('requesterId', user.id);
            formData.append('requesterRole', user.role);

            if (usernameChanged) {
                formData.append('username', username);
            }
            if (!isAdmin && name !== user.name) {
                formData.append('name', name);
            }
            if (!isAdmin && password) {
                formData.append('password', password);
            }
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            const { data } = await api.put(`/users/${user.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            updateUser(data);
            setPassword('');
            setAvatarFile(null);
            setAvatarPreview(null);
            setSuccess('บันทึกข้อมูลเรียบร้อยแล้ว');
            setTimeout(() => setSuccess(''), 4000);
        } catch (err) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    const currentAvatar = avatarPreview || (user.avatar ? getImageUrl(user.avatar) : null);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft size={18} />
                    กลับหน้าแดชบอร์ด
                </button>

                {error && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-300 text-sm">
                        <AlertCircle size={16} />
                        {error}
                        <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
                    </div>
                )}
                {success && (
                    <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-emerald-300 text-sm">
                        <CheckCircle2 size={16} />
                        {success}
                    </div>
                )}

                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    {/* Header */}
                    <div className="p-6 sm:p-8 border-b border-white/10 flex flex-col items-center">
                        <div className="relative group mb-4">
                            {currentAvatar ? (
                                <img
                                    src={currentAvatar}
                                    alt="Profile"
                                    className="w-28 h-28 rounded-full object-cover border-4 border-white/10 shadow-xl"
                                />
                            ) : (
                                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-white/10 shadow-xl">
                                    {user.name?.charAt(0)}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="absolute bottom-1 right-1 w-9 h-9 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg transition-colors border-2 border-slate-900"
                            >
                                <Camera size={16} />
                            </button>
                            <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                        </div>
                        <h1 className="text-xl font-bold text-white">{user.name}</h1>
                        <p className="text-sm text-gray-400">@{user.username}</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
                        {/* Username — not editable for admin */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-2 flex items-center gap-1.5">
                                <AtSign size={14} />
                                ชื่อผู้ใช้ (สำหรับเข้าสู่ระบบ)
                                {isAdmin && <span className="text-gray-600 text-[10px]">(ไม่สามารถแก้ไขได้)</span>}
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                disabled={isAdmin}
                                className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                        </div>

                        {/* Name — not editable for admin */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-2 flex items-center gap-1.5">
                                <User size={14} />
                                ชื่อ-นามสกุล
                                {isAdmin && <span className="text-gray-600 text-[10px]">(ไม่สามารถแก้ไขได้)</span>}
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isAdmin}
                                className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                        </div>

                        {/* Password — not editable for admin */}
                        <div>
                            <label className="block text-xs text-gray-500 mb-2 flex items-center gap-1.5">
                                <Lock size={14} />
                                เปลี่ยนรหัสผ่าน
                                {isAdmin && <span className="text-gray-600 text-[10px]">(ไม่สามารถแก้ไขได้)</span>}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isAdmin}
                                    placeholder="ป้อนรหัสผ่านใหม่ (เว้นว่างหากไม่ต้องการเปลี่ยน)"
                                    className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all ${isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                                {!isAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            บันทึกการเปลี่ยนแปลง
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
