import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useThemeClasses } from '../hooks/useThemeClasses';
import api from '../api';
import Navbar from '../components/Navbar';
import StarRating from '../components/StarRating';
import {
    Plus,
    Clock,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Wrench,
    BarChart3,
    Ticket,
    X,
    Star,
    MessageSquare,
} from 'lucide-react';

const statusLabels = {
    Pending: { label: 'รอดำเนินการ', icon: Clock },
    'In-Progress': { label: 'กำลังดำเนินการ', icon: Loader2 },
    Resolved: { label: 'เสร็จสิ้น', icon: CheckCircle2 },
};

export default function Dashboard() {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const t = useThemeClasses();
    const [tickets, setTickets] = useState([]);
    const [techRatings, setTechRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reviewTech, setReviewTech] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [reviewsLoading, setReviewsLoading] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/tickets', {
                params: { role: user.role, userId: user.id },
            });
            setTickets(data);

            if (user.role === 'admin') {
                const { data: ratings } = await api.get('/technician-ratings');
                setTechRatings(ratings);
            }
        } catch (err) {
            setError('ไม่สามารถโหลดข้อมูลได้');
        } finally {
            setLoading(false);
        }
    };

    const stats = {
        total: tickets.length,
        pending: tickets.filter((t) => t.status === 'Pending').length,
        inProgress: tickets.filter((t) => t.status === 'In-Progress').length,
        resolved: tickets.filter((t) => t.status === 'Resolved').length,
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

    return (
        <div className={`min-h-screen ${t.pageBg}`}>
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <div>
                        <h1 className={`text-2xl font-bold ${t.textPrimary}`}>แดชบอร์ด</h1>
                        <p className={`${t.textSecondary} mt-1`}>
                            {user.role === 'user' && 'ภาพรวมคำร้องแจ้งซ่อมของคุณ'}
                            {user.role === 'technician' && 'งานซ่อมที่ได้รับมอบหมาย'}
                            {user.role === 'admin' && 'ภาพรวมระบบแจ้งซ่อมทั้งหมด'}
                        </p>
                    </div>
                    {user.role === 'user' && (
                        <Link
                            to="/create-ticket"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50"
                        >
                            <Plus size={18} />
                            แจ้งซ่อมใหม่
                        </Link>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'ทั้งหมด', value: stats.total, icon: Ticket, color: 'from-slate-600 to-slate-700' },
                        { label: 'รอดำเนินการ', value: stats.pending, icon: Clock, color: 'from-amber-600 to-amber-700' },
                        { label: 'กำลังดำเนินการ', value: stats.inProgress, icon: Wrench, color: 'from-blue-600 to-blue-700' },
                        { label: 'เสร็จสิ้น', value: stats.resolved, icon: CheckCircle2, color: 'from-emerald-600 to-emerald-700' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div
                            key={label}
                            className={`${t.card} rounded-xl p-4 ${t.cardHover} transition-all`}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center shadow-lg`}
                                >
                                    <Icon size={18} className="text-white" />
                                </div>
                                <div>
                                    <p className={`text-2xl font-bold ${t.textPrimary}`}>{value}</p>
                                    <p className={`text-xs ${t.textSecondary}`}>{label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Admin: Tech Ratings */}
                {user.role === 'admin' && techRatings.length > 0 && (
                    <div className="mb-8">
                        <h2 className={`text-lg font-semibold ${t.textPrimary} mb-4 flex items-center gap-2`}>
                            <BarChart3 size={20} className="text-indigo-400" />
                            คะแนนเฉลี่ยช่างซ่อม
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {techRatings.map((tech) => (
                                <div
                                    key={tech.id}
                                    onClick={async () => {
                                        setReviewTech(tech);
                                        setReviewsLoading(true);
                                        try {
                                            const { data } = await api.get(`/technician-reviews/${tech.id}`);
                                            setReviews(data);
                                        } catch { setReviews([]); }
                                        setReviewsLoading(false);
                                    }}
                                    className={`${t.card} rounded-xl p-5 ${t.cardHover} transition-all cursor-pointer`}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {tech.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className={`${t.textPrimary} font-medium`}>{tech.name}</p>
                                            <p className={`text-xs ${t.textSecondary}`}>
                                                งานทั้งหมด {tech.total_tickets} | รีวิว {tech.total_ratings}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StarRating rating={Math.round(tech.avg_rating || 0)} readonly size={18} />
                                        <span className="text-amber-400 font-semibold text-sm">
                                            {tech.avg_rating || '–'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className={`mb-4 p-3 ${t.errorBg} rounded-xl flex items-center gap-2 text-sm`}>
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {/* Ticket List — Grouped by Status */}
                {(() => {
                    const sections = [
                        {
                            key: 'all',
                            title: user.role === 'user' ? 'คำร้องของฉัน' : user.role === 'technician' ? 'งานซ่อมบำรุง' : 'คำร้องทั้งหมด',
                            icon: Ticket,
                            iconColor: 'text-indigo-400',
                            items: tickets,
                        },
                        {
                            key: 'pending',
                            title: 'รอดำเนินการ',
                            icon: Clock,
                            iconColor: 'text-amber-400',
                            items: tickets.filter((t) => t.status === 'Pending'),
                        },
                        {
                            key: 'in-progress',
                            title: 'กำลังดำเนินการ',
                            icon: Wrench,
                            iconColor: 'text-blue-400',
                            items: tickets.filter((t) => t.status === 'In-Progress'),
                        },
                        {
                            key: 'resolved',
                            title: 'เสร็จแล้ว',
                            icon: CheckCircle2,
                            iconColor: 'text-emerald-400',
                            items: tickets.filter((t) => t.status === 'Resolved'),
                        },
                    ];

                    const renderTicketCard = (ticket) => {
                        const sl = statusLabels[ticket.status];
                        const StatusIcon = sl.icon;
                        return (
                            <Link
                                key={ticket.id}
                                to={`/ticket/${ticket.id}`}
                                className={`${t.card} rounded-xl p-5 ${t.cardHover} transition-all group`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border w-fit ${t.statusConfig[ticket.status]}`}
                                    >
                                        <StatusIcon size={12} />
                                        {sl.label}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`${t.textPrimary} font-medium group-hover:text-indigo-400 transition-colors truncate`}>
                                            {ticket.title}
                                        </h3>
                                        <div className={`flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs ${t.textSecondary}`}>
                                            <span>ห้อง {ticket.room_number || '–'}</span>
                                            <span>โดย {ticket.creator_name}</span>
                                            {ticket.technician_name && (
                                                <span>ช่าง: {ticket.technician_name}</span>
                                            )}
                                            <span>
                                                {new Date(ticket.created_at).toLocaleDateString('th-TH', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    {ticket.rating && (
                                        <div className="flex items-center gap-1">
                                            <StarRating rating={ticket.rating} readonly size={14} />
                                        </div>
                                    )}
                                </div>
                            </Link>
                        );
                    };

                    return sections.map((section) => {
                        const SectionIcon = section.icon;
                        return (
                            <div key={section.key} className="mb-8">
                                <h2 className={`text-lg font-semibold ${t.textPrimary} mb-4 flex items-center gap-2`}>
                                    <SectionIcon size={20} className={section.iconColor} />
                                    {section.title}
                                    <span className={`text-sm font-normal ${t.textMuted}`}>({section.items.length})</span>
                                </h2>
                                {section.items.length === 0 ? (
                                    <div className={`text-center py-8 ${t.card} rounded-2xl`}>
                                        <p className={`text-sm ${t.textSecondary}`}>ไม่มีคำร้องในหมวดนี้</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        {section.items.map(renderTicketCard)}
                                    </div>
                                )}
                            </div>
                        );
                    });
                })()}
                {/* Review Detail Modal */}
                {reviewTech && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setReviewTech(null)}>
                        <div
                            className={`${t.card} rounded-2xl max-w-lg w-full max-h-[85vh] overflow-hidden shadow-2xl`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className={`p-6 border-b ${t.border} flex items-center justify-between`}>
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {reviewTech.name?.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-bold ${t.textPrimary}`}>{reviewTech.name}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <StarRating rating={Math.round(reviewTech.avg_rating || 0)} readonly size={14} />
                                            <span className="text-amber-400 font-semibold text-sm">{reviewTech.avg_rating || '–'}</span>
                                            <span className={`text-xs ${t.textMuted}`}>({reviewTech.total_ratings} รีวิว)</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setReviewTech(null)} className={`p-2 rounded-lg ${t.btnSecondary} transition-colors`}>
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Reviews list */}
                            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
                                {reviewsLoading ? (
                                    <div className="flex justify-center py-8">
                                        <Loader2 size={24} className="animate-spin text-indigo-400" />
                                    </div>
                                ) : reviews.length === 0 ? (
                                    <p className={`text-center py-8 text-sm ${t.textSecondary}`}>ยังไม่มีรีวิว</p>
                                ) : (
                                    reviews.map((r) => (
                                        <div key={r.id} className={`rounded-xl border ${t.border} p-4 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                            <div className="flex items-start justify-between gap-3 mb-2">
                                                <Link
                                                    to={`/ticket/${r.id}`}
                                                    onClick={() => setReviewTech(null)}
                                                    className={`font-medium ${t.textPrimary} hover:text-indigo-400 transition-colors text-sm`}
                                                >
                                                    {r.title}
                                                </Link>
                                                <div className="flex items-center gap-1 shrink-0">
                                                    <StarRating rating={r.rating} readonly size={14} />
                                                </div>
                                            </div>
                                            {r.review && (
                                                <p className={`text-sm ${t.textSecondary} italic mb-2`}>"{r.review}"</p>
                                            )}
                                            <div className={`flex items-center gap-3 text-xs ${t.textMuted}`}>
                                                <span>ห้อง {r.room_number || '–'}</span>
                                                <span>โดย {r.reviewer_name}</span>
                                                <span>{new Date(r.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
