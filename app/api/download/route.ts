export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');
  const format = (searchParams.get('format') || 'mp4') as 'mp4' | 'mp3';
  const rawTitle = searchParams.get('title') || videoId || 'download';

  if (!videoId) {
    return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });
  }

  const safeTitle = rawTitle
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 200) || videoId;

  try {
    const cobaltRes = await fetch('https://api.cobalt.tools/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        url: `https://www.youtube.com/watch?v=${videoId}`,
        downloadMode: format === 'mp3' ? 'audio' : 'auto',
        audioFormat: format === 'mp3' ? 'mp3' : undefined,
        videoQuality: '1080',
        filenameStyle: 'basic',
      }),
    });

    if (!cobaltRes.ok) {
      return NextResponse.json(
        { error: `cobalt returned ${cobaltRes.status}` },
        { status: 502 }
      );
    }

    const cobaltData = await cobaltRes.json();

    // Handle picker (multiple formats) — just take first
    let downloadUrl: string | undefined = cobaltData.url;
    if (cobaltData.status === 'picker' && cobaltData.picker?.length) {
      downloadUrl = cobaltData.picker[0].url;
    }

    if (cobaltData.status === 'error' || !downloadUrl) {
      return NextResponse.json(
        { error: cobaltData.error?.code || 'cobalt returned no URL' },
        { status: 500 }
      );
    }

    // Proxy the stream so we control the filename
    const dlRes = await fetch(downloadUrl);
    if (!dlRes.ok || !dlRes.body) {
      return NextResponse.json({ error: 'Download source unavailable' }, { status: 502 });
    }

    const ext = format === 'mp3' ? 'mp3' : 'mp4';
    const filename = `${safeTitle}.${ext}`;
    const contentType = format === 'mp3' ? 'audio/mpeg' : 'video/mp4';

    return new Response(dlRes.body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    console.error('Download error:', err);
    return NextResponse.json(
      { error: 'Download failed', detail: String(err) },
      { status: 500 }
    );
  }
}
