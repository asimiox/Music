export interface Track {
  id: string;
  youtubeId: string;
  title: string;
  artist: string;
  thumbnail: string;
  duration: number; // in seconds
  releaseYear?: string;
}

export interface PlayerState {
  currentTrackIndex: number;
  isPlaying: boolean;
  isBuffering: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  autoplayBlocked: boolean;
  isShuffle: boolean;
  isRepeat: boolean;
}

export interface YouTubeSource {
  type: 'playlist' | 'video';
  id: string; // playlist ID or video ID
  url: string;
  title?: string;
  author?: string;
}
