'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { UploadCloud, CheckCircle2, Lock } from 'lucide-react';

export default function AdminPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [user, setUser] = useState<any>(null);

    const [title, setTitle] = useState('');
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [msg, setMsg] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setMsg(error.message);
        else setUser(data.user);
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!audioFile || !title) return;

        setUploading(true);
        setMsg('Uploading audio file...');

        try {
            // 1. Upload Audio
            const audioPath = `${Date.now()}_${audioFile.name}`;
            const { error: audioErr } = await supabase.storage.from('music').upload(audioPath, audioFile);
            if (audioErr) throw audioErr;

            const audioUrl = supabase.storage.from('music').getPublicUrl(audioPath).data.publicUrl;

            // 2. Upload Cover (if any)
            let coverUrl = '';
            if (coverFile) {
                const coverPath = `${Date.now()}_${coverFile.name}`;
                const { error: coverErr } = await supabase.storage.from('covers').upload(coverPath, coverFile);
                if (coverErr) throw coverErr;
                coverUrl = supabase.storage.from('covers').getPublicUrl(coverPath).data.publicUrl;
            }

            // 3. Save Record in Database
            const { error: insertErr } = await supabase.from('songs').insert([
                {
                    title,
                    artist: 'Her Vocals',
                    audio_url: audioUrl,
                    cover_url: coverUrl || null,
                },
            ]);
            if (insertErr) throw insertErr;

            setMsg('Gaana successfully publish ho gaya! 🎉');
            setTitle('');
            setAudioFile(null);
            setCoverFile(null);
        } catch (err: any) {
            setMsg(`Upload failed: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-[75vh] flex items-center justify-center px-4">
                <form onSubmit={handleLogin} className="w-full max-w-sm bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-xl">
                    <div className="flex items-center gap-2 mb-6">
                        <Lock className="w-5 h-5 text-pink-400" />
                        <h2 className="text-xl font-bold text-white">Admin Vault</h2>
                    </div>
                    {msg && <p className="text-red-400 text-sm mb-4">{msg}</p>}
                    <input
                        type="email"
                        placeholder="Admin Email"
                        className="w-full p-3 mb-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-pink-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-3 mb-6 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-pink-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white font-medium rounded-xl transition">
                        Login
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto px-6 pt-16">
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-xl">
                <h2 className="text-2xl font-bold text-white mb-2">Upload New Track</h2>
                <p className="text-sm text-white/50 mb-6">Sirf tum gaane upload kar sakte ho.</p>

                {msg && (
                    <div className="flex items-center gap-2 p-3 bg-pink-500/10 border border-pink-500/20 text-pink-300 rounded-xl text-sm mb-6">
                        <CheckCircle2 className="w-4 h-4" /> {msg}
                    </div>
                )}

                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-white/60 block mb-1.5">Song Title</label>
                        <input
                            type="text"
                            placeholder="e.g. Raabta (Acoustic Cover)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-pink-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-white/60 block mb-1.5">Audio File (.mp3, .wav, .m4a)</label>
                        <input
                            type="file"
                            accept="audio/*"
                            onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                            className="w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-white/60 block mb-1.5">Cover Image (Optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                            className="w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-white/60 block mb-1.5">Lyrics / Notes (Optional)</label>
                        <textarea
                            rows={4}
                            placeholder="Line by line lyrics daal yahan..."
                            value={lyrics}
                            onChange={(e) => setLyrics(e.target.value)}
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white outline-none focus:border-pink-500 text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        className="w-full py-3 mt-4 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                        <UploadCloud className="w-5 h-5" />
                        {uploading ? 'Publishing...' : 'Upload & Publish Song'}
                    </button>
                </form>
            </div>
        </div>
    );
}