import { NextResponse } from 'next/server';

const DEMO_ITEMS = [
  { id: { videoId: 'dQw4w9WgXcQ' }, snippet: { title: 'Rick Astley — Never Gonna Give You Up', channelTitle: 'Rick Astley', thumbnails: { high: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' } }, publishedAt: '2009-10-25T06:57:33Z', description: 'The classic.' } },
  { id: { videoId: 'jNQXAC9IVRw' }, snippet: { title: 'Me at the zoo', channelTitle: 'jawed', thumbnails: { high: { url: 'https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg' } }, publishedAt: '2005-04-23T21:31:52Z', description: 'The first YouTube video.' } },
  { id: { videoId: '9bZkp7q19f0' }, snippet: { title: 'PSY — GANGNAM STYLE', channelTitle: 'officialpsy', thumbnails: { high: { url: 'https://i.ytimg.com/vi/9bZkp7q19f0/hqdefault.jpg' } }, publishedAt: '2012-07-15T07:46:32Z', description: 'Gangnam Style MV.' } },
  { id: { videoId: 'kXYiU_JCYtU' }, snippet: { title: 'Linkin Park — Numb', channelTitle: 'Linkin Park', thumbnails: { high: { url: 'https://i.ytimg.com/vi/kXYiU_JCYtU/hqdefault.jpg' } }, publishedAt: '2009-06-17T22:27:09Z', description: 'Official video.' } },
  { id: { videoId: 'YR5ApYxkU-U' }, snippet: { title: 'Pump It — The Black Eyed Peas', channelTitle: 'BlackEyedPeasVEVO', thumbnails: { high: { url: 'https://i.ytimg.com/vi/YR5ApYxkU-U/hqdefault.jpg' } }, publishedAt: '2009-10-01T00:00:00Z', description: 'Official video.' } },
  { id: { videoId: 'hT_nvWreIhg' }, snippet: { title: 'OneRepublic — Counting Stars', channelTitle: 'OneRepublicVEVO', thumbnails: { high: { url: 'https://i.ytimg.com/vi/hT_nvWreIhg/hqdefault.jpg' } }, publishedAt: '2013-05-31T13:07:26Z', description: 'Official video.' } },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || 'youtube';
  const mode = searchParams.get('mode') || 'video';
  const pageToken = searchParams.get('pageToken');

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json({
      items: DEMO_ITEMS,
      pageInfo: { totalResults: DEMO_ITEMS.length },
      _demo: true,
    });
  }

  const params = new URLSearchParams({
    part: 'snippet',
    q: mode === 'shorts' ? `${q} #shorts` : q,
    type: 'video',
    maxResults: '12',
    key: apiKey,
    safeSearch: 'moderate',
    ...(mode === 'shorts' ? { videoDuration: 'short' } : {}),
  });
  if (pageToken) params.set('pageToken', pageToken);

  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`,
      { next: { revalidate: 60 } }
    );
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Search failed', items: DEMO_ITEMS }, { status: 500 });
  }
}
