export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { action = 'start', youtubeId, format = 'mp3', quality = '320kbps', progressUrl } = req.query;

  try {
    // Action 1: Check progress of ongoing conversion
    if (action === 'progress' && progressUrl) {
      const decodedUrl = decodeURIComponent(progressUrl as string);
      const pRes = await fetch(decodedUrl);
      const pData = await pRes.json();

      return res.json({
        success: pData.success === 1,
        progress: pData.progress || 0,
        downloadUrl: pData.download_url || null,
        text: pData.text || '',
      });
    }

    // Action 2: Start new conversion
    if (!youtubeId) {
      return res.status(400).json({ error: 'Missing youtubeId' });
    }

    let targetFormat = 'mp3';
    if (format === 'mp4') {
      if (quality === '1080p') targetFormat = '1080';
      else if (quality === '480p') targetFormat = '480';
      else targetFormat = '720';
    } else {
      targetFormat = 'mp3';
    }

    const ytUrl = `https://www.youtube.com/watch?v=${youtubeId}`;
    const initUrl = `https://loader.to/ajax/download.php?button=1&start=1&end=1&format=${targetFormat}&url=${encodeURIComponent(ytUrl)}`;

    const initRes = await fetch(initUrl);
    const initData = await initRes.json();

    if (!initData.success && !initData.progress_url) {
      return res.status(500).json({
        error: 'Conversion service unavailable',
        details: initData.message || '',
      });
    }

    return res.json({
      success: true,
      id: initData.id,
      progressUrl: initData.progress_url,
      downloadUrl: initData.download_url || null,
      title: initData.title || '',
    });
  } catch (err: any) {
    console.error('Convert API error:', err);
    return res.status(500).json({ error: err.message || 'Server error' });
  }
}
