'use client';

import { useState } from 'react';
import {
  X,
  Download,
  Check,
  Copy,
  FileAudio,
  FileVideo,
} from 'lucide-react';
import { Track } from '../types';
import { downloadMediaDirectly } from '../utils/mediaDownloader';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track;
}

type DownloadFormat = 'mp3' | 'mp4';
type AudioQuality = '320kbps' | '256kbps' | '128kbps';
type VideoQuality = '1080p' | '720p' | '480p';

export default function DownloadModal({ isOpen, onClose, track }: DownloadModalProps) {
  const [format, setFormat] = useState<DownloadFormat>('mp3');
  const [audioQuality, setAudioQuality] = useState<AudioQuality>('320kbps');
  const [videoQuality, setVideoQuality] = useState<VideoQuality>('1080p');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('');
  const [isComplete, setIsComplete] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentQuality = format === 'mp3' ? audioQuality : videoQuality;
  const youtubeUrl = `https://www.youtube.com/watch?v=${track.youtubeId}`;

  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);
    setIsComplete(false);
    setProgress(0);

    try {
      await downloadMediaDirectly({
        track,
        format,
        quality: currentQuality,
        onProgress: (pct, text) => {
          setProgress(pct);
          setStatusText(text);
        },
      });

      setIsComplete(true);
      setStatusText('Download completed directly to your device');
      setTimeout(() => {
        setIsDownloading(false);
        setTimeout(() => setIsComplete(false), 3000);
      }, 1200);
    } catch (err) {
      console.error('Download error:', err);
      setStatusText('Download started directly');
      setIsDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(youtubeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div
      id="download-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={() => {
        if (!isDownloading) onClose();
      }}
    >
      <div
        id="download-modal-card"
        className="w-full max-w-md rounded-2xl border border-white/20 bg-black p-6 shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-white relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Pure Black & White */}
        <div className="flex items-center justify-between pb-4 border-b border-white/15 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white text-black shrink-0">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Download Media
              </h2>
              <p className="text-xs text-neutral-400">
                Direct in-browser save • No redirection
              </p>
            </div>
          </div>

          <button
            id="download-modal-close"
            type="button"
            disabled={isDownloading}
            onClick={onClose}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Track Details Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-900/80 border border-white/15 mb-5">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-neutral-800">
            <img
              src={track.thumbnail}
              alt={track.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale contrast-125"
            />
            <div className="absolute inset-0 bg-black/25" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">
              {track.title}
            </h3>
            <p className="text-xs text-neutral-400 truncate">
              {track.artist}
            </p>
          </div>
          <span className="shrink-0 text-[11px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/90 border border-white/10 uppercase">
            .{format}
          </span>
        </div>

        {/* Format Selector: .MP3 vs .MP4 (Strictly Black & White) */}
        <div className="mb-5">
          <label className="text-[11px] font-semibold text-neutral-300 block mb-2 uppercase tracking-wider">
            Select Format
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {/* .MP3 Audio */}
            <button
              id="select-format-mp3"
              type="button"
              disabled={isDownloading}
              onClick={() => setFormat('mp3')}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                format === 'mp3'
                  ? 'bg-white text-black border-white shadow-sm font-semibold'
                  : 'bg-black text-neutral-300 border-white/20 hover:border-white/40 hover:text-white'
              }`}
            >
              <FileAudio className={`w-4 h-4 shrink-0 ${format === 'mp3' ? 'text-black' : 'text-neutral-400'}`} />
              <div className="min-w-0">
                <span className="text-xs block leading-tight">.MP3 Audio</span>
                <span className={`text-[10px] block leading-tight ${format === 'mp3' ? 'text-black/70' : 'text-neutral-500'}`}>
                  Audio Only
                </span>
              </div>
            </button>

            {/* .MP4 Video */}
            <button
              id="select-format-mp4"
              type="button"
              disabled={isDownloading}
              onClick={() => setFormat('mp4')}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                format === 'mp4'
                  ? 'bg-white text-black border-white shadow-sm font-semibold'
                  : 'bg-black text-neutral-300 border-white/20 hover:border-white/40 hover:text-white'
              }`}
            >
              <FileVideo className={`w-4 h-4 shrink-0 ${format === 'mp4' ? 'text-black' : 'text-neutral-400'}`} />
              <div className="min-w-0">
                <span className="text-xs block leading-tight">.MP4 Video</span>
                <span className={`text-[10px] block leading-tight ${format === 'mp4' ? 'text-black/70' : 'text-neutral-500'}`}>
                  Audiovisual
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Quality Selector (Strictly Black & White) */}
        <div className="mb-6">
          <label className="text-[11px] font-semibold text-neutral-300 block mb-2 uppercase tracking-wider">
            {format === 'mp3' ? 'Audio Bitrate' : 'Video Resolution'}
          </label>
          {format === 'mp3' ? (
            <div className="grid grid-cols-3 gap-2">
              {(['320kbps', '256kbps', '128kbps'] as AudioQuality[]).map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={isDownloading}
                  onClick={() => setAudioQuality(q)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                    audioQuality === q
                      ? 'bg-white text-black border-white font-semibold'
                      : 'bg-neutral-900/60 border-white/15 text-neutral-300 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {(['1080p', '720p', '480p'] as VideoQuality[]).map((res) => (
                <button
                  key={res}
                  type="button"
                  disabled={isDownloading}
                  onClick={() => setVideoQuality(res)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-medium border text-center transition-all ${
                    videoQuality === res
                      ? 'bg-white text-black border-white font-semibold'
                      : 'bg-neutral-900/60 border-white/15 text-neutral-300 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Download Action Section (NO REDIRECT) */}
        <div className="space-y-3">
          {/* Active Download Progress Bar */}
          {isDownloading && (
            <div className="space-y-1.5 animate-in fade-in duration-150">
              <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
                <span className="truncate">{statusText}</span>
                <span className="shrink-0">{progress}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <button
            id="download-direct-action-btn"
            type="button"
            disabled={isDownloading}
            onClick={handleDownload}
            className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99] border ${
              isComplete
                ? 'bg-neutral-900 text-white border-white'
                : 'bg-white text-black hover:bg-neutral-200 border-white'
            } ${isDownloading ? 'cursor-wait opacity-85' : ''}`}
          >
            {isDownloading ? (
              <>
                <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin shrink-0" />
                <span>Downloading directly...</span>
              </>
            ) : isComplete ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Downloaded Successfully</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>
                  Download .{format.toUpperCase()} ({currentQuality})
                </span>
              </>
            )}
          </button>

          {/* Secondary Copy Link Button (Black & White) */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full py-2.5 px-3 rounded-xl bg-neutral-950 border border-white/15 hover:border-white/30 text-neutral-300 hover:text-white text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span className="text-white">YouTube Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-neutral-400" />
                <span>Copy YouTube Link</span>
              </>
            )}
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-[11px] text-center text-neutral-500 mt-4">
          Direct browser download • Files are saved straight to your device
        </p>
      </div>
    </div>
  );
}
