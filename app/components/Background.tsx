export default function Background() {
  return (
    <div
      id="hero-background-container"
      className="fixed inset-0 -z-20 pointer-events-none select-none overflow-hidden"
    >
      {/* CSS-driven responsive image (scene-wide.png on landscape, scene-tall.png on portrait) */}
      <div
        id="hero-bg-layer"
        className="hero-bg absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-700 ease-out"
      />
      {/* Overlay gradient to soften contrast and enhance floating glass legibility */}
      <div
        id="hero-bg-gradient"
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70"
      />
    </div>
  );
}
