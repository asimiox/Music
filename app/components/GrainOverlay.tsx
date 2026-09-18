export default function GrainOverlay() {
  // Inline SVG feTurbulence noise data-URI for subtle analog film grain texture
  const grainSvgDataUri = `data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.7'/%3E%3C/svg%3E`;

  return (
    <div
      id="film-grain-overlay"
      className="fixed inset-0 -z-10 pointer-events-none select-none mix-blend-overlay opacity-35"
      style={{
        backgroundImage: `url("${grainSvgDataUri}")`,
        backgroundRepeat: 'repeat',
      }}
      aria-hidden="true"
    />
  );
}
