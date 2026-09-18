import { Track } from '../types';

export function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, '_').trim();
}

export interface DownloadOptions {
  track: Track;
  format: 'mp3' | 'mp4';
  quality: string;
  onProgress?: (percent: number, statusText: string) => void;
}

/**
 * Triggers native browser file download without redirecting or navigating away
 */
function triggerBrowserDownload(downloadUrl: string, filename: string) {
  // Method 1: Invisible download iframe (no navigation, browser handles file stream directly)
  try {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = downloadUrl;
    document.body.appendChild(iframe);
    setTimeout(() => {
      try {
        document.body.removeChild(iframe);
      } catch {}
    }, 45000);
  } catch (err) {
    console.warn('Iframe download trigger failed:', err);
  }

  // Method 2: Anchor download click
  try {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try {
        document.body.removeChild(a);
      } catch {}
    }, 2000);
  } catch (err) {
    console.warn('Anchor download trigger failed:', err);
  }
}

/**
 * Initiates direct download of the REAL, FULL-LENGTH YouTube track in .mp3 or .mp4
 * Polls conversion progress and triggers native download without redirecting.
 */
export async function downloadMediaDirectly({
  track,
  format,
  quality,
  onProgress,
}: DownloadOptions): Promise<string> {
  const filename = `${sanitizeFilename(track.artist)} - ${sanitizeFilename(track.title)}.${format}`;

  onProgress?.(10, 'Connecting to YouTube conversion stream...');

  // Step 1: Request conversion initiation via our API
  const startApiUrl = `/api/convert?action=start&youtubeId=${encodeURIComponent(
    track.youtubeId
  )}&format=${encodeURIComponent(format)}&quality=${encodeURIComponent(quality)}`;

  const res = await fetch(startApiUrl);
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `Server responded with status ${res.status}`);
  }

  const data = await res.json();

  // If download URL is immediately available (cached)
  if (data.downloadUrl) {
    onProgress?.(100, 'Download ready! Saving full track to your device...');
    triggerBrowserDownload(data.downloadUrl, filename);
    return data.downloadUrl;
  }

  if (!data.progressUrl) {
    throw new Error('No conversion progress channel received');
  }

  const progressUrl = data.progressUrl;
  onProgress?.(25, `Extracting full ${format.toUpperCase()} (${quality}) audio stream...`);

  // Step 2: Poll conversion progress until complete (up to 30 attempts, 1.5s interval)
  const maxAttempts = 30;
  let currentPct = 25;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Gradually increment visual progress while processing
    if (currentPct < 90) {
      currentPct = Math.min(90, currentPct + Math.floor(Math.random() * 8) + 4);
    }

    try {
      const pollApiUrl = `/api/convert?action=progress&progressUrl=${encodeURIComponent(
        progressUrl
      )}`;
      const pollRes = await fetch(pollApiUrl);

      if (pollRes.ok) {
        const pollData = await pollRes.json();

        if (pollData.progress && pollData.progress > 0) {
          // Normalizes progress (some APIs report 0-100, others 0-1000)
          const reported = pollData.progress > 100 ? Math.round(pollData.progress / 10) : pollData.progress;
          currentPct = Math.max(currentPct, reported);
        }

        const statusMsg =
          pollData.text ||
          (format === 'mp3'
            ? `Encoding full song at ${quality}...`
            : `Rendering full ${quality} video...`);

        onProgress?.(Math.min(95, currentPct), statusMsg);

        // Check if finished
        if (pollData.success && pollData.downloadUrl) {
          onProgress?.(100, 'Conversion complete! Saving full song to device...');
          triggerBrowserDownload(pollData.downloadUrl, filename);
          return pollData.downloadUrl;
        }
      }
    } catch (pollErr) {
      console.warn(`Poll attempt ${attempt} warning:`, pollErr);
    }
  }

  throw new Error('Conversion took too long. Please try again in a few moments.');
}
