import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, ListMusic, Volume2, VolumeX, Shuffle, Repeat, Youtube, Download } from 'lucide-react';
import { Track, PlayerState } from '../types';

interface PlayerProps {
  tracks: Track[];
  playerState: PlayerState;
  onPlay: () => void;
  onPause: () => void;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (seconds: number) => void;
  onSelectTrack: (index: number) => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onOpenChangeYouTube: () => void;
  onOpenDownload: () => void;
  isCustomSource?: boolean;
}

export default function Player({
  tracks,
  playerState,
  onPlay,
  onPause,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onSelectTrack,
  onToggleShuffle,
  onToggleRepeat,
  onOpenChangeYouTube,
  onOpenDownload,
  isCustomSource,
}: PlayerProps) {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);
  const [showPlaylistDrawer, setShowPlaylistDrawer] = useState(false);
  const desktopBarRef = useRef<HTMLDivElement>(null);
  const mobileBarRef = useRef<HTMLDivElement>(null);

  const currentTrack = tracks[playerState.currentTrackIndex] || tracks[0];

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = playerState.duration > 0
    ? Math.min(100, Math.max(0, ((isSeeking ? seekValue : playerState.currentTime) / playerState.duration) * 100))
    : 0;

  // Handle Seek interaction
  const handleSeekStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, barRef: React.RefObject<HTMLDivElement | null>) => {
    if (!barRef.current || playerState.duration <= 0) return;
    setIsSeeking(true);
    updateSeekFromEvent(e, barRef);
  };

  const updateSeekFromEvent = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, barRef: React.RefObject<HTMLDivElement | null>) => {
    if (!barRef.current || playerState.duration <= 0) return;
    const rect = barRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const ratio = offsetX / rect.width;
    const targetSeconds = ratio * playerState.duration;
    setSeekValue(targetSeconds);
  };

  const handleSeekEnd = () => {
    if (isSeeking) {
      onSeek(seekValue);
      setIsSeeking(false);
    }
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSeeking) {
        onSeek(seekValue);
        setIsSeeking(false);
      }
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('touchend', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [isSeeking, seekValue, onSeek]);

  return (
    <div className="w-full flex flex-col items-center select-none pointer-events-auto">
      {/* Autoplay Blocked / Tap to Play notification pill */}
      {playerState.autoplayBlocked && !playerState.isPlaying && (
        <button
          id="tap-to-play-banner"
          type="button"
          onClick={onPlay}
          className="mb-3 px-5 py-2 rounded-full border border-rose-400/40 bg-black/60 backdrop-blur-2xl text-white text-[13px] font-medium shadow-[0_8px_32px_rgba(244,63,94,0.35)] flex items-center gap-2 hover:scale-105 transition-all duration-300 animate-bounce cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-rose-400 text-rose-400" />
          <span>Tap to start music stream</span>
        </button>
      )}

      {/* Playlist Selector Drawer (Modal/Flyout) */}
      {showPlaylistDrawer && (
        <div
          id="playlist-flyout"
          className="mb-3 w-full max-w-md rounded-2xl border border-white/10 bg-black/80 backdrop-blur-3xl p-3 shadow-2xl transition-all duration-200"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2 px-1 gap-2">
            <span className="text-[12px] font-semibold tracking-wide uppercase text-white/70 flex items-center gap-1.5 truncate">
              <ListMusic className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="truncate">
                {isCustomSource ? 'Custom YouTube Source' : `Tracklist (${tracks.length})`}
              </span>
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                id="drawer-download-btn"
                type="button"
                onClick={() => {
                  setShowPlaylistDrawer(false);
                  onOpenDownload();
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[11px] font-medium transition-all"
                title="Download in .MP3 or .MP4"
              >
                <Download className="w-3 h-3 text-white" />
                <span>Download</span>
              </button>
              <button
                id="drawer-change-yt-btn"
                type="button"
                onClick={() => {
                  setShowPlaylistDrawer(false);
                  onOpenChangeYouTube();
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[11px] font-medium transition-all"
                title="Change YouTube URL or playlist"
              >
                <Youtube className="w-3 h-3 text-rose-400" />
                <span>Change URL</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPlaylistDrawer(false)}
                className="text-[11px] text-white/50 hover:text-white px-2 py-0.5 rounded-full hover:bg-white/10"
              >
                Close
              </button>
            </div>
          </div>
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
            {tracks.map((t, idx) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onSelectTrack(idx);
                  setShowPlaylistDrawer(false);
                }}
                className={`w-full text-left flex items-center gap-3 p-2 rounded-xl transition-all ${
                  idx === playerState.currentTrackIndex
                    ? 'bg-rose-500/20 border border-rose-500/30 text-white'
                    : 'hover:bg-white/10 text-white/80'
                }`}
              >
                <img
                  src={t.thumbnail}
                  alt={t.title}
                  referrerPolicy="no-referrer"
                  className="w-9 h-9 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium truncate">{t.title}</div>
                  <div className="text-[11.5px] text-white/60 truncate">{t.artist}</div>
                </div>
                {idx === playerState.currentTrackIndex && (
                  <span className="text-rose-400 text-[11px] font-mono shrink-0">
                    {playerState.isPlaying ? 'Playing' : 'Paused'}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          DESKTOP PLAYER: One horizontal floating glass pill (hidden sm:flex)
          Exact recipe:
          border border-white/10
          bg-gradient-to-b from-white/[0.15] to-white/[0.055]
          backdrop-blur-3xl backdrop-saturate-[1.7]
          shadow-[0_16px_48px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)]
          rounded-full p-3 pr-5
          ========================================================================= */}
      <div
        id="desktop-player-pill"
        className="hidden sm:flex items-center gap-4 w-full max-w-xl rounded-full p-3 pr-5 border border-white/10 bg-gradient-to-b from-white/[0.15] to-white/[0.055] backdrop-blur-3xl backdrop-saturate-[1.7] shadow-[0_16px_48px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-300"
      >
        {/* Spinning vinyl: cover art in a circle, 80px, animation: spin 8s linear infinite */}
        <div
          id="desktop-vinyl-disc"
          className="w-20 h-20 shrink-0 rounded-full relative overflow-hidden ring-1 ring-white/20 shadow-[0_4px_24px_rgba(0,0,0,0.6)] cursor-pointer group"
          onClick={onTogglePlay}
          title={playerState.isPlaying ? 'Pause' : 'Play'}
        >
          {/* Outer vinyl disc grooves with rotating cover */}
          <div
            className="w-full h-full rounded-full overflow-hidden animate-vinyl-spin"
            style={{
              animationPlayState: playerState.isPlaying ? 'running' : 'paused',
            }}
          >
            <img
              src={currentTrack.thumbnail}
              alt={currentTrack.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-full"
            />
            {/* Vinyl record concentric grooves overlay */}
            <div className="absolute inset-0 rounded-full vinyl-grooves pointer-events-none" />
          </div>

          {/* Absolutely centre a 12px bg-black/70 ring-2 ring-white/40 circle on top as the spindle hole */}
          <div
            id="desktop-spindle-hole"
            className="w-3 h-3 rounded-full bg-black/70 ring-2 ring-white/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none shadow-inner"
          />
        </div>

        {/* Center section: Title, artist, seek bar, time display */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {/* Title (15px semibold) and artist (12.5px white/70), both truncate */}
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <div className="min-w-0 flex-1">
              <span className="text-[15px] font-semibold text-white truncate block leading-snug tracking-tight">
                {currentTrack.title}
              </span>
              <span className="text-[12.5px] text-white/70 truncate block leading-snug">
                {currentTrack.artist}
              </span>
            </div>

            {/* Quick Download MP3/MP4 Button (Black & White) */}
            <button
              id="desktop-download-btn"
              type="button"
              onClick={onOpenDownload}
              className="shrink-0 p-1.5 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition-colors"
              title="Download in .MP3 or .MP4"
              aria-label="Download in .MP3 or .MP4"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Quick Change YouTube URL Button */}
            <button
              id="desktop-change-yt-btn"
              type="button"
              onClick={onOpenChangeYouTube}
              className="shrink-0 p-1.5 rounded-full hover:bg-rose-500/20 text-rose-400/90 hover:text-rose-300 transition-colors"
              title="Change YouTube URL"
              aria-label="Change YouTube URL"
            >
              <Youtube className="w-4 h-4" />
            </button>

            {/* Quick Playlist Drawer Toggle */}
            <button
              type="button"
              onClick={() => setShowPlaylistDrawer(!showPlaylistDrawer)}
              className="shrink-0 p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              title="View Playlist"
              aria-label="View Playlist"
            >
              <ListMusic className="w-4 h-4" />
            </button>
          </div>

          {/* Seek bar: 24px invisible hit area, 3px visible rail bg-white/15 fill in accent colour with soft glow */}
          <div
            id="desktop-seek-hitarea"
            ref={desktopBarRef}
            onMouseDown={(e) => handleSeekStart(e, desktopBarRef)}
            onTouchStart={(e) => handleSeekStart(e, desktopBarRef)}
            className="h-6 flex items-center relative cursor-pointer group"
          >
            {/* 3px visible rail */}
            <div className="h-[3px] w-full rounded-full bg-white/15 relative overflow-hidden sm:overflow-visible">
              {/* Fill in accent color with soft glow */}
              <div
                id="desktop-seek-progress"
                className="h-full rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)] transition-all duration-75"
                style={{ width: `${progressPercent}%` }}
              />
              {/* Knob visible on hover only */}
              <div
                id="desktop-seek-knob"
                className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_rgba(244,63,94,0.9)] absolute top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                style={{ left: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Elapsed / duration in 10.5px tabular-nums */}
          <div className="flex items-center justify-between text-[10.5px] font-mono tabular-nums text-white/60 -mt-0.5">
            <span>{formatTime(isSeeking ? seekValue : playerState.currentTime)}</span>
            <span>{formatTime(playerState.duration || currentTrack.duration)}</span>
          </div>
        </div>

        {/* Transport on the right: prev, play/pause, next */}
        <div id="desktop-transport-controls" className="flex items-center gap-1.5 shrink-0 pl-1">
          <button
            id="desktop-prev-btn"
            type="button"
            onClick={onPrev}
            aria-label="Previous track"
            title="Previous track"
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            id="desktop-play-pause-btn"
            type="button"
            onClick={onTogglePlay}
            aria-label={playerState.isPlaying ? 'Pause' : 'Play'}
            title={playerState.isPlaying ? 'Pause' : 'Play'}
            className="p-3 rounded-full bg-white text-black hover:bg-white/95 hover:scale-105 active:scale-95 transition-all shadow-[0_0_16px_rgba(255,255,255,0.3)]"
          >
            {playerState.isPlaying ? (
              <Pause className="w-4 h-4 fill-current text-black" />
            ) : (
              <Play className="w-4 h-4 fill-current text-black ml-0.5" />
            )}
          </button>

          <button
            id="desktop-next-btn"
            type="button"
            onClick={onNext}
            aria-label="Next track"
            title="Next track"
            className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>
      </div>

      {/* =========================================================================
          MOBILE PLAYER: Stacked card on mobile (sm:hidden)
          Two separate blocks, not one reflowing layout.
          Using exact same glass recipe.
          ========================================================================= */}
      <div
        id="mobile-player-card"
        className="sm:hidden flex flex-col w-[calc(100vw-2rem)] max-w-sm rounded-3xl p-4 border border-white/10 bg-gradient-to-b from-white/[0.15] to-white/[0.055] backdrop-blur-3xl backdrop-saturate-[1.7] shadow-[0_16px_48px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-300"
      >
        {/* Top row: spinning vinyl + info + playlist icon */}
        <div className="flex items-center gap-3.5 mb-3">
          {/* Vinyl: 64px spinning circle */}
          <div
            id="mobile-vinyl-disc"
            className="w-16 h-16 shrink-0 rounded-full relative overflow-hidden ring-1 ring-white/20 shadow-md cursor-pointer"
            onClick={onTogglePlay}
          >
            <div
              className="w-full h-full rounded-full overflow-hidden animate-vinyl-spin"
              style={{
                animationPlayState: playerState.isPlaying ? 'running' : 'paused',
              }}
            >
              <img
                src={currentTrack.thumbnail}
                alt={currentTrack.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full"
              />
              <div className="absolute inset-0 rounded-full vinyl-grooves pointer-events-none" />
            </div>

            {/* 12px spindle hole */}
            <div
              id="mobile-spindle-hole"
              className="w-3 h-3 rounded-full bg-black/70 ring-2 ring-white/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none shadow-inner"
            />
          </div>

          {/* Title & Artist */}
          <div className="flex-1 min-w-0">
            <span className="text-[15px] font-semibold text-white truncate block leading-snug">
              {currentTrack.title}
            </span>
            <span className="text-[12.5px] text-white/70 truncate block leading-snug">
              {currentTrack.artist}
            </span>
          </div>

          {/* Quick Download MP3/MP4 Button (Black & White) */}
          <button
            id="mobile-download-btn"
            type="button"
            onClick={onOpenDownload}
            className="shrink-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white mr-1"
            title="Download in .MP3 or .MP4"
            aria-label="Download in .MP3 or .MP4"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Quick Change YouTube URL Button */}
          <button
            id="mobile-change-yt-btn"
            type="button"
            onClick={onOpenChangeYouTube}
            className="shrink-0 p-2 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 mr-1"
            title="Change YouTube URL"
            aria-label="Change YouTube URL"
          >
            <Youtube className="w-4 h-4" />
          </button>

          {/* Playlist drawer toggle */}
          <button
            type="button"
            onClick={() => setShowPlaylistDrawer(!showPlaylistDrawer)}
            className="shrink-0 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70"
            aria-label="Playlist"
          >
            <ListMusic className="w-4 h-4" />
          </button>
        </div>

        {/* Seek bar: 24px invisible hit area, 3px visible rail */}
        <div
          id="mobile-seek-hitarea"
          ref={mobileBarRef}
          onMouseDown={(e) => handleSeekStart(e, mobileBarRef)}
          onTouchStart={(e) => handleSeekStart(e, mobileBarRef)}
          className="h-6 flex items-center relative cursor-pointer group"
        >
          <div className="h-[3px] w-full rounded-full bg-white/15 relative">
            <div
              id="mobile-seek-progress"
              className="h-full rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.7)]"
              style={{ width: `${progressPercent}%` }}
            />
            <div
              id="mobile-seek-knob"
              className="w-3 h-3 rounded-full bg-white shadow-[0_0_8px_rgba(244,63,94,0.9)] absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
              style={{ left: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Elapsed / duration in 10.5px tabular-nums */}
        <div className="flex items-center justify-between text-[10.5px] font-mono tabular-nums text-white/60 -mt-1 mb-2">
          <span>{formatTime(isSeeking ? seekValue : playerState.currentTime)}</span>
          <span>{formatTime(playerState.duration || currentTrack.duration)}</span>
        </div>

        {/* Mobile Transport controls */}
        <div id="mobile-transport-controls" className="flex items-center justify-between px-2 pt-1">
          <button
            type="button"
            onClick={onToggleShuffle}
            className={`p-2 rounded-full transition-colors ${
              playerState.isShuffle ? 'text-rose-400' : 'text-white/40 hover:text-white/70'
            }`}
            aria-label="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <button
              id="mobile-prev-btn"
              type="button"
              onClick={onPrev}
              aria-label="Previous track"
              className="p-2.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>

            <button
              id="mobile-play-pause-btn"
              type="button"
              onClick={onTogglePlay}
              aria-label={playerState.isPlaying ? 'Pause' : 'Play'}
              className="p-3.5 rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            >
              {playerState.isPlaying ? (
                <Pause className="w-5 h-5 fill-current text-black" />
              ) : (
                <Play className="w-5 h-5 fill-current text-black ml-0.5" />
              )}
            </button>

            <button
              id="mobile-next-btn"
              type="button"
              onClick={onNext}
              aria-label="Next track"
              className="p-2.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleRepeat}
            className={`p-2 rounded-full transition-colors ${
              playerState.isRepeat ? 'text-rose-400' : 'text-white/40 hover:text-white/70'
            }`}
            aria-label="Repeat"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
