'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
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

interface LyricLine {
  time: number;
  text: string;
}

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
  const activeLineRef = useRef<HTMLParagraphElement | null>(null);

  // 1. LRC Timestamp Parser: [mm:ss] format ko seconds me convert karega aur bracket strip karega
  const parsedLyrics = useMemo<LyricLine[]>(() => {
    if (!currentSong?.lyrics) return [];

    const lines = currentSong.lyrics.split('\n');
    const result: LyricLine[] = [];
    const lrcRegex = /\[(\d{1,2}):(\d{2}(?:\.\d+)?)\]/;

    lines.forEach((line) => {
      const match = line.match(lrcRegex);
      if (match) {
        const mins = parseInt(match[1], 10);
        const secs = parseFloat(match[2]);
        const totalSeconds = mins * 60 + secs;
        const cleanText = line.replace(lrcRegex, '').trim();
        if (cleanText) {
          result.push({ time: totalSeconds, text: cleanText });
        }
      } else if (line.trim()) {
        result.push({ time: -1, text: line.trim() });
      }
    });

    return result.sort((a, b) => a.time - b.time);
  }, [currentSong?.lyrics]);

  // 2. Currently playing active lyric line index find karna
  const activeIndex = useMemo(() => {
    if (parsedLyrics.length === 0) return -1;
    let idx = -1;
    for (let i = 0; i < parsedLyrics.length; i++) {
      if (currentTime >= parsedLyrics[i].time && parsedLyrics[i].time !== -1) {
        idx = i;
      } else if (parsedLyrics[i].time > currentTime) {
        break;
      }
    }
    return idx;
  }, [currentTime, parsedLyrics]);

  // 3. Spotify Auto Scroll to active line
  useEffect(() => {
    if (showLyrics && activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex, showLyrics]);

  if (!currentSong) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <>
      {/* SPOTIFY SYNCED LYRICS FULLSCREEN OVERLAY */}
      {showLyrics && (
        <div className="fixed inset-0 bg-[#08080c]/95 backdrop-blur-3xl z-50 flex flex-col justify-between animate-in fade-in duration-300">
          {/* Header */}
          <div className="flex justify-between items-center max-w-4xl mx-auto w-full p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-pink-400" />
              <span className="text-xs uppercase tracking-[0.2em] text-pink-400 font-bold">
                Synced Lyrics
              </span>
            </div>
            <button
              onClick={() => setShowLyrics(false)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <ChevronDown className="w-6 h-6" />
            </button>
          </div>

          {/* Scrolling Lyrics Box */}
          <div className="flex-1 overflow-y-auto px-6 max-w-3xl mx-auto w-full space-y-10 py-32 text-center sm:text-left scroll-smooth">
            {parsedLyrics.length > 0 ? (
              parsedLyrics.map((item, idx) => {
                const isActive = idx === activeIndex;
                const isPassed = activeIndex !== -1 && idx < activeIndex;

                return (
                  <p
                    key={idx}
                    ref={isActive ? activeLineRef : null}
                    onClick={() => {
                      if (item.time >= 0) seekTo(item.time);
                    }}
                    className={`cursor-pointer transition-all duration-300 select-none font-bold text-2xl sm:text-4xl ${
                      isActive
                        ? 'text-white scale-105 origin-left drop-shadow-[0_0_25px_rgba(236,72,153,0.8)]'
                        : isPassed
                        ? 'text-white/30 hover:text-white/60'
                        : 'text-white/20 hover:text-white/50'
                    }`}
                  >
                    {item.text}
                  </p>
                );
              })
            ) : (
              <p className="text-white/40 text-xl font-medium text-center italic py-16">
                No lyrics available for this track.
              </p>
            )}
          </div>

          {/* Bottom Info */}
          <div className="max-w-4xl mx-auto w-full p-6 text-center text-xs text-white/30 border-t border-white/5">
            {currentSong.title} — {currentSong.artist}
          </div>
        </div>
      )}

      {/* FLOATING BOTTOM BAR */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[96%] max-w-5xl bg-[#121216]/90 backdrop-blur-3xl border border-white/10 p-3 px-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-between z-40">
        <div className="flex items-center space-x-3.5 min-w-[180px] max-w-[240px]">
          <img
            src={currentSong.cover_url || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=150'}
            alt={currentSong.title}
            className="w-12 h-12 rounded-2xl object-cover ring-1 ring-white/15"
          />
          <div className="truncate">
            <p className="font-semibold text-white text-sm truncate">{currentSong.title}</p>
            <p className="text-xs text-white/40 truncate">{currentSong.artist}</p>
          </div>
        </div>

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
              className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:scale-105 active:scale-95 text-white rounded-full shadow-lg shadow-pink-500/25 transition cursor-pointer"
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

        <div className="hidden md:flex items-center space-x-3">
          <button
            onClick={() => setShowLyrics(!showLyrics)}
            className={`p-2 rounded-xl transition cursor-pointer ${
              showLyrics ? 'bg-pink-500/20 text-pink-400' : 'text-white/40 hover:text-white bg-white/5'
            }`}
            title="Lyrics Studio"
          >
            <Mic2 className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)} className="text-white/40 hover:text-white">
              {volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-white/70" />}
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