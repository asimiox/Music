'use client';

import { Music } from 'lucide-react';

interface MusicalCreditProps {
  isPlaying: boolean;
}

export default function MusicalCredit({ isPlaying }: MusicalCreditProps) {
  return (
    <div
      id="musical-credit-footer"
      className="mt-3 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md text-[12px] text-white/80 shadow-xl select-none transition-all duration-300 hover:border-white/20 hover:bg-black/50 group"
      title={isPlaying ? 'Music is currently playing • Rhythmic beat active' : 'Music paused'}
    >
      {/* Mini Equalizer visualizer (Left) */}
      <div className="flex items-end gap-[2.5px] h-3.5 w-3 justify-center">
        <span
          className={`w-[2.5px] rounded-full bg-rose-400/90 transition-all ${
            isPlaying ? 'animate-eq-1' : 'h-[3px] opacity-40'
          }`}
        />
        <span
          className={`w-[2.5px] rounded-full bg-rose-400/90 transition-all ${
            isPlaying ? 'animate-eq-2' : 'h-[5px] opacity-40'
          }`}
        />
        <span
          className={`w-[2.5px] rounded-full bg-rose-400/90 transition-all ${
            isPlaying ? 'animate-eq-3' : 'h-[2px] opacity-40'
          }`}
        />
      </div>

      {/* Main Credit Text in Musical Context */}
      <span className="font-medium tracking-wide flex items-center gap-1.5 text-white/90">
        <span>Made with</span>
        <span
          className={`text-rose-500 inline-block text-[14px] leading-none transition-transform ${
            isPlaying ? 'animate-musical-heart' : 'opacity-80 scale-100'
          }`}
          aria-label="love"
        >
          ♥️
        </span>
        <span className="text-white font-semibold tracking-wider">By Asim</span>
      </span>

      {/* Musical note accent & Right Equalizer */}
      <div className="flex items-center gap-1.5 pl-0.5 border-l border-white/10">
        <Music
          className={`w-3 h-3 text-rose-400 transition-transform ${
            isPlaying ? 'animate-bounce text-rose-300' : 'opacity-40'
          }`}
        />
        <div className="flex items-end gap-[2px] h-3.5 w-2.5 justify-center">
          <span
            className={`w-[2px] rounded-full bg-rose-400/80 transition-all ${
              isPlaying ? 'animate-eq-4' : 'h-[4px] opacity-40'
            }`}
          />
          <span
            className={`w-[2px] rounded-full bg-rose-400/80 transition-all ${
              isPlaying ? 'animate-eq-2' : 'h-[2px] opacity-40'
            }`}
          />
        </div>
      </div>
    </div>
  );
}
