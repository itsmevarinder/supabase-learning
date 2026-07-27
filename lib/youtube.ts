const YOUTUBE_ID_PATTERN =
  /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(YOUTUBE_ID_PATTERN);
  return match ? match[1] : null;
}

export function getYouTubeThumbnail(url: string | null | undefined): string | null {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null;
}

interface YouTubeEmbedOptions {
  mute?: boolean;
  loop?: boolean;
}

export function getYouTubeEmbedUrl(
  url: string | null | undefined,
  options: YouTubeEmbedOptions = {}
): string | null {
  const id = getYouTubeId(url);
  if (!id) return null;

  const params = new URLSearchParams({ autoplay: "1", rel: "0" });
  if (options.mute) params.set("mute", "1");
  if (options.loop) {
    params.set("loop", "1");
    params.set("playlist", id);
  }

  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}
