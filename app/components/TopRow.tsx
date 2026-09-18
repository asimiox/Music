import { Radio, Volume2, VolumeX } from 'lucide-react';
import { YOUTUBE_PLAYLIST_ID } from '../data/playlist';

interface TopRowProps {
  isMuted: boolean;
  onToggleMute: () => void;
  ambientRainPlaying: boolean;
  onToggleAmbientRain: () => void;
}

export default function TopRow({
  isMuted,
  onToggleMute,
  ambientRainPlaying,
  onToggleAmbientRain,
}: TopRowProps) {
  const playlistUrl = `https://youtube.com/playlist?list=${YOUTUBE_PLAYLIST_ID}&playnext=1`;

  return (
    <header className="pointer-events-none z-30">
      {/* Top row controls: icon-only buttons with zero text at the top of the screen */}
      <div
        id="social-links-widget"
        className="fixed top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] pointer-events-auto flex items-center gap-2"
      >
        {/* Ambient rain toggle (icon only) */}
        <button
          id="ambient-rain-toggle"
          type="button"
          onClick={onToggleAmbientRain}
          aria-label={ambientRainPlaying ? 'Disable rain atmosphere' : 'Enable rain atmosphere'}
          title={ambientRainPlaying ? 'Rain atmosphere on' : 'Rain atmosphere off'}
          className={`p-2.5 rounded-full border transition-all backdrop-blur-md shadow-lg ${
            ambientRainPlaying
              ? 'border-rose-400/40 bg-rose-500/20 text-rose-200'
              : 'border-white/10 bg-black/40 text-white/70 hover:text-white hover:bg-white/10'
          }`}
        >
          <Radio className="w-4 h-4" />
        </button>

        {/* Master Mute / Unmute Button (icon only) */}
        <button
          id="master-mute-toggle"
          type="button"
          onClick={onToggleMute}
          aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
          title={isMuted ? 'Unmute' : 'Mute'}
          className="p-2.5 rounded-full border border-white/10 bg-black/40 text-white/70 hover:text-white hover:bg-white/10 backdrop-blur-md transition-colors shadow-lg"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Original YouTube Playlist Link (icon only) */}
        <a
          id="youtube-playlist-link"
          href={playlistUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open original playlist on YouTube"
          aria-label="Open original playlist on YouTube"
          className="p-2.5 rounded-full border border-white/10 bg-black/40 text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-md transition-colors shadow-lg"
        >
          <svg className="w-4 h-4 fill-current text-rose-500" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        </a>
      </div>
    </header>
  );
}
