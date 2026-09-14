'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

export interface Song {
  id: string;
  title: string;
  artist: string;
  audio_url: string;
  cover_url: string;
  duration?: string;
  lyrics?: string;
  likes?: number;
}

interface PlayerContextType {
  playlist: Song[];
  setPlaylist: (songs: Song[]) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playSong: (song: Song) => void;
  togglePlay: () => void;
  playNext: () => void;
  playPrev: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setVolume: (val: number) => void;
  seekTo: (seconds: number) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = song.audio_url;
      audioRef.current.play();
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentSong) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    if (!currentSong || playlist.length === 0) return;
    if (isShuffle) {
      const randomIdx = Math.floor(Math.random() * playlist.length);
      playSong(playlist[randomIdx]);
      return;
    }
    const currIdx = playlist.findIndex((s) => s.id === currentSong.id);
    const nextSong = playlist[(currIdx + 1) % playlist.length];
    playSong(nextSong);
  };

  const playPrev = () => {
    if (!currentSong || playlist.length === 0) return;
    const currIdx = playlist.findIndex((s) => s.id === currentSong.id);
    const prevSong = playlist[(currIdx - 1 + playlist.length) % playlist.length];
    playSong(prevSong);
  };

  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleRepeat = () => setIsRepeat(!isRepeat);

  const setVolume = (val: number) => {
    setVolumeState(val);
    if (audioRef.current) audioRef.current.volume = val;
  };

  const seekTo = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => {
      if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        playNext();
      }
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [currentSong, playlist, isRepeat, isShuffle]);

  return (
    <PlayerContext.Provider
      value={{
        playlist,
        setPlaylist,
        currentSong,
        isPlaying,
        isShuffle,
        isRepeat,
        currentTime,
        duration,
        volume,
        playSong,
        togglePlay,
        playNext,
        playPrev,
        toggleShuffle,
        toggleRepeat,
        setVolume,
        seekTo,
        audioRef,
      }}
    >
      {children}
      <audio ref={audioRef} />
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used inside PlayerProvider');
  return context;
};