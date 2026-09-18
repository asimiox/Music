import { YouTubeSource } from '../types';

export interface ParsedYouTube {
  isValid: boolean;
  type?: 'playlist' | 'video';
  id?: string;
  videoId?: string;
  playlistId?: string;
  cleanUrl?: string;
  errorMessage?: string;
}

/**
 * Parses user input for YouTube Playlist, Mix, or Video URL/ID
 */
export function parseYouTubeInput(input: string): ParsedYouTube {
  const trimmed = input.trim();
  if (!trimmed) {
    return { isValid: false, errorMessage: 'Please enter a YouTube URL or ID' };
  }

  try {
    // 1. Check if user entered just an ID
    // Playlist ID (usually starts with PL, RD, UU, FL, OLAK, etc.)
    if (/^(PL|RD|UU|FL|LL|OLAK)[a-zA-Z0-9_-]{8,}$/i.test(trimmed)) {
      return {
        isValid: true,
        type: 'playlist',
        id: trimmed,
        playlistId: trimmed,
        cleanUrl: `https://www.youtube.com/playlist?list=${trimmed}`,
      };
    }

    // Single 11-char Video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return {
        isValid: true,
        type: 'video',
        id: trimmed,
        videoId: trimmed,
        cleanUrl: `https://www.youtube.com/watch?v=${trimmed}`,
      };
    }

    // 2. Parse URL
    let urlObj: URL;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      urlObj = new URL(`https://${trimmed}`);
    } else {
      urlObj = new URL(trimmed);
    }

    const host = urlObj.hostname.toLowerCase();
    const isYouTube =
      host.includes('youtube.com') || host.includes('youtu.be') || host.includes('youtube-nocookie.com');

    if (!isYouTube) {
      return {
        isValid: false,
        errorMessage: 'URL must be from youtube.com, music.youtube.com, or youtu.be',
      };
    }

    const listParam = urlObj.searchParams.get('list');
    const vParam = urlObj.searchParams.get('v');

    // Priority 1: Playlist URL or Video with Playlist attached
    if (listParam) {
      return {
        isValid: true,
        type: 'playlist',
        id: listParam,
        playlistId: listParam,
        videoId: vParam || undefined,
        cleanUrl: `https://www.youtube.com/playlist?list=${listParam}`,
      };
    }

    // Priority 2: Standard watch?v=...
    if (vParam && vParam.length >= 11) {
      return {
        isValid: true,
        type: 'video',
        id: vParam,
        videoId: vParam,
        cleanUrl: `https://www.youtube.com/watch?v=${vParam}`,
      };
    }

    // Priority 3: Short youtu.be/VIDEO_ID
    if (host.includes('youtu.be')) {
      const vid = urlObj.pathname.replace(/^\//, '').split('/')[0];
      if (vid && vid.length >= 11) {
        return {
          isValid: true,
          type: 'video',
          id: vid,
          videoId: vid,
          cleanUrl: `https://www.youtube.com/watch?v=${vid}`,
        };
      }
    }

    // Priority 4: /embed/VIDEO_ID or /shorts/VIDEO_ID
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2 && (pathParts[0] === 'embed' || pathParts[0] === 'shorts')) {
      const vid = pathParts[1];
      if (vid && vid.length >= 11) {
        return {
          isValid: true,
          type: 'video',
          id: vid,
          videoId: vid,
          cleanUrl: `https://www.youtube.com/watch?v=${vid}`,
        };
      }
    }

    return {
      isValid: false,
      errorMessage: 'Could not find a valid playlist or video ID in that URL',
    };
  } catch {
    // Fallback regex detection
    const listMatch = trimmed.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    if (listMatch) {
      return {
        isValid: true,
        type: 'playlist',
        id: listMatch[1],
        playlistId: listMatch[1],
        cleanUrl: `https://www.youtube.com/playlist?list=${listMatch[1]}`,
      };
    }

    const vMatch = trimmed.match(/(?:v=|\/embed\/|\/watch\?v=|\/youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/);
    if (vMatch) {
      return {
        isValid: true,
        type: 'video',
        id: vMatch[1],
        videoId: vMatch[1],
        cleanUrl: `https://www.youtube.com/watch?v=${vMatch[1]}`,
      };
    }

    return {
      isValid: false,
      errorMessage: 'Invalid YouTube URL format',
    };
  }
}

const STORAGE_KEY = 'nostalgia_custom_yt_source';

export function getSavedSource(): YouTubeSource | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveSource(source: YouTubeSource): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(source));
  } catch {
    // Ignore storage errors
  }
}

export function clearSavedSource(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
