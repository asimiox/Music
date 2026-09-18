import { useEffect, useRef } from 'react';
import { Track, PlayerState, YouTubeSource } from '../types';
import { YOUTUBE_PLAYLIST_ID } from '../data/playlist';

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
    ytAudioController?: {
      next: () => void;
      prev: () => void;
      seek: (sec: number) => void;
    };
  }
}

interface AudioEngineProps {
  tracks: Track[];
  playerState: PlayerState;
  onUpdateState: (updates: Partial<PlayerState>) => void;
  onTrackChange: (index: number) => void;
  onUpdateTrackMetadata?: (index: number, meta: Partial<Track>) => void;
  ambientRainPlaying: boolean;
  activeSource: YouTubeSource | null;
}

export default function AudioEngine({
  tracks,
  playerState,
  onUpdateState,
  onTrackChange,
  onUpdateTrackMetadata,
  ambientRainPlaying,
  activeSource,
}: AudioEngineProps) {
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeUpdateTimerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const rainGainRef = useRef<GainNode | null>(null);
  const isReadyRef = useRef<boolean>(false);
  const currentIndexRef = useRef<number>(playerState.currentTrackIndex);
  currentIndexRef.current = playerState.currentTrackIndex;

  // Expose global controls for playlist navigation
  useEffect(() => {
    window.ytAudioController = {
      next: () => {
        try {
          if (playerRef.current && isReadyRef.current && playerRef.current.nextVideo) {
            playerRef.current.nextVideo();
          }
        } catch (e) {
          console.warn('nextVideo failed', e);
        }
      },
      prev: () => {
        try {
          if (playerRef.current && isReadyRef.current && playerRef.current.previousVideo) {
            playerRef.current.previousVideo();
          }
        } catch (e) {
          console.warn('previousVideo failed', e);
        }
      },
      seek: (sec: number) => {
        try {
          if (playerRef.current && isReadyRef.current && playerRef.current.seekTo) {
            playerRef.current.seekTo(sec, true);
          }
        } catch (e) {
          console.warn('seekTo failed', e);
        }
      },
    };

    return () => {
      delete window.ytAudioController;
    };
  }, []);

  // Initialize YouTube Iframe API
  useEffect(() => {
    let isMounted = true;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      const currentTrack = tracks[currentIndexRef.current] || tracks[0];
      const initialPlaylist =
        activeSource?.type === 'playlist'
          ? activeSource.id
          : !activeSource
          ? YOUTUBE_PLAYLIST_ID
          : undefined;

      const initialVideoId =
        activeSource?.type === 'video'
          ? activeSource.id
          : currentTrack.youtubeId;

      try {
        playerRef.current = new window.YT.Player('yt-hidden-player-node', {
          height: '1',
          width: '1',
          videoId: initialVideoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            origin: window.location.origin,
            ...(initialPlaylist
              ? { listType: 'playlist', list: initialPlaylist }
              : {}),
          },
          events: {
            onReady: (event: any) => {
              if (!isMounted) return;
              isReadyRef.current = true;
              event.target.setVolume(playerState.isMuted ? 0 : playerState.volume);

              // Attempt autoplay
              event.target.playVideo();
              setTimeout(() => {
                if (!isMounted) return;
                const state = event.target.getPlayerState();
                if (state !== 1 && state !== 3) {
                  onUpdateState({ autoplayBlocked: true, isPlaying: false });
                } else {
                  onUpdateState({ autoplayBlocked: false, isPlaying: true });
                }
              }, 1200);

              const dur = event.target.getDuration();
              if (dur && dur > 0) {
                onUpdateState({ duration: dur });
              }
            },
            onStateChange: (event: any) => {
              if (!isMounted) return;
              const ytState = event.data;
              // YT.PlayerState: -1 unstarted, 0 ended, 1 playing, 2 paused, 3 buffering, 5 cued
              if (ytState === 1) {
                onUpdateState({ isPlaying: true, isBuffering: false, autoplayBlocked: false });
                const dur = event.target.getDuration();
                if (dur && dur > 0) {
                  onUpdateState({ duration: dur });
                }

                // Check video data for dynamic title/artist
                if (event.target.getVideoData && onUpdateTrackMetadata) {
                  const videoData = event.target.getVideoData();
                  if (videoData && videoData.title) {
                    onUpdateTrackMetadata(currentIndexRef.current, {
                      id: videoData.video_id || currentTrack.id,
                      youtubeId: videoData.video_id || currentTrack.youtubeId,
                      title: videoData.title,
                      artist: videoData.author || tracks[currentIndexRef.current]?.artist,
                      thumbnail: videoData.video_id
                        ? `https://i.ytimg.com/vi/${videoData.video_id}/hqdefault.jpg`
                        : tracks[currentIndexRef.current]?.thumbnail,
                      duration: dur || tracks[currentIndexRef.current]?.duration || 180,
                    });
                  }
                }
              } else if (ytState === 2) {
                onUpdateState({ isPlaying: false, isBuffering: false });
              } else if (ytState === 3) {
                onUpdateState({ isBuffering: true });
              } else if (ytState === 0) {
                handleNextTrack();
              }
            },
            onError: (error: any) => {
              console.warn('YouTube playback error, attempting next song:', error);
              handleNextTrack();
            },
          },
        });
      } catch (err) {
        console.warn('Could not initialize YT player:', err);
      }
    };

    const handleNextTrack = () => {
      if (activeSource?.type === 'playlist' && playerRef.current?.nextVideo) {
        try {
          playerRef.current.nextVideo();
          return;
        } catch {
          // fallback
        }
      }
      const nextIdx = (currentIndexRef.current + 1) % tracks.length;
      onTrackChange(nextIdx);
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        if (isMounted) {
          initPlayer();
        }
      };
    }

    return () => {
      isMounted = false;
      if (playerRef.current && playerRef.current.destroy) {
        try {
          playerRef.current.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Respond to activeSource changes
  useEffect(() => {
    if (!isReadyRef.current || !playerRef.current) return;

    try {
      if (activeSource) {
        if (activeSource.type === 'playlist') {
          playerRef.current.loadPlaylist({
            list: activeSource.id,
            listType: 'playlist',
            index: 0,
          });
        } else {
          playerRef.current.loadVideoById(activeSource.id);
        }
      } else {
        // Reset to default playlist
        playerRef.current.loadPlaylist({
          list: YOUTUBE_PLAYLIST_ID,
          listType: 'playlist',
          index: 0,
        });
      }
      playerRef.current.playVideo();
      onUpdateState({ isPlaying: true, autoplayBlocked: false });
    } catch (err) {
      console.warn('Error applying active YouTube source:', err);
    }
  }, [activeSource]);

  // Sync track changes
  useEffect(() => {
    if (!isReadyRef.current || !playerRef.current) return;
    const track = tracks[playerState.currentTrackIndex];
    if (!track) return;

    try {
      if (playerRef.current.loadVideoById) {
        playerRef.current.loadVideoById(track.youtubeId);
        if (playerState.isPlaying) {
          playerRef.current.playVideo();
        }
      }
    } catch (err) {
      console.warn('Error loading video by ID:', err);
    }
  }, [playerState.currentTrackIndex]);

  // Sync play/pause commands
  useEffect(() => {
    if (!isReadyRef.current || !playerRef.current) return;
    try {
      if (playerState.isPlaying) {
        playerRef.current.playVideo();
      } else {
        playerRef.current.pauseVideo();
      }
    } catch {
      // Ignore
    }
  }, [playerState.isPlaying]);

  // Sync volume / mute
  useEffect(() => {
    if (!isReadyRef.current || !playerRef.current) return;
    try {
      if (playerState.isMuted) {
        playerRef.current.mute();
      } else {
        playerRef.current.unMute();
        playerRef.current.setVolume(playerState.volume);
      }
    } catch {
      // Ignore
    }
  }, [playerState.volume, playerState.isMuted]);

  // Track progress updater timer
  useEffect(() => {
    if (playerState.isPlaying) {
      timeUpdateTimerRef.current = setInterval(() => {
        if (playerRef.current && isReadyRef.current && playerRef.current.getCurrentTime) {
          try {
            const cur = playerRef.current.getCurrentTime();
            const dur = playerRef.current.getDuration();
            if (typeof cur === 'number') {
              onUpdateState({
                currentTime: cur,
                ...(dur > 0 ? { duration: dur } : {}),
              });
            }
          } catch {
            // Ignore
          }
        }
      }, 250);
    } else {
      if (timeUpdateTimerRef.current) clearInterval(timeUpdateTimerRef.current);
    }

    return () => {
      if (timeUpdateTimerRef.current) clearInterval(timeUpdateTimerRef.current);
    };
  }, [playerState.isPlaying]);

  // Ambient rain sound generator (Web Audio API synthetic soothing pink noise rain)
  useEffect(() => {
    if (!ambientRainPlaying) {
      if (rainGainRef.current) {
        rainGainRef.current.gain.setTargetAtTime(0, audioContextRef.current?.currentTime || 0, 0.5);
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioCtx();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Generate 5-second brown/pink noise buffer
      const bufferSize = ctx.sampleRate * 4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Soft brown noise filter
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // Gain compensation
      }

      const noiseNode = ctx.createBufferSource();
      noiseNode.buffer = buffer;
      noiseNode.loop = true;

      // Lowpass filter for soft soothing rain
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.setTargetAtTime(0.09, ctx.currentTime, 0.8);
      rainGainRef.current = gain;

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noiseNode.start();

      return () => {
        try {
          noiseNode.stop();
          noiseNode.disconnect();
        } catch {
          // Ignore
        }
      };
    } catch (e) {
      console.warn('Web Audio rain synth not supported:', e);
    }
  }, [ambientRainPlaying]);

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 w-1 h-1 overflow-hidden pointer-events-none opacity-0 -z-50"
      aria-hidden="true"
    >
      <div id="yt-hidden-player-node" />
    </div>
  );
}
