export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

import { type NextRequest, NextResponse } from 'next/server';

function safeFilename(raw: string, fallback: string): string {
  return (
    raw.replace(/[<>:"/\\|?*\x00-\x1f]/g, '').replace(/\s+/g, ' ').trim().substring(0, 200) ||
    fallback
  );
}

// ── Strategy 1: yt-dlp via youtube-dl-exec ────────────────────
async function getYtdlpUrl(videoId: string, format: 'mp4' | 'mp3'): Promise<string | null> {
  try {
    const { youtubeDl } = await import('youtube-dl-exec');
    const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;

    const info = (await youtubeDl(ytUrl, {
      dumpSingleJson: true,
      noWarnings: true,
      noCheckCertificates: true,
      preferFreeFormats: true,
      noPlaylist: true,
      format: format === 'mp3' ? 'bestaudio[ext=m4a]/bestaudio/best' : 'best[ext=mp4][height<=1080]/best[ext=mp4]/best',
      addHeader: ['referer:youtube.com', 'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'],
    })) as Record<string, unknown>;

    const directUrl =
      (info.url as string | undefined) ||
      (info.formats as Array<{ url?: string; ext?: string }> | undefined)
        ?.filter(f => f.url && (format === 'mp3' ? true : f.ext === 'mp4'))
        ?.pop()?.url;

    return directUrl || null;
  } catch (err) {
    console.error('yt-dlp failed:', String(err).slice(0, 300));
    return null;
  }
}

// ── Strategy 2: cobalt.tools API ─────────────────────────────
async function getCobaltUrl(videoId: string, format: 'mp4' | 'mp3'): Promise<string | null> {
  try {
    const body: Record<string, string> = {
      url: `https://www.youtube.com/watch?v=${videoId}`,
      downloadMode: format === 'mp3' ? 'audio' : 'auto',
    };
    if (format === 'mp3') body.audioFormat = 'mp3';

    const res = await fetch('https://api.cobalt.tools/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; ytpex/1.0)',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10_000),
    });

    const text = await res.text();
    if (!res.ok) {
      console.error('cobalt HTTP', res.status, text.slice(0, 200));
      return null;
    }

    const data = JSON.parse(text) as Record<string, unknown>;
    if (data.status === 'error') {
      console.error('cobalt error:', JSON.stringify(data).slice(0, 200));
      return null;
    }

    return (
      (data.url as string | undefined) ||
      (data.picker as Array<{ url: string }> | undefined)?.[0]?.url ||
      null
    );
  } catch (err) {
    console.error('cobalt failed:', String(err).slice(0, 200));
    return null;
  }
}

// ── Route handler ─────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');
  const format = (searchParams.get('format') || 'mp4') as 'mp4' | 'mp3';
  const rawTitle = searchParams.get('title') || videoId || 'download';

  if (!videoId) return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });

  const title = safeFilename(rawTitle, videoId);
  const ext = format === 'mp3' ? 'm4a' : 'mp4'; // yt-dlp gives m4a for audio, not mp3
  const contentType = format === 'mp3' ? 'audio/mp4' : 'video/mp4';

  // 1. yt-dlp: get direct CDN URL → redirect (downloads from YouTube's own CDN)
  const ytdlpUrl = await getYtdlpUrl(videoId, format);
  if (ytdlpUrl) {
    return NextResponse.redirect(ytdlpUrl, 302);
  }

  // 2. cobalt API: proxy response with our filename
  const cobaltUrl = await getCobaltUrl(videoId, format);
  if (cobaltUrl) {
    try {
      const dlRes = await fetch(cobaltUrl, { signal: AbortSignal.timeout(25_000) });
      if (dlRes.ok && dlRes.body) {
        const filename = `${title}.${format === 'mp3' ? 'mp3' : 'mp4'}`;
        return new Response(dlRes.body, {
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
            'Cache-Control': 'no-store',
          },
        });
      }
    } catch {
      // proxy timed out — just redirect
    }
    return NextResponse.redirect(cobaltUrl, 302);
  }

  // 3. Last resort: open cobalt.tools web UI in browser
  return NextResponse.redirect(
    `https://cobalt.tools/?u=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}`,
    302
  );
}
