import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function convertApiPlugin() {
  return {
    name: 'convert-api',
    configureServer(server: any) {
      server.middlewares.use('/api/convert', async (req: any, res: any) => {
        try {
          const fullUrl = new URL(req.url, 'http://localhost:3000');
          const action = fullUrl.searchParams.get('action') || 'start';
          const progressUrl = fullUrl.searchParams.get('progressUrl');
          const youtubeId = fullUrl.searchParams.get('youtubeId');
          const format = fullUrl.searchParams.get('format') || 'mp3';
          const quality = fullUrl.searchParams.get('quality') || '320kbps';

          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');

          if (action === 'progress' && progressUrl) {
            const pRes = await fetch(progressUrl);
            const pData = await pRes.json();
            return res.end(
              JSON.stringify({
                success: pData.success === 1,
                progress: pData.progress || 0,
                downloadUrl: pData.download_url || null,
                text: pData.text || '',
              })
            );
          }

          if (!youtubeId) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ error: 'Missing youtubeId' }));
          }

          let targetFormat = 'mp3';
          if (format === 'mp4') {
            if (quality === '1080p') targetFormat = '1080';
            else if (quality === '480p') targetFormat = '480';
            else targetFormat = '720';
          }

          const ytUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
          const initUrl = `https://loader.to/ajax/download.php?button=1&start=1&end=1&format=${targetFormat}&url=${encodeURIComponent(ytUrl)}`;
          const initRes = await fetch(initUrl);
          const initData = await initRes.json();

          return res.end(
            JSON.stringify({
              success: true,
              id: initData.id,
              progressUrl: initData.progress_url,
              downloadUrl: initData.download_url || null,
              title: initData.title || '',
            })
          );
        } catch (err: any) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), convertApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
