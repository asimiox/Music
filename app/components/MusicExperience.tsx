'use client';

import { useState, useCallback, useEffect } from 'react';
import Background from './Background';
import GrainOverlay from './GrainOverlay';
import TopRow from './TopRow';
import Player from './Player';
import AudioEngine from './AudioEngine';
import ChangeYouTubeModal from './ChangeYouTubeModal';
import DownloadModal from './DownloadModal';
import MusicalCredit from './MusicalCredit';
import { INITIAL_PLAYLIST } from '../data/playlist';
import { Track, PlayerState, YouTubeSource } from '../types';
import { getSavedSource, saveSource, clearSavedSource } from '../utils/youtube';

export default function MusicExperience() {
  const [tracks, setTracks] = useState<Track[]>(INITIAL_PLAYLIST);
  const [activeSource, setActiveSource] = useState<YouTubeSource | null>(null);
  const [showChangeModal, setShowChangeModal] = useState<boolean>(false);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);

  const [playerState, setPlayerState] = useState<PlayerState>({
    currentTrackIndex: 0,
    isPlaying: false,
    isBuffering: false,
    currentTime: 0,
    duration: INITIAL_PLAYLIST[0].duration,
    volume: 85,
    isMuted: false,
    autoplayBlocked: false,
    isShuffle: false,
    isRepeat: false,
  });

  const [ambientRainPlaying, setAmbientRainPlaying] = useState<boolean>(false);

  // Restore saved custom playlist or video on load
  useEffect(() => {
    const saved = getSavedSource();
    if (saved) {
      setActiveSource(saved);
      if (saved.type === 'playlist') {
        setTracks([
          {
            id: saved.id,
            youtubeId: saved.id,
            title: saved.title || 'Custom YouTube Playlist',
            artist: 'Loading playlist...',
            thumbnail: 'https://i.ytimg.com/vi/z1VdU6ZwRwY/hqdefault.jpg',
            duration: 200,
          },
        ]);
      } else if (saved.type === 'video') {
        setTracks([
          {
            id: saved.id,
            youtubeId: saved.id,
            title: saved.title || 'Custom Track',
            artist: 'YouTube Music',
            thumbnail: `https://i.ytimg.com/vi/${saved.id}/hqdefault.jpg`,
            duration: 200,
          },
        ]);
      }
    }
  }, []);

  const handleApplySource = useCallback((source: YouTubeSource) => {
    saveSource(source);
    setActiveSource(source);
    if (source.type === 'playlist') {
      setTracks([
        {
          id: source.id,
          youtubeId: source.id,
          title: 'Custom YouTube Playlist',
          artist: 'Loading playlist stream...',
          thumbnail: 'https://i.ytimg.com/vi/z1VdU6ZwRwY/hqdefault.jpg',
          duration: 200,
        },
      ]);
    } else {
      setTracks([
        {
          id: source.id,
          youtubeId: source.id,
          title: 'Custom YouTube Track',
          artist: 'YouTube Video',
          thumbnail: `https://i.ytimg.com/vi/${source.id}/hqdefault.jpg`,
          duration: 200,
        },
      ]);
    }
    setPlayerState((prev) => ({
      ...prev,
      currentTrackIndex: 0,
      currentTime: 0,
      isPlaying: true,
      autoplayBlocked: false,
    }));
  }, []);

  const handleResetSource = useCallback(() => {
    clearSavedSource();
    setActiveSource(null);
    setTracks(INITIAL_PLAYLIST);
    setPlayerState((prev) => ({
      ...prev,
      currentTrackIndex: 0,
      currentTime: 0,
      duration: INITIAL_PLAYLIST[0].duration,
      isPlaying: true,
      autoplayBlocked: false,
    }));
  }, []);

  const handleUpdateState = useCallback((updates: Partial<PlayerState>) => {
    setPlayerState((prev) => ({ ...prev, ...updates }));
  }, []);

  const handlePlay = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isPlaying: true, autoplayBlocked: false }));
  }, []);

  const handlePause = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const handleTogglePlay = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isPlaying: !prev.isPlaying, autoplayBlocked: false }));
  }, []);

  const handlePrev = useCallback(() => {
    if (activeSource?.type === 'playlist' && window.ytAudioController?.prev) {
      window.ytAudioController.prev();
      return;
    }
    setPlayerState((prev) => {
      const newIndex = prev.currentTrackIndex > 0 ? prev.currentTrackIndex - 1 : tracks.length - 1;
      return {
        ...prev,
        currentTrackIndex: newIndex,
        currentTime: 0,
        isPlaying: true,
      };
    });
  }, [tracks.length, activeSource]);

  const handleNext = useCallback(() => {
    if (activeSource?.type === 'playlist' && window.ytAudioController?.next) {
      window.ytAudioController.next();
      return;
    }
    setPlayerState((prev) => {
      let nextIndex = 0;
      if (prev.isShuffle) {
        nextIndex = Math.floor(Math.random() * tracks.length);
      } else {
        nextIndex = (prev.currentTrackIndex + 1) % tracks.length;
      }
      return {
        ...prev,
        currentTrackIndex: nextIndex,
        currentTime: 0,
        isPlaying: true,
      };
    });
  }, [tracks.length, activeSource]);

  const handleSeek = useCallback((seconds: number) => {
    setPlayerState((prev) => ({ ...prev, currentTime: seconds }));
    if (window.ytAudioController?.seek) {
      window.ytAudioController.seek(seconds);
    }
  }, []);

  const handleSelectTrack = useCallback((index: number) => {
    setPlayerState((prev) => ({
      ...prev,
      currentTrackIndex: index,
      currentTime: 0,
      isPlaying: true,
      autoplayBlocked: false,
    }));
  }, []);

  const handleToggleMute = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isMuted: !prev.isMuted }));
  }, []);

  const handleToggleShuffle = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isShuffle: !prev.isShuffle }));
  }, []);

  const handleToggleRepeat = useCallback(() => {
    setPlayerState((prev) => ({ ...prev, isRepeat: !prev.isRepeat }));
  }, []);

  const handleToggleAmbientRain = useCallback(() => {
    setAmbientRainPlaying((prev) => !prev);
  }, []);

  const handleUpdateTrackMetadata = useCallback((index: number, meta: Partial<Track>) => {
    setTracks((prev) => {
      const copy = [...prev];
      if (copy[index]) {
        copy[index] = { ...copy[index], ...meta };
      } else if (copy.length === 0) {
        copy.push({
          id: meta.id || 'current',
          youtubeId: meta.youtubeId || 'current',
          title: meta.title || 'YouTube Track',
          artist: meta.artist || 'YouTube Artist',
          thumbnail: meta.thumbnail || '',
          duration: meta.duration || 180,
        });
      }
      return copy;
    });
  }, []);

  return (
    <>
      {/* 1. Fixed background div, -z-20 */}
      <Background />

      {/* 2. Fixed grain overlay, -z-10 */}
      <GrainOverlay />

      {/* 3. Fixed top row controls (zero text) */}
      <TopRow
        isMuted={playerState.isMuted}
        onToggleMute={handleToggleMute}
        ambientRainPlaying={ambientRainPlaying}
        onToggleAmbientRain={handleToggleAmbientRain}
      />

      {/* Spacer to push player to bottom */}
      <div className="flex-1 w-full" aria-hidden="true" />

      {/* 4. The player, bottom-anchored, max-w-xl with musical credit footer */}
      <div className="w-full max-w-xl z-20 pb-[max(1rem,env(safe-area-inset-bottom))] px-4 flex flex-col items-center">
        <Player
          tracks={tracks}
          playerState={playerState}
          onPlay={handlePlay}
          onPause={handlePause}
          onTogglePlay={handleTogglePlay}
          onPrev={handlePrev}
          onNext={handleNext}
          onSeek={handleSeek}
          onSelectTrack={handleSelectTrack}
          onToggleShuffle={handleToggleShuffle}
          onToggleRepeat={handleToggleRepeat}
          onOpenChangeYouTube={() => setShowChangeModal(true)}
          onOpenDownload={() => setShowDownloadModal(true)}
          isCustomSource={Boolean(activeSource)}
        />

        {/* Musical Context Credit: beats rhythmically when music plays */}
        <MusicalCredit isPlaying={playerState.isPlaying} />
      </div>

      {/* Change YouTube URL Modal */}
      <ChangeYouTubeModal
        isOpen={showChangeModal}
        onClose={() => setShowChangeModal(false)}
        currentSource={activeSource}
        onApplySource={handleApplySource}
        onResetDefault={handleResetSource}
      />

      {/* Download in .MP3 or .MP4 Modal */}
      {tracks[playerState.currentTrackIndex] && (
        <DownloadModal
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          track={tracks[playerState.currentTrackIndex]}
        />
      )}

      {/* Audio Engine (Hidden YouTube & Web Audio) */}
      <AudioEngine
        tracks={tracks}
        playerState={playerState}
        onUpdateState={handleUpdateState}
        onTrackChange={handleSelectTrack}
        onUpdateTrackMetadata={handleUpdateTrackMetadata}
        ambientRainPlaying={ambientRainPlaying}
        activeSource={activeSource}
      />
    </>
  );
}
