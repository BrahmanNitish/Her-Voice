'use client';

import React, { useState } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Mic2,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export default function BottomPlayer() {
  const {
    currentSong,
    isPlaying,
    togglePlay,
    playNext,
    playPrev,
    isShuffle,
    isRepeat,
    toggleShuffle,
    toggleRepeat,
    currentTime,
    duration,
    seekTo,
    volume,
    setVolume,
  } = usePlayer();

  const [showLyrics, setShowLyrics] = useState(false);

  if (!currentSong) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <>
      {/* Full-Screen Spotify/Apple Music Style Lyrics Overlay */}
      {showLyrics && (
        <div className="fixed inset-0 bg-[#07070a]/95 backdrop-blur-3xl z-50 p-6 sm:p-12 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center max-w-4xl mx-auto w-full">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-pink-400" />
              <span className="text-xs uppercase tracking-widest text-pink-400 font-semibold">
                Lyrics Studio
              </span>
            </div>
            <button
              onClick={() => setShowLyrics(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>

          <div className="max-w-2xl mx-auto my-auto text-center space-y-6 overflow-y-auto max-h-[60vh] py-10 px-4">
            {currentSong.lyrics ? (
              currentSong.lyrics.split('\n').map((line, idx) => (
                <p
                  key={idx}
                  className="text-2xl sm:text-4xl font-extrabold text-white/80 hover:text-pink-300 transition duration-300 cursor-default"
                >
                  {line || '♪ ♪ ♪'}
                </p>
              ))
            ) : (
              <p className="text-white/40 text-xl font-medium italic">
                No lyrics transcribed for this session yet.
              </p>
            )}
          </div>

          <div className="max-w-4xl mx-auto w-full text-center text-xs text-white/30">
            {currentSong.title} — {currentSong.artist}
          </div>
        </div>
      )}

      {/* Persistent Spotify-Style Player Dock */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[96%] max-w-5xl bg-[#121216]/90 backdrop-blur-3xl border border-white/10 p-3 px-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-between z-40">
        
        {/* Track Info */}
        <div className="flex items-center space-x-3.5 min-w-[180px] max-w-[240px]">
          <img
            src={currentSong.cover_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150'}
            alt={currentSong.title}
            className="w-13 h-13 rounded-2xl object-cover ring-1 ring-white/15"
          />
          <div className="truncate">
            <p className="font-semibold text-white text-sm truncate">{currentSong.title}</p>
            <p className="text-xs text-white/40 truncate">{currentSong.artist}</p>
          </div>
        </div>

        {/* Center Main Controls & Scrubber */}
        <div className="flex-1 max-w-lg mx-6 flex flex-col items-center">
          <div className="flex items-center gap-5">
            <button
              onClick={toggleShuffle}
              className={`transition ${isShuffle ? 'text-pink-400 scale-110' : 'text-white/40 hover:text-white'}`}
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button onClick={playPrev} className="text-white/70 hover:text-white active:scale-95 transition">
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button
              onClick={togglePlay}
              className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:scale-105 active:scale-95 text-white rounded-full shadow-lg shadow-pink-500/25 transition"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>
            <button onClick={playNext} className="text-white/70 hover:text-white active:scale-95 transition">
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
            <button
              onClick={toggleRepeat}
              className={`transition ${isRepeat ? 'text-pink-400 scale-110' : 'text-white/40 hover:text-white'}`}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          <div className="w-full flex items-center gap-2.5 mt-2">
            <span className="text-[11px] font-mono text-white/40 w-8 text-right">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime || 0}
              onChange={(e) => seekTo(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
            <span className="text-[11px] font-mono text-white/40 w-8">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Tools (Lyrics & Volume) */}
        <div className="hidden md:flex items-center space-x-3">
          <button
            onClick={() => setShowLyrics(!showLyrics)}
            className={`p-2 rounded-xl transition ${
              showLyrics ? 'bg-pink-500/20 text-pink-400' : 'text-white/40 hover:text-white bg-white/5'
            }`}
            title="Show Lyrics"
          >
            <Mic2 className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)} className="text-white/40 hover:text-white">
              {volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500"
            />
          </div>
        </div>

      </div>
    </>
  );
}