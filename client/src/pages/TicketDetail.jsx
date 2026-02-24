import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useThemeClasses } from '../hooks/useThemeClasses';
import api, { getImageUrl } from '../api';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import {
    ArrowLeft,
    Loader2,
    Clock,
    CheckCircle2,
    Wrench,
    Trash2,
    ImagePlus,
    X,
    Send,
    MapPin,
    User,
    Calendar,
    AlertCircle,
    MessageSquare,
    XCircle,
} from 'lucide-react';

const statusMeta = {
    Pending: { label: 'รอดำเนินการ', icon: Clock },
    'In-Progress': { label: 'กำลังดำเนินการ', icon: Loader2 },
    Resolved: { label: 'เสร็จสิ้น', icon: CheckCircle2 },
};

export default function TicketDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const { isDark } = useTheme();
    const t = useThemeClasses();
    const navigate = useNavigate();
    const fileRef = useRef(null);

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [afterFile, setAfterFile] = useState(null);
    const [afterPreview, setAfterPreview] = useState(null);

    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');

    const [technicians, setTechnicians] = useState([]);
    const [selectedTech, setSelectedTech] = useState('');

    const [showCancelPanel, setShowCancelPanel] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    useEffect(() => {
        fetchTicket();
        if (user.role === 'admin') {
            fetchTechnicians();
        }
    }, [id]);

    const fetchTicket = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/tickets/${id}`);
            setTicket(data);
        } catch {
            setError('ไม่พบคำร้องนี้');
        } finally {
            setLoading(false);
        }
    };

    const fetchTechnicians = async () => {
        try {
            const { data } = await api.get('/technicians');
            setTechnicians(data);
        } catch { }
    };

    const handleDelete = async () => {
        if (!confirm('คุณแน่ใจว่าต้องการลบคำร้องนี้?')) return;
        setActionLoading(true);
        try {
            await api.delete(`/tickets/${id}`, {
                params: { role: user.role, userId: user.id },
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'ไม่สามารถลบคำร้องได้');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAccept = async () => {
        setActionLoading(true);
        setError('');
        try {
            const { data } = await api.put(`/tickets/${id}`, {
                status: 'In-Progress',
                technician_id: user.id,
            });
            setTicket(data);
            setSuccess('รับงานเรียบร้อยแล้ว');
        } catch (err) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาด');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancelRepair = async () => {
        if (!cancelReason.trim()) {
            setError('กรุณาระบุเหตุผลการยกเลิก');
            return;
        }
        setActionLoading(true);
        setError('');
        try {
            const { data } = await api.put(`/tickets/${id}`, {
                status: 'Pending',
                technician_id: null,
                cancel_reason: cancelReason,
            });
            setTicket(data);
            setShowCancelPanel(false);
            setCancelReason('');
            setSuccess('ยกเลิกการซ่อมเรียบร้อยแล้ว');
        } catch (err) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาด');
        } finally {
            setActionLoading(false);
        }
    };

    const handleResolve = async () => {
        if (!afterFile) {
            setError('กรุณาอัปโหลดรูปภาพหลังซ่อมก่อน');
            return;
        }
        setActionLoading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('status', 'Resolved');
            formData.append('image_after', afterFile);
            const { data } = await api.put(`/tickets/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setTicket(data);
            setAfterFile(null);
            setAfterPreview(null);
            setSuccess('ดำเนินการซ่อมเสร็จสิ้น');
        } catch (err) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาด');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRate = async () => {
        if (rating === 0) {
            setError('กรุณาให้คะแนน');
            return;
        }
        setActionLoading(true);
        setError('');
        try {
            const { data } = await api.put(`/tickets/${id}`, { rating, review });
            setTicket(data);
            setSuccess('ขอบคุณสำหรับการรีวิว!');
        } catch (err) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาด');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAssignTech = async () => {
        if (!selectedTech) return;
        setActionLoading(true);
        setError('');
        try {
            const { data } = await api.put(`/tickets/${id}`, {
                technician_id: selectedTech,
                status: 'In-Progress',
            });
            setTicket(data);
            setSuccess('มอบหมายช่างเรียบร้อย');
        } catch (err) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาด');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAfterFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAfterFile(file);
            setAfterPreview(URL.createObjectURL(file));
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

    if (!ticket) {
        return (
            <div className={`min-h-screen ${t.pageBg}`}>
                <Navbar />
                <div className="max-w-3xl mx-auto px-4 py-8 text-center">
                    <p className={`${t.textSecondary} text-lg`}>ไม่พบคำร้องนี้</p>
                    <button onClick={() => navigate('/dashboard')} className="mt-4 text-indigo-400 hover:underline">
                        กลับหน้าแดชบอร์ด
                    </button>
                </div>
            </div>
        );
    }

    const sm = statusMeta[ticket.status];
    const StatusIcon = sm.icon;

    const canDelete =
        user.role === 'admin' ||
        (user.role === 'user' && ticket.created_by === user.id && ticket.status === 'Pending');

    const canRate =
        user.role === 'user' &&
        ticket.created_by === user.id &&
        ticket.status === 'Resolved' &&
        !ticket.rating;

    const canAccept = user.role === 'technician' && ticket.status === 'Pending';
    const canResolve = user.role === 'technician' && ticket.technician_id === user.id && ticket.status === 'In-Progress';
    const canCancel = user.role === 'technician' && ticket.technician_id === user.id && ticket.status === 'In-Progress';
    const canAssign = user.role === 'admin' && ticket.status === 'Pending';

    /* Timeline step helper */
    const stepClass = (s) => {
        const isActive = s === ticket.status;
        const isPast = s === 'Pending' ||
            (s === 'In-Progress' && ['In-Progress', 'Resolved'].includes(ticket.status)) ||
            (s === 'Resolved' && ticket.status === 'Resolved');

        if (isActive) return `${t.statusConfig[s]} border-current shadow-lg`;
        if (isPast) return isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-gray-200 border-gray-300 text-gray-700';
        return isDark ? 'bg-white/5 border-white/10 text-gray-600' : 'bg-gray-100 border-gray-200 text-gray-400';
    };

    const stepLabelClass = (s) => {
        const isPast = s === 'Pending' ||
            (s === 'In-Progress' && ['In-Progress', 'Resolved'].includes(ticket.status)) ||
            (s === 'Resolved' && ticket.status === 'Resolved');
        return isPast ? (isDark ? 'text-gray-300' : 'text-gray-700') : (isDark ? 'text-gray-600' : 'text-gray-400');
    };

    const lineClass = (idx) => {
        const isPast = idx === 0 && ['In-Progress', 'Resolved'].includes(ticket.status);
        return isPast
            ? (isDark ? 'bg-gradient-to-r from-white/30 to-white/10' : 'bg-gradient-to-r from-gray-400 to-gray-200')
            : (isDark ? 'bg-white/10' : 'bg-gray-200');
    };

    const sectionBorder = `border-b ${t.border}`;

    return (
        <div className={`min-h-screen ${t.pageBg}`}>
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
                <button
                    onClick={() => navigate('/dashboard')}
                    className={`flex items-center gap-2 ${t.textSecondary} hover:${t.textPrimary} transition-colors mb-6`}
                >
                    <ArrowLeft size={18} />
                    กลับหน้าแดชบอร์ด
                </button>

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
                        <button onClick={() => setSuccess('')} className="ml-auto"><X size={14} /></button>
                    </div>
                )}

                <div className={`${t.card} rounded-2xl overflow-hidden shadow-2xl`}>
                    {/* Header */}
                    <div className={`p-6 sm:p-8 ${sectionBorder}`}>
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${t.statusConfig[ticket.status]}`}>
                                        <StatusIcon size={12} />
                                        {sm.label}
                                    </span>
                                    <span className={`text-xs ${t.textMuted}`}>#{ticket.id}</span>
                                </div>
                                <h1 className={`text-xl sm:text-2xl font-bold ${t.textPrimary}`}>{ticket.title}</h1>
                            </div>

                            {canDelete && (
                                <button
                                    onClick={handleDelete}
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-all text-sm disabled:opacity-50"
                                >
                                    <Trash2 size={16} />
                                    ลบคำร้อง
                                </button>
                            )}
                        </div>

                        <div className={`flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm ${t.textSecondary}`}>
                            <span className="flex items-center gap-1.5">
                                <MapPin size={14} className="text-indigo-400" />
                                ห้อง {ticket.room_number || '–'}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <User size={14} className="text-indigo-400" />
                                {ticket.creator_name}
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} className="text-indigo-400" />
                                {new Date(ticket.created_at).toLocaleString('th-TH')}
                            </span>
                            {ticket.technician_name && (
                                <span className="flex items-center gap-1.5">
                                    <Wrench size={14} className="text-amber-400" />
                                    ช่าง: {ticket.technician_name}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    {ticket.description && (
                        <div className={`p-6 sm:p-8 ${sectionBorder}`}>
                            <h3 className={`text-sm font-medium ${t.textLabel} mb-3`}>รายละเอียด</h3>
                            <p className={`${t.textSecondary} whitespace-pre-wrap leading-relaxed`}>{ticket.description}</p>
                        </div>
                    )}

                    {/* Images */}
                    <div className={`p-6 sm:p-8 ${sectionBorder}`}>
                        <h3 className={`text-sm font-medium ${t.textLabel} mb-4`}>รูปภาพ</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <p className={`text-xs ${t.textMuted} mb-2 font-medium`}>ก่อนซ่อม</p>
                                {ticket.image_before ? (
                                    <div className={`rounded-xl overflow-hidden border ${t.border}`}>
                                        <img src={getImageUrl(ticket.image_before)} alt="ก่อนซ่อม" className="w-full h-56 object-cover hover:scale-105 transition-transform duration-300" />
                                    </div>
                                ) : (
                                    <div className={`h-56 rounded-xl border border-dashed ${t.border} flex items-center justify-center ${t.emptyIcon}`}>ไม่มีรูปภาพ</div>
                                )}
                            </div>
                            <div>
                                <p className={`text-xs ${t.textMuted} mb-2 font-medium`}>หลังซ่อม</p>
                                {ticket.image_after ? (
                                    <div className={`rounded-xl overflow-hidden border ${t.border}`}>
                                        <img src={getImageUrl(ticket.image_after)} alt="หลังซ่อม" className="w-full h-56 object-cover hover:scale-105 transition-transform duration-300" />
                                    </div>
                                ) : (
                                    <div className={`h-56 rounded-xl border border-dashed ${t.border} flex items-center justify-center ${t.emptyIcon}`}>ยังไม่มีรูปภาพหลังซ่อม</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status Timeline */}
                    <div className={`p-6 sm:p-8 ${sectionBorder}`}>
                        <h3 className={`text-sm font-medium ${t.textLabel} mb-4`}>สถานะการดำเนินงาน</h3>
                        <div className="flex items-center gap-0">
                            {['Pending', 'In-Progress', 'Resolved'].map((s, i) => {
                                const StepIcon = statusMeta[s].icon;
                                return (
                                    <div key={s} className="flex items-center flex-1">
                                        <div className="flex flex-col items-center flex-1">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${stepClass(s)}`}>
                                                <StepIcon size={16} />
                                            </div>
                                            <span className={`text-xs mt-2 ${stepLabelClass(s)}`}>
                                                {statusMeta[s].label}
                                            </span>
                                        </div>
                                        {i < 2 && <div className={`h-0.5 flex-1 -mt-5 ${lineClass(i)}`} />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Existing Rating */}
                    {ticket.rating && (
                        <div className={`p-6 sm:p-8 ${sectionBorder}`}>
                            <h3 className={`text-sm font-medium ${t.textLabel} mb-3 flex items-center gap-2`}>
                                <MessageSquare size={16} className="text-amber-400" />
                                การรีวิว
                            </h3>
                            <div className="flex items-center gap-3 mb-2">
                                <StarRating rating={ticket.rating} readonly size={20} />
                                <span className="text-amber-400 font-semibold">{ticket.rating}/5</span>
                            </div>
                            {ticket.review && (
                                <p className={`${t.textSecondary} mt-2 italic`}>"{ticket.review}"</p>
                            )}
                        </div>
                    )}

                    {/* ===== ACTION PANELS ===== */}

                    {/* Tech: Accept */}
                    {canAccept && (
                        <div className={`p-6 sm:p-8 ${sectionBorder} ${isDark ? 'bg-blue-500/5' : 'bg-blue-50'}`}>
                            <h3 className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'} mb-3 flex items-center gap-2`}>
                                <Wrench size={16} /> ดำเนินการซ่อม
                            </h3>
                            <p className={`text-sm ${t.textSecondary} mb-4`}>กดปุ่มด้านล่างเพื่อรับงานซ่อมนี้</p>
                            <button onClick={handleAccept} disabled={actionLoading}
                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 flex items-center gap-2">
                                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Wrench size={16} />}
                                รับงานซ่อมนี้
                            </button>
                        </div>
                    )}

                    {/* Tech: Resolve */}
                    {canResolve && (
                        <div className={`p-6 sm:p-8 ${sectionBorder} ${isDark ? 'bg-emerald-500/5' : 'bg-emerald-50'}`}>
                            <h3 className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'} mb-3 flex items-center gap-2`}>
                                <CheckCircle2 size={16} /> แจ้งซ่อมเสร็จสิ้น
                            </h3>
                            <p className={`text-sm ${t.textSecondary} mb-4`}>อัปโหลดรูปภาพหลังซ่อมเพื่อยืนยันการซ่อมเสร็จ</p>

                            {afterPreview ? (
                                <div className={`relative rounded-xl overflow-hidden border ${t.border} mb-4 w-fit`}>
                                    <img src={afterPreview} alt="After" className="h-48 object-cover rounded-xl" />
                                    <button onClick={() => { setAfterFile(null); setAfterPreview(null); }}
                                        className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white hover:bg-red-500 transition-colors">
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <button type="button" onClick={() => fileRef.current?.click()}
                                    className={`mb-4 border-2 border-dashed ${isDark ? 'border-emerald-500/30 hover:border-emerald-500/50 hover:bg-emerald-500/5' : 'border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50'} rounded-xl py-8 px-12 text-center transition-all group`}>
                                    <ImagePlus size={28} className={`mx-auto ${t.emptyIcon} group-hover:text-emerald-400 mb-2`} />
                                    <p className={`text-sm ${t.textSecondary} group-hover:text-emerald-500`}>อัปโหลดรูปหลังซ่อม</p>
                                </button>
                            )}
                            <input ref={fileRef} type="file" accept="image/*" onChange={handleAfterFileChange} className="hidden" />

                            <button onClick={handleResolve} disabled={actionLoading || !afterFile}
                                className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                ยืนยันซ่อมเสร็จสิ้น
                            </button>
                        </div>
                    )}

                    {/* Tech: Cancel */}
                    {canCancel && (
                        <div className={`p-6 sm:p-8 ${sectionBorder} ${isDark ? 'bg-red-500/5' : 'bg-red-50'}`}>
                            <h3 className={`text-sm font-medium ${isDark ? 'text-red-300' : 'text-red-700'} mb-3 flex items-center gap-2`}>
                                <XCircle size={16} /> ยกเลิกการซ่อม
                            </h3>
                            <p className={`text-sm ${t.textSecondary} mb-4`}>หากไม่สามารถดำเนินการซ่อมได้ สามารถยกเลิกเพื่อให้ช่างท่านอื่นรับงานแทน</p>

                            {!showCancelPanel ? (
                                <button onClick={() => setShowCancelPanel(true)}
                                    className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-red-500/30 flex items-center gap-2">
                                    <XCircle size={16} /> ยกเลิกการซ่อม
                                </button>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className={`block text-xs ${t.textMuted} mb-2`}>เหตุผลการยกเลิก <span className="text-red-400">*</span></label>
                                        <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3}
                                            placeholder="ระบุเหตุผลที่ไม่สามารถดำเนินการซ่อมได้..."
                                            className={`w-full ${t.input} rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all resize-none`} />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={handleCancelRepair} disabled={actionLoading || !cancelReason.trim()}
                                            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                                            ยืนยันการยกเลิก
                                        </button>
                                        <button onClick={() => { setShowCancelPanel(false); setCancelReason(''); }}
                                            className={`px-6 py-2.5 ${t.btnSecondary} rounded-xl font-medium transition-all`}>
                                            ย้อนกลับ
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* User: Rate */}
                    {canRate && (
                        <div className={`p-6 sm:p-8 ${isDark ? 'bg-amber-500/5' : 'bg-amber-50'}`}>
                            <h3 className={`text-sm font-medium ${isDark ? 'text-amber-300' : 'text-amber-700'} mb-3 flex items-center gap-2`}>
                                <MessageSquare size={16} /> ให้คะแนนและรีวิว
                            </h3>
                            <p className={`text-sm ${t.textSecondary} mb-4`}>กรุณาให้คะแนนและรีวิวการซ่อมเพื่อเป็นประโยชน์ในการปรับปรุง</p>

                            <div className="mb-4">
                                <label className={`block text-xs ${t.textMuted} mb-2`}>คะแนน</label>
                                <StarRating rating={rating} onRate={setRating} size={28} />
                            </div>

                            <div className="mb-4">
                                <label className={`block text-xs ${t.textMuted} mb-2`}>ความคิดเห็น (ไม่บังคับ)</label>
                                <textarea value={review} onChange={(e) => setReview(e.target.value)} rows={3}
                                    placeholder="แสดงความคิดเห็นเกี่ยวกับการซ่อม..."
                                    className={`w-full ${t.input} rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all resize-none`} />
                            </div>

                            <button onClick={handleRate} disabled={actionLoading || rating === 0}
                                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-amber-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                ส่งรีวิว
                            </button>
                        </div>
                    )}

                    {/* Admin: Assign */}
                    {canAssign && (
                        <div className={`p-6 sm:p-8 ${isDark ? 'bg-indigo-500/5' : 'bg-indigo-50'}`}>
                            <h3 className={`text-sm font-medium ${isDark ? 'text-indigo-300' : 'text-indigo-700'} mb-3 flex items-center gap-2`}>
                                <Wrench size={16} /> มอบหมายช่างซ่อม
                            </h3>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <select value={selectedTech} onChange={(e) => setSelectedTech(e.target.value)}
                                    className={`flex-1 ${t.input} rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none`}>
                                    <option value="" className={t.optionBg}>-- เลือกช่าง --</option>
                                    {technicians.map((tech) => (
                                        <option key={tech.id} value={tech.id} className={t.optionBg}>{tech.name}</option>
                                    ))}
                                </select>
                                <button onClick={handleAssignTech} disabled={actionLoading || !selectedTech}
                                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap">
                                    {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    มอบหมาย
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
