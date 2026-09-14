'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { usePlayer, Song } from '@/context/PlayerContext';
import {
  Play,
  Pause,
  Shuffle,
  Heart,
  Search,
  ListMusic,
  Home as HomeIcon,
  Compass,
  Sparkles,
  Music2,
  Share2,
  Radio,
} from 'lucide-react';

interface FloatingReaction {
  id: number;
  emoji: string;
  x: number;
}

export default function SpotifyPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [showQueue, setShowQueue] = useState(false);
  const [likedSongs, setLikedSongs] = useState<Record<string, boolean>>({});

  const {
    playSong,
    currentSong,
    isPlaying,
    togglePlay,
    setPlaylist,
    playlist,
    toggleShuffle,
    isShuffle,
  } = usePlayer();

  useEffect(() => {
    const fetchTracks = async () => {
      const { data } = await supabase.from('songs').select('*').order('created_at', { ascending: false });
      if (data) {
        setSongs(data);
        setPlaylist(data);
      }
    };
    fetchTracks();
  }, [setPlaylist]);

  // Play All Button
  const handlePlayAll = () => {
    if (songs.length === 0) return;
    if (currentSong && isPlaying) {
      togglePlay();
    } else {
      playSong(songs[0]);
    }
  };

  // Live Flying Reaction Trigger
  const triggerReaction = (emoji: string) => {
    const newReaction: FloatingReaction = {
      id: Date.now() + Math.random(),
      emoji,
      x: Math.random() * 80 + 10, // 10% to 90% screen width
    };
    setReactions((prev) => [...prev, newReaction]);
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 2500);
  };

  // Like Song
  const handleLike = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikedSongs((prev) => ({ ...prev, [id]: !prev[id] }));
    await supabase.rpc('increment_likes', { song_id: id });
    setSongs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, likes: (s.likes || 0) + 1 } : s))
    );
  };

  const filteredSongs = songs.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-black text-[#b3b3b3] font-sans overflow-hidden select-none">
      
      {/* Floating Reaction Emojis Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {reactions.map((r) => (
          <div
            key={r.id}
            style={{ left: `${r.x}%` }}
            className="absolute bottom-24 text-3xl sm:text-4xl animate-bounce-float transition-all opacity-90"
          >
            {r.emoji}
          </div>
        ))}
      </div>

      {/* LEFT SIDEBAR (Spotify Library Style) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#121212] rounded-xl m-2 mr-0 p-4 gap-6">
        <div className="flex items-center gap-2.5 px-2 text-white font-bold text-lg tracking-tight">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-lg">
            <Music2 className="w-4 h-4" />
          </div>
          <span>Aura Player</span>
        </div>

        <nav className="flex flex-col gap-1">
          <button className="flex items-center gap-4 px-3 py-2.5 rounded-lg text-white bg-white/10 font-semibold text-sm transition">
            <HomeIcon className="w-5 h-5 text-white" /> Home
          </button>
          <button className="flex items-center gap-4 px-3 py-2.5 rounded-lg hover:text-white font-semibold text-sm transition">
            <Compass className="w-5 h-5" /> Explore Recordings
          </button>
          <a
            href="/admin"
            className="flex items-center gap-4 px-3 py-2.5 rounded-lg hover:text-white font-semibold text-sm transition text-pink-400/90"
          >
            <Sparkles className="w-5 h-5 text-pink-400" /> Admin Studio
          </a>
        </nav>

        {/* Playlists & Live Reactions Dock */}
        <div className="flex-1 bg-[#181818] rounded-xl p-4 flex flex-col justify-between overflow-hidden">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-white text-xs font-bold uppercase tracking-wider">
              <span>Live Reactions</span>
              <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-white/40">Tap emoji to react live while listening:</p>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {['❤️', '🔥', '✨', '🥹', '👏', '🎧', '💯', '🌸'].map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => triggerReaction(emoji)}
                  className="h-10 bg-white/5 hover:bg-white/15 hover:scale-125 rounded-xl text-lg flex items-center justify-center transition active:scale-95"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-xl border border-pink-500/20 text-xs">
            <p className="text-white font-medium mb-1">Dedicated Vault</p>
            <p className="text-white/50 text-[11px]">All unreleased voice notes and acoustic session archives.</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col m-2 bg-[#121212] rounded-xl overflow-hidden relative">
        
        {/* TOP SEARCH BAR */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-[#121212]/80 backdrop-blur-md border-b border-white/5">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search recordings, covers, acoustic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#242424] hover:bg-[#2a2a2a] focus:bg-[#2a2a2a] text-sm text-white placeholder-white/40 rounded-full border border-transparent focus:border-white/20 outline-none transition"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQueue(!showQueue)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                showQueue ? 'bg-pink-500/20 border-pink-500 text-pink-400' : 'bg-[#242424] border-white/10 hover:text-white'
              }`}
            >
              <ListMusic className="w-4 h-4" /> Queue ({playlist.length})
            </button>
          </div>
        </header>

        {/* SCROLLABLE VIEW */}
        <div className="flex-1 overflow-y-auto pb-32 px-6 pt-4 space-y-8">
          
          {/* SPOTIFY HERO HEADER */}
          <section className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-pink-950/70 via-[#231520] to-[#181818] border border-white/5">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
              <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.7)] flex-shrink-0 group">
                <img
                  src={songs[0]?.cover_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'}
                  alt="Artist Cover"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>

              <div className="space-y-3 text-center sm:text-left flex-1">
                <span className="text-xs uppercase font-bold text-pink-400 tracking-wider">
                  Verified Artist Discography
                </span>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                  Her Studio Sessions
                </h1>
                <p className="text-sm text-white/60">
                  Curated raw covers, recordings, and soulful vocal snippets.
                </p>

                {/* PLAY ALL / CONTROLS ROW */}
                <div className="flex items-center justify-center sm:justify-start gap-4 pt-3">
                  <button
                    onClick={handlePlayAll}
                    className="w-14 h-14 rounded-full bg-[#1ed760] hover:bg-[#1fdf64] hover:scale-105 active:scale-95 text-black flex items-center justify-center shadow-xl transition"
                  >
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                  </button>

                  <button
                    onClick={toggleShuffle}
                    className={`p-3 rounded-full hover:scale-105 active:scale-95 transition ${
                      isShuffle ? 'text-[#1ed760]' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Shuffle className="w-6 h-6" />
                  </button>

                  <button
                    onClick={() => navigator.clipboard?.writeText(window.location.href)}
                    className="p-3 text-white/60 hover:text-white rounded-full transition"
                    title="Share Link"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* SPOTIFY ALBUM CARDS GRID */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white tracking-tight hover:underline cursor-pointer">
                Trending Recordings
              </h2>
              <span className="text-xs font-semibold text-white/40">{filteredSongs.length} Tracks</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredSongs.map((song) => {
                const active = currentSong?.id === song.id;
                return (
                  <div
                    key={song.id}
                    onClick={() => playSong(song)}
                    className="group relative bg-[#181818] hover:bg-[#282828] p-3.5 rounded-xl transition duration-300 cursor-pointer flex flex-col"
                  >
                    <div className="relative aspect-square w-full rounded-lg overflow-hidden mb-3 bg-[#242424] shadow-md">
                      <img
                        src={song.cover_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300'}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Hover Floating Play Button */}
                      <div
                        className={`absolute right-2 bottom-2 w-11 h-11 rounded-full bg-[#1ed760] text-black shadow-2xl flex items-center justify-center transition duration-300 ${
                          active && isPlaying
                            ? 'opacity-100 translate-y-0 scale-100'
                            : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                        }`}
                      >
                        {active && isPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </div>
                    </div>

                    <p className={`font-bold text-sm truncate ${active ? 'text-[#1ed760]' : 'text-white'}`}>
                      {song.title}
                    </p>
                    <p className="text-xs text-white/40 truncate mt-1">{song.artist}</p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                      <span className="text-[11px] text-white/30">{song.duration || '3:20'}</span>
                      <button
                        onClick={(e) => handleLike(e, song.id)}
                        className={`flex items-center gap-1 text-xs transition ${
                          likedSongs[song.id] ? 'text-pink-500' : 'text-white/30 hover:text-pink-400'
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${likedSongs[song.id] ? 'fill-current' : ''}`} />
                        <span>{song.likes || 0}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

        </div>

        {/* SLIDE-OVER QUEUE DRAWER */}
        {showQueue && (
          <div className="absolute right-0 top-14 bottom-0 w-80 bg-[#141414] border-l border-white/10 p-5 z-30 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-pink-400" /> Play Queue
            </h3>
            <div className="flex-1 overflow-y-auto space-y-2">
              {playlist.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => playSong(s)}
                  className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer text-xs ${
                    currentSong?.id === s.id ? 'bg-white/10 text-pink-400 font-bold' : 'hover:bg-white/5 text-white/70'
                  }`}
                >
                  <span className="text-white/30 w-4">{idx + 1}</span>
                  <img src={s.cover_url} className="w-8 h-8 rounded object-cover" />
                  <div className="truncate">
                    <p className="truncate text-white">{s.title}</p>
                    <p className="truncate text-white/40 text-[10px]">{s.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}