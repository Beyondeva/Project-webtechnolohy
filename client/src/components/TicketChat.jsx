import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useThemeClasses } from '../hooks/useThemeClasses';
import api, { getImageUrl } from '../api';
import {
    MessageSquare,
    Send,
    Loader2,
} from 'lucide-react';

export default function TicketChat({ ticketId }) {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const t = useThemeClasses();
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [sending, setSending] = useState(false);
    const prevCountRef = useRef(0);
    const chatContainerRef = useRef(null);
    const intervalRef = useRef(null);

    const fetchMessages = async () => {
        try {
            const { data } = await api.get(`/tickets/${ticketId}/messages`);
            setMessages(data);
        } catch { }
    };

    useEffect(() => {
        fetchMessages();
        intervalRef.current = setInterval(fetchMessages, 5000);
        return () => clearInterval(intervalRef.current);
    }, [ticketId]);

    useEffect(() => {
        if (messages.length > prevCountRef.current) {
            // Only auto-scroll when NEW messages arrive
            chatContainerRef.current?.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
        prevCountRef.current = messages.length;
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMsg.trim() || sending) return;
        setSending(true);
        try {
            const { data } = await api.post(`/tickets/${ticketId}/messages`, {
                sender_id: user.id,
                message: newMsg.trim(),
            });
            setMessages((prev) => [...prev, data]);
            setNewMsg('');
        } catch { }
        setSending(false);
    };

    const roleLabel = {
        user: 'ผู้พักอาศัย',
        technician: 'ช่าง',
        admin: 'แอดมิน',
    };

    const roleBubble = (role, isSelf) => {
        if (isSelf) return isDark
            ? 'bg-indigo-600/40 border-indigo-500/30'
            : 'bg-indigo-100 border-indigo-200';
        if (role === 'admin') return isDark
            ? 'bg-rose-500/15 border-rose-500/20'
            : 'bg-rose-50 border-rose-200';
        if (role === 'technician') return isDark
            ? 'bg-amber-500/15 border-amber-500/20'
            : 'bg-amber-50 border-amber-200';
        return isDark
            ? 'bg-white/5 border-white/10'
            : 'bg-gray-50 border-gray-200';
    };

    return (
        <div className={`p-6 sm:p-8 border-t ${t.border}`}>
            <h3 className={`text-sm font-medium ${t.textLabel} mb-4 flex items-center gap-2`}>
                <MessageSquare size={16} className="text-indigo-400" />
                แชทสนทนา
                <span className={`text-xs ${t.textMuted}`}>({messages.length} ข้อความ)</span>
            </h3>

            {/* Messages list */}
            <div ref={chatContainerRef} className={`rounded-xl border ${t.border} ${isDark ? 'bg-black/20' : 'bg-gray-50/50'} p-4 max-h-80 overflow-y-auto space-y-3 mb-4`}>
                {messages.length === 0 && (
                    <p className={`text-center text-sm ${t.textMuted} py-8`}>ยังไม่มีข้อความ — เริ่มสนทนาเลย!</p>
                )}
                {messages.map((msg) => {
                    const isSelf = msg.sender_id === user.id;
                    return (
                        <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                            <div className={`flex gap-2.5 max-w-[80%] ${isSelf ? 'flex-row-reverse' : ''}`}>
                                {/* Avatar */}
                                {msg.sender_avatar ? (
                                    <img src={getImageUrl(msg.sender_avatar)} alt=""
                                        className={`w-8 h-8 rounded-full object-cover shrink-0 border ${isDark ? 'border-white/10' : 'border-gray-200'}`} />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                        {msg.sender_name?.charAt(0)}
                                    </div>
                                )}

                                {/* Bubble */}
                                <div>
                                    <div className={`flex items-center gap-2 mb-1 ${isSelf ? 'justify-end' : ''}`}>
                                        <span className={`text-xs font-medium ${t.textLabel}`}>{msg.sender_name}</span>
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
                                            {roleLabel[msg.sender_role] || msg.sender_role}
                                        </span>
                                    </div>
                                    <div className={`px-3.5 py-2.5 rounded-2xl border text-sm ${roleBubble(msg.sender_role, isSelf)} ${t.textPrimary}`}>
                                        {msg.message}
                                    </div>
                                    <p className={`text-[10px] mt-1 ${t.textMuted} ${isSelf ? 'text-right' : ''}`}>
                                        {new Date(msg.created_at).toLocaleString('th-TH', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Send form */}
            <form onSubmit={handleSend} className="flex gap-2">
                <input
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="พิมพ์ข้อความ..."
                    className={`flex-1 ${t.input} rounded-xl py-2.5 px-4 ${t.inputFocus} transition-all text-sm`}
                />
                <button type="submit" disabled={sending || !newMsg.trim()}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm">
                    {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    ส่ง
                </button>
            </form>
        </div>
    );
}
