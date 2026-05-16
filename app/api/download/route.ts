export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { type NextRequest, NextResponse } from 'next/server';

function toWebStream(nodeStream: NodeJS.ReadableStream): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      nodeStream.on('data', (chunk: Buffer) =>
        controller.enqueue(new Uint8Array(chunk))
      );
      nodeStream.on('end', () => controller.close());
      nodeStream.on('error', (err) => controller.error(err));
    },
    cancel() {
      (nodeStream as NodeJS.ReadableStream & { destroy?: () => void }).destroy?.();
    },
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');
  const format = (searchParams.get('format') || 'mp4') as 'mp4' | 'mp3';

  if (!videoId) {
    return NextResponse.json({ error: 'Missing videoId' }, { status: 400 });
  }

  const url = `https://www.youtube.com/watch?v=${videoId}`;

  try {
    const ytdl = (await import('@distube/ytdl-core')).default;

    if (format === 'mp3') {
      const ffmpeg = (await import('fluent-ffmpeg')).default;
      const ffmpegPath = (await import('ffmpeg-static')).default;
      if (ffmpegPath) ffmpeg.setFfmpegPath(ffmpegPath);

      const { PassThrough } = await import('stream');
      const audioStream = ytdl(url, {
        quality: 'highestaudio',
        filter: 'audioonly',
      });
      const pass = new PassThrough();

      ffmpeg(audioStream)
        .audioCodec('libmp3lame')
        .audioBitrate(320)
        .format('mp3')
        .on('error', (err: Error) => pass.destroy(err))
        .pipe(pass);

      return new Response(toWebStream(pass), {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Disposition': `attachment; filename="${videoId}.mp3"`,
          'Transfer-Encoding': 'chunked',
        },
      });
    }

    // MP4 — combined audio+video stream
    const stream = ytdl(url, {
      quality: 'highest',
      filter: 'audioandvideo',
    });

    return new Response(toWebStream(stream), {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${videoId}.mp4"`,
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (err) {
    console.error('Download error:', err);
    return NextResponse.json(
      { error: 'Download failed', message: String(err) },
      { status: 500 }
    );
  }
}
