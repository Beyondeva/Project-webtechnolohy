import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
    Users,
} from 'lucide-react';

const statusConfig = {
    Pending: {
        label: 'รอดำเนินการ',
        color: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        icon: Clock,
    },
    'In-Progress': {
        label: 'กำลังดำเนินการ',
        color: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
        icon: Loader2,
    },
    Resolved: {
        label: 'เสร็จสิ้น',
        color: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        icon: CheckCircle2,
    },
};

export default function Dashboard() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [techRatings, setTechRatings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
                <Navbar />
                <div className="flex items-center justify-center h-[80vh]">
                    <Loader2 size={40} className="animate-spin text-indigo-400" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-white">แดชบอร์ด</h1>
                        <p className="text-gray-400 mt-1">
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
                            className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-4 hover:bg-white/8 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 bg-gradient-to-br ${color} rounded-lg flex items-center justify-center shadow-lg`}
                                >
                                    <Icon size={18} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{value}</p>
                                    <p className="text-xs text-gray-400">{label}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Admin: Tech Ratings */}
                {user.role === 'admin' && techRatings.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <BarChart3 size={20} className="text-indigo-400" />
                            คะแนนเฉลี่ยช่างซ่อม
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {techRatings.map((tech) => (
                                <div
                                    key={tech.id}
                                    className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-5 hover:bg-white/8 transition-all"
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {tech.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{tech.name}</p>
                                            <p className="text-xs text-gray-400">
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
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-300 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}

                {/* Ticket List */}
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Ticket size={20} className="text-indigo-400" />
                    {user.role === 'user' ? 'คำร้องของฉัน' : user.role === 'technician' ? 'งานซ่อมบำรุง' : 'คำร้องทั้งหมด'}
                </h2>

                {tickets.length === 0 ? (
                    <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
                        <Ticket size={48} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400">ยังไม่มีคำร้อง</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {tickets.map((ticket) => {
                            const cfg = statusConfig[ticket.status];
                            const StatusIcon = cfg.icon;
                            return (
                                <Link
                                    key={ticket.id}
                                    to={`/ticket/${ticket.id}`}
                                    className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-5 hover:bg-white/8 hover:border-white/20 transition-all group"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                        {/* Status */}
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border w-fit ${cfg.color}`}
                                        >
                                            <StatusIcon size={12} />
                                            {cfg.label}
                                        </span>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-medium group-hover:text-indigo-300 transition-colors truncate">
                                                {ticket.title}
                                            </h3>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-400">
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

                                        {/* Rating */}
                                        {ticket.rating && (
                                            <div className="flex items-center gap-1">
                                                <StarRating rating={ticket.rating} readonly size={14} />
                                            </div>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
