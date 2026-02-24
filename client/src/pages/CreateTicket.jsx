import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import Navbar from '../components/Navbar';
import { Upload, X, Loader2, ImagePlus, Send } from 'lucide-react';

export default function CreateTicket() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const fileRef = useRef(null);

    const [form, setForm] = useState({ title: '', room_number: '', description: '' });
    const [imageFile, setImageFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const clearImage = () => {
        setImageFile(null);
        setPreview(null);
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) {
            setError('กรุณากรอกหัวข้อ');
            return;
        }
        setError('');
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', form.title);
            formData.append('description', form.description);
            formData.append('room_number', form.room_number);
            formData.append('created_by', user.id);
            if (imageFile) formData.append('image_before', imageFile);

            await api.post('/tickets', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
                <h1 className="text-2xl font-bold text-white mb-2">แจ้งซ่อมใหม่</h1>
                <p className="text-gray-400 mb-8">กรอกรายละเอียดปัญหาที่ต้องการแจ้งซ่อม</p>

                <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                หัวข้อ <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="เช่น ก๊อกน้ำห้องน้ำรั่ว"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                            />
                        </div>

                        {/* Room */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">หมายเลขห้อง</label>
                            <input
                                type="text"
                                name="room_number"
                                value={form.room_number}
                                onChange={handleChange}
                                placeholder="เช่น 301"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">รายละเอียด</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="อธิบายรายละเอียดปัญหาเพิ่มเติม..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none"
                            />
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                ภาพประกอบ (ก่อนซ่อม)
                            </label>
                            {preview ? (
                                <div className="relative rounded-xl overflow-hidden border border-white/10">
                                    <img src={preview} alt="Preview" className="w-full h-56 object-cover" />
                                    <button
                                        type="button"
                                        onClick={clearImage}
                                        className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white hover:bg-red-500 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="w-full border-2 border-dashed border-white/15 rounded-xl py-12 text-center hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group"
                                >
                                    <ImagePlus size={36} className="mx-auto text-gray-600 group-hover:text-indigo-400 mb-2 transition-colors" />
                                    <p className="text-sm text-gray-400 group-hover:text-indigo-300 transition-colors">
                                        คลิกเพื่ออัปโหลดรูปภาพ
                                    </p>
                                    <p className="text-xs text-gray-600 mt-1">รองรับไฟล์ JPG, PNG, WebP</p>
                                </button>
                            )}
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    กำลังส่ง...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    ส่งคำร้องแจ้งซ่อม
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
