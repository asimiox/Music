import MusicExperience from './components/MusicExperience';

export const viewport = {
  viewportFit: 'cover' as const,
};

export default function Page() {
  return (
    <main
      id="main-app-container"
      className="relative flex min-h-dvh flex-1 flex-col items-center justify-between overflow-hidden"
    >
      <MusicExperience />
    </main>
  );
}
