import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useThemeClasses } from '../hooks/useThemeClasses';
import api, { getImageUrl } from '../api';
import Navbar from '../components/Navbar';
import {
    Users as UsersIcon,
    Loader2,
    Shield,
    Wrench,
    User,
    UserPlus,
    X,
    AlertCircle,
    CheckCircle2,
    Eye,
    EyeOff,
    Pencil,
    Camera,
    Save,
    Phone,
} from 'lucide-react';

export default function UsersPage() {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const t = useThemeClasses();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Create user form
    const [showForm, setShowForm] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({
        name: '',
        username: '',
        password: '',
        phone: '',
        role: 'user',
    });

    // Edit user modal
    const [editUser, setEditUser] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', password: '', phone: '', role: '' });
    const [editAvatarFile, setEditAvatarFile] = useState(null);
    const [editAvatarPreview, setEditAvatarPreview] = useState(null);
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    const [editSuccess, setEditSuccess] = useState('');
    const [showEditPassword, setShowEditPassword] = useState(false);
    const editFileRef = useRef(null);

    const roleConfig = isDark
        ? {
            user: { label: 'ผู้พักอาศัย', icon: User, color: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
            technician: { label: 'ช่างซ่อม', icon: Wrench, color: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
            admin: { label: 'ผู้ดูแลระบบ', icon: Shield, color: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
        }
        : {
            user: { label: 'ผู้พักอาศัย', icon: User, color: 'bg-blue-100 text-blue-700 border-blue-200' },
            technician: { label: 'ช่างซ่อม', icon: Wrench, color: 'bg-amber-100 text-amber-700 border-amber-200' },
            admin: { label: 'ผู้ดูแลระบบ', icon: Shield, color: 'bg-rose-100 text-rose-700 border-rose-200' },
        };

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch {
            // handle error
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (!form.name || !form.username || !form.password) {
            setFormError('กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        setFormLoading(true);
        setFormError('');
        setFormSuccess('');
        try {
            const { data } = await api.post('/users', form);
            setUsers((prev) => [...prev, data]);
            setFormSuccess(`สร้างบัญชี "${data.name}" เรียบร้อยแล้ว`);
            setForm({ name: '', username: '', password: '', phone: '', role: 'user' });
            setTimeout(() => setFormSuccess(''), 4000);
        } catch (err) {
            setFormError(err.response?.data?.error || 'เกิดข้อผิดพลาด');
        } finally {
            setFormLoading(false);
        }
    };

    const openEditModal = (u) => {
        setEditUser(u);
        setEditForm({ username: u.username, name: u.name, password: '', currentPassword: u.password, phone: u.phone || '', role: u.role });
        setEditAvatarFile(null);
        setEditAvatarPreview(null);
        setEditError('');
        setEditSuccess('');
        setShowEditPassword(false);
    };

    const handleEditAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditAvatarFile(file);
            setEditAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const usernameChanged = editForm.username !== editUser.username;
        const nameChanged = editForm.name !== editUser.name;
        const phoneChanged = editForm.phone !== (editUser.phone || '');
        const roleChanged = editForm.role !== editUser.role;
        const passwordChanged = editForm.password.length > 0;
        const avatarChanged = editAvatarFile !== null;

        if (!usernameChanged && !nameChanged && !phoneChanged && !roleChanged && !passwordChanged && !avatarChanged) {
            setEditError('ไม่มีข้อมูลที่ต้องอัปเดต');
            return;
        }

        setEditLoading(true);
        setEditError('');
        setEditSuccess('');

        try {
            const formData = new FormData();
            formData.append('requesterId', user.id);
            formData.append('requesterRole', user.role);

            if (usernameChanged) formData.append('username', editForm.username);
            if (nameChanged) formData.append('name', editForm.name);
            if (phoneChanged) formData.append('phone', editForm.phone);
            if (roleChanged) formData.append('role', editForm.role);
            if (passwordChanged) formData.append('password', editForm.password);
            if (avatarChanged) formData.append('avatar', editAvatarFile);

            const { data } = await api.put(`/users/${editUser.id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setUsers((prev) => prev.map((u) => (u.id === data.id ? data : u)));
            setEditUser(data);
            setEditForm({ username: data.username, name: data.name, password: '', phone: data.phone || '', role: data.role });
            setEditAvatarFile(null);
            setEditAvatarPreview(null);
            setEditSuccess('บันทึกข้อมูลเรียบร้อยแล้ว');
            setTimeout(() => setEditSuccess(''), 3000);
        } catch (err) {
            setEditError(err.response?.data?.error || 'เกิดข้อผิดพลาด');
        } finally {
            setEditLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${t.pageBg}`}>
                <Navbar />
                <div className="flex items-center justify-center h-[80vh]">
                    <Loader2 size={40} className="animate-spin text-indigo-400" />
                </div>
            </div>
        );
    }

    const grouped = {
        admin: users.filter((u) => u.role === 'admin'),
        technician: users.filter((u) => u.role === 'technician'),
        user: users.filter((u) => u.role === 'user'),
    };

    const editAvatar = editAvatarPreview || (editUser?.avatar ? getImageUrl(editUser.avatar) : null);

    return (
        <div className={`min-h-screen ${t.pageBg}`}>
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                            <UsersIcon size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className={`text-2xl font-bold ${t.textPrimary}`}>ผู้ใช้งานในระบบ</h1>
                            <p className={`${t.textSecondary} text-sm`}>ทั้งหมด {users.length} คน</p>
                        </div>
                    </div>

                    <button
                        onClick={() => { setShowForm(!showForm); setFormError(''); setFormSuccess(''); }}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${showForm
                            ? `${t.btnSecondary}`
                            : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                            }`}
                    >
                        {showForm ? <X size={16} /> : <UserPlus size={16} />}
                        {showForm ? 'ปิดฟอร์ม' : 'สร้างบัญชีใหม่'}
                    </button>
                </div>

                {/* Create User Form */}
                {showForm && (
                    <div className={`mb-8 ${t.card} rounded-2xl p-6 shadow-2xl`}>
                        <h2 className={`text-lg font-semibold ${t.textPrimary} mb-1 flex items-center gap-2`}>
                            <UserPlus size={20} className="text-emerald-400" />
                            สร้างบัญชีผู้ใช้ใหม่
                        </h2>
                        <p className={`text-sm ${t.textSecondary} mb-5`}>สร้างบัญชีสำหรับผู้พักอาศัยหรือช่างซ่อม</p>

                        {formError && (
                            <div className={`mb-4 p-3 ${t.errorBg} rounded-xl flex items-center gap-2 text-sm`}>
                                <AlertCircle size={16} />
                                {formError}
                                <button onClick={() => setFormError('')} className="ml-auto"><X size={14} /></button>
                            </div>
                        )}
                        {formSuccess && (
                            <div className={`mb-4 p-3 ${t.successBg} rounded-xl flex items-center gap-2 text-sm`}>
                                <CheckCircle2 size={16} />
                                {formSuccess}
                            </div>
                        )}

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className={`block text-xs ${t.textMuted} mb-2`}>ประเภทผู้ใช้ <span className="text-red-400">*</span></label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setForm({ ...form, role: 'user' })}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${form.role === 'user'
                                            ? (isDark ? 'bg-blue-500/15 border-blue-500/50 text-blue-300 shadow-lg shadow-blue-500/10' : 'bg-blue-100 border-blue-400 text-blue-700 shadow-sm')
                                            : `${t.btnSecondary}`
                                            }`}>
                                        <User size={16} /> ผู้พักอาศัย
                                    </button>
                                    <button type="button" onClick={() => setForm({ ...form, role: 'technician' })}
                                        className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all ${form.role === 'technician'
                                            ? (isDark ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-lg shadow-amber-500/10' : 'bg-amber-100 border-amber-400 text-amber-700 shadow-sm')
                                            : `${t.btnSecondary}`
                                            }`}>
                                        <Wrench size={16} /> ช่างซ่อม
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className={`block text-xs ${t.textMuted} mb-2`}>ชื่อ-นามสกุล <span className="text-red-400">*</span></label>
                                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="เช่น สมชาย ใจดี"
                                    className={`w-full ${t.input} rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all`} />
                            </div>

                            <div>
                                <label className={`block text-xs ${t.textMuted} mb-2`}>ชื่อผู้ใช้ (Username) <span className="text-red-400">*</span></label>
                                <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="เช่น somchai01"
                                    className={`w-full ${t.input} rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all`} />
                            </div>

                            <div>
                                <label className={`block text-xs ${t.textMuted} mb-2`}>รหัสผ่าน <span className="text-red-400">*</span></label>
                                <div className="relative">
                                    <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="กำหนดรหัสผ่าน"
                                        className={`w-full ${t.input} rounded-xl py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all`} />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${t.textMuted} hover:${t.textLabel} transition-colors`}>
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className={`block text-xs ${t.textMuted} mb-2`}>เบอร์โทรศัพท์</label>
                                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="เช่น 081-234-5678"
                                    className={`w-full ${t.input} rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all`} />
                            </div>

                            <button type="submit" disabled={formLoading}
                                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                {formLoading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
                                สร้างบัญชี
                            </button>
                        </form>
                    </div>
                )}

                {Object.entries(grouped).map(([role, members]) => {
                    const cfg = roleConfig[role];
                    const RoleIcon = cfg.icon;
                    return (
                        <div key={role} className="mb-6">
                            <h2 className={`text-sm font-medium ${t.textSecondary} mb-3 flex items-center gap-2`}>
                                <RoleIcon size={16} />
                                {cfg.label} ({members.length})
                            </h2>
                            <div className="grid sm:grid-cols-2 gap-3">
                                {members.map((u) => (
                                    <div
                                        key={u.id}
                                        className={`${t.card} rounded-xl p-4 ${t.cardHover} transition-all flex items-center gap-4`}
                                    >
                                        {u.avatar ? (
                                            <img src={getImageUrl(u.avatar)} alt={u.name} className={`w-11 h-11 rounded-full object-cover border-2 ${isDark ? 'border-white/10' : 'border-gray-200'} shrink-0`} />
                                        ) : (
                                            <div className="w-11 h-11 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                                                {u.name?.charAt(0)}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className={`${t.textPrimary} font-medium truncate`}>{u.name}</p>
                                            <p className={`text-xs ${t.textMuted}`}>@{u.username}</p>
                                            {u.phone && <p className={`text-xs ${t.textMuted} flex items-center gap-1 mt-0.5`}><Phone size={10} />{u.phone}</p>}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${cfg.color}`}>
                                                {cfg.label}
                                            </span>
                                            {u.role !== 'admin' && (
                                                <button
                                                    onClick={() => openEditModal(u)}
                                                    className={`p-2 rounded-lg ${t.btnSecondary} transition-all`}
                                                    title="แก้ไขข้อมูล"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Edit User Modal */}
            {editUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className={t.overlay} onClick={() => setEditUser(null)} />
                    <div className={`relative ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'} border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden`}>
                        {/* Modal Header */}
                        <div className={`p-6 border-b ${t.border} flex items-center justify-between`}>
                            <h2 className={`text-lg font-semibold ${t.textPrimary} flex items-center gap-2`}>
                                <Pencil size={18} className="text-indigo-400" />
                                แก้ไขข้อมูลผู้ใช้
                            </h2>
                            <button onClick={() => setEditUser(null)} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-gray-400 hover:text-white' : 'hover:bg-gray-100 text-gray-500 hover:text-gray-900'} transition-all`}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
                            {editError && (
                                <div className={`p-3 ${t.errorBg} rounded-xl flex items-center gap-2 text-sm`}>
                                    <AlertCircle size={16} />
                                    {editError}
                                    <button type="button" onClick={() => setEditError('')} className="ml-auto"><X size={14} /></button>
                                </div>
                            )}
                            {editSuccess && (
                                <div className={`p-3 ${t.successBg} rounded-xl flex items-center gap-2 text-sm`}>
                                    <CheckCircle2 size={16} />
                                    {editSuccess}
                                </div>
                            )}

                            {/* Avatar */}
                            <div className="flex justify-center">
                                <div className="relative">
                                    {editAvatar ? (
                                        <img src={editAvatar} alt="avatar" className={`w-20 h-20 rounded-full object-cover border-4 ${isDark ? 'border-white/10' : 'border-gray-200'}`} />
                                    ) : (
                                        <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold border-4 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                                            {editUser.name?.charAt(0)}
                                        </div>
                                    )}
                                    <button type="button" onClick={() => editFileRef.current?.click()}
                                        className={`absolute bottom-0 right-0 w-7 h-7 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center text-white shadow-lg transition-colors border-2 ${isDark ? 'border-slate-900' : 'border-white'}`}>
                                        <Camera size={12} />
                                    </button>
                                    <input ref={editFileRef} type="file" accept="image/*" onChange={handleEditAvatarChange} className="hidden" />
                                </div>
                            </div>

                            {/* Role Selector */}
                            <div>
                                <label className={`block text-xs ${t.textMuted} mb-2`}>ประเภทผู้ใช้</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button type="button" onClick={() => setEditForm({ ...editForm, role: 'user' })}
                                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${editForm.role === 'user'
                                            ? (isDark ? 'bg-blue-500/15 border-blue-500/50 text-blue-300 shadow-lg shadow-blue-500/10' : 'bg-blue-100 border-blue-400 text-blue-700 shadow-sm')
                                            : `${t.btnSecondary}`
                                            }`}>
                                        <User size={16} /> ผู้พักอาศัย
                                    </button>
                                    <button type="button" onClick={() => setEditForm({ ...editForm, role: 'technician' })}
                                        className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${editForm.role === 'technician'
                                            ? (isDark ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-lg shadow-amber-500/10' : 'bg-amber-100 border-amber-400 text-amber-700 shadow-sm')
                                            : `${t.btnSecondary}`
                                            }`}>
                                        <Wrench size={16} /> ช่างซ่อม
                                    </button>
                                </div>
                            </div>

                            {/* Username */}
                            <div>
                                <label className={`block text-xs ${t.textMuted} mb-2`}>ชื่อผู้ใช้ (สำหรับเข้าสู่ระบบ)</label>
                                <input type="text" value={editForm.username} onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                                    className={`w-full ${t.input} rounded-xl py-3 px-4 ${t.inputFocus} transition-all`} />
                            </div>

                            {/* Name */}
                            <div>
                                <label className={`block text-xs ${t.textMuted} mb-2`}>ชื่อ-นามสกุล</label>
                                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className={`w-full ${t.input} rounded-xl py-3 px-4 ${t.inputFocus} transition-all`} />
                            </div>

                            {/* Password */}
                            <div>
                                <label className={`block text-xs ${t.textMuted} mb-2`}>รหัสผ่าน</label>
                                <div className={`mb-2 px-4 py-2.5 ${t.input} rounded-xl flex items-center justify-between`}>
                                    <span className="text-sm text-amber-500 font-mono">{editForm.currentPassword}</span>
                                </div>
                                <div className="relative">
                                    <input type={showEditPassword ? 'text' : 'password'} value={editForm.password}
                                        onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                        placeholder="เปลี่ยนรหัสผ่าน/เว้นว่างหากไม่ต้องการเปลี่ยน"
                                        className={`w-full ${t.input} rounded-xl py-3 px-4 pr-12 ${t.inputFocus} transition-all`} />
                                    <button type="button" onClick={() => setShowEditPassword(!showEditPassword)} className={`absolute right-3 top-1/2 -translate-y-1/2 ${t.textMuted} hover:${t.textLabel} transition-colors`}>
                                        {showEditPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className={`block text-xs ${t.textMuted} mb-2`}>เบอร์โทรศัพท์</label>
                                <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                    placeholder="เช่น 081-234-5678"
                                    className={`w-full ${t.input} rounded-xl py-3 px-4 ${t.inputFocus} transition-all`} />
                            </div>

                            {/* Submit */}
                            <div className="flex gap-3">
                                <button type="submit" disabled={editLoading}
                                    className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    {editLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                    บันทึก
                                </button>
                                <button type="button" onClick={() => setEditUser(null)}
                                    className={`px-6 py-3 ${t.btnSecondary} rounded-xl font-medium transition-all`}>
                                    ยกเลิก
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
