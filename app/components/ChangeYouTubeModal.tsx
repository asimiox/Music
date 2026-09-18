'use client';

import { useState, useEffect } from 'react';
import { X, Youtube, Check, RefreshCw, Sparkles, AlertCircle, Link2, ListMusic } from 'lucide-react';
import { parseYouTubeInput, ParsedYouTube } from '../utils/youtube';
import { YouTubeSource } from '../types';
import { YOUTUBE_PLAYLIST_ID } from '../data/playlist';

interface ChangeYouTubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSource: YouTubeSource | null;
  onApplySource: (source: YouTubeSource) => void;
  onResetDefault: () => void;
}

const PRESETS = [
  {
    name: 'Chill Lofi Beats',
    url: 'https://www.youtube.com/playlist?list=PLofht4PTcKYnaH8w5gkDC264ozRxEPWnp',
    desc: 'Lofi hip hop beats to relax/study to',
  },
  {
    name: 'Synthwave & Retro',
    url: 'https://www.youtube.com/playlist?list=PL44Uytz0VqN3jNisqR-0L-8p3TqPqFhG9',
    desc: 'Cyberpunk & 80s nostalgic synth dreams',
  },
  {
    name: 'Nostalgia Punjabi Mix (Original)',
    url: `https://www.youtube.com/playlist?list=${YOUTUBE_PLAYLIST_ID}`,
    desc: 'Curated mix featuring Sharn, AP Dhillon, Karan Aujla',
  },
];

export default function ChangeYouTubeModal({
  isOpen,
  onClose,
  currentSource,
  onApplySource,
  onResetDefault,
}: ChangeYouTubeModalProps) {
  const [inputValue, setInputValue] = useState('');
  const [parsed, setParsed] = useState<ParsedYouTube | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (currentSource) {
        setInputValue(currentSource.url);
        setParsed(parseYouTubeInput(currentSource.url));
      } else {
        setInputValue('');
        setParsed(null);
      }
      setError(null);
    }
  }, [isOpen, currentSource]);

  if (!isOpen) return null;

  const handleInputChange = (val: string) => {
    setInputValue(val);
    setError(null);
    if (!val.trim()) {
      setParsed(null);
      return;
    }
    const result = parseYouTubeInput(val);
    setParsed(result);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) {
      setError('Please enter a YouTube playlist or video link');
      return;
    }

    const result = parseYouTubeInput(inputValue);
    if (!result.isValid || !result.type || !result.id) {
      setError(result.errorMessage || 'Invalid YouTube URL or playlist ID');
      return;
    }

    onApplySource({
      type: result.type,
      id: result.id,
      url: result.cleanUrl || inputValue.trim(),
      title: result.type === 'playlist' ? `Custom Playlist (${result.id})` : `YouTube Track (${result.id})`,
    });
    onClose();
  };

  const handleSelectPreset = (url: string) => {
    setInputValue(url);
    const result = parseYouTubeInput(url);
    setParsed(result);
    setError(null);
  };

  const handleReset = () => {
    onResetDefault();
    setInputValue('');
    setParsed(null);
    onClose();
  };

  return (
    <div
      id="change-youtube-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="change-youtube-modal-panel"
        className="w-full max-w-lg rounded-3xl border border-white/15 bg-neutral-900/95 backdrop-blur-2xl p-6 shadow-2xl text-white relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[17px] font-semibold tracking-tight text-white flex items-center gap-2">
                Change YouTube URL
              </h3>
              <p className="text-[12.5px] text-white/50">
                Play your favourite YouTube playlist, mix, or song
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="yt-url-input"
              className="block text-[12px] font-medium uppercase tracking-wider text-white/70 mb-2 flex items-center gap-1.5"
            >
              <Link2 className="w-3.5 h-3.5 text-rose-400" />
              Playlist or Video URL / ID
            </label>
            <div className="relative">
              <input
                id="yt-url-input"
                type="text"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="https://www.youtube.com/playlist?list=PL..."
                className="w-full px-4 py-3 rounded-2xl border border-white/15 bg-black/60 text-white placeholder-white/30 text-[13.5px] focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/30 transition-all font-mono"
                autoFocus
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={() => handleInputChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white p-1 text-[11px]"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Live Parsing Feedback */}
            {parsed?.isValid && (
              <div className="mt-2.5 flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[12px]">
                <Check className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Detected {parsed.type === 'playlist' ? 'Playlist' : 'Video'}:{' '}
                  <code className="font-mono font-semibold text-emerald-200">{parsed.id}</code>
                </span>
              </div>
            )}

            {error && (
              <div className="mt-2.5 flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[12px]">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Quick Preset Selections */}
          <div>
            <span className="block text-[11.5px] font-medium uppercase tracking-wider text-white/50 mb-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-rose-400" />
              Quick Sample Playlists
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleSelectPreset(preset.url)}
                  className="w-full text-left p-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/15 transition-all flex items-center justify-between group"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="text-[12.5px] font-medium text-white/90 group-hover:text-white flex items-center gap-1.5">
                      <ListMusic className="w-3 h-3 text-rose-400 shrink-0" />
                      <span className="truncate">{preset.name}</span>
                    </div>
                    <div className="text-[11px] text-white/50 truncate">{preset.desc}</div>
                  </div>
                  <span className="text-[11px] text-rose-400 font-medium shrink-0 group-hover:underline">
                    Select
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/10 text-[12.5px] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset to Default
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 text-[12.5px] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-[13px] shadow-lg shadow-rose-600/30 transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                Apply & Play
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
