/**
 * Parseia uma mensagem de chat e detecta:
 * - URLs de imagem (png, jpg, gif, webp, svg) → renderiza como <img>
 * - URLs do YouTube → renderiza como iframe embed
 * - Outras URLs → renderiza como <a> clicável
 * - Texto normal → renderiza como texto
 */

export interface MessageSegment {
  type: "text" | "image" | "video" | "link";
  content: string;
  url?: string;
  videoId?: string;
}

const URL_REGEX = /(https?:\/\/[^\s<>'"]+)/gi;
const IMG_EXTENSIONS = /\.(png|jpe?g|gif|webp|svg|bmp|ico)(\?.*)?$/i;
const YOUTUBE_REGEX = /(?:https?:\/\/(?:www\.)?)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/i;
const YOUTUBE_SHORT_REGEX = /(?:https?:\/\/(?:www\.)?)?youtu\.be\/([a-zA-Z0-9_-]{11})/i;

export function parseMessage(text: string): MessageSegment[] {
  const segments: MessageSegment[] = [];
  let lastIndex = 0;

  const matches = text.matchAll(URL_REGEX);

  for (const match of matches) {
    const url = match[0];
    const start = match.index!;

    // Texto antes da URL
    if (start > lastIndex) {
      segments.push({ type: "text", content: text.slice(lastIndex, start) });
    }

    // Verifica se é YouTube
    const ytMatch = url.match(YOUTUBE_REGEX) || url.match(YOUTUBE_SHORT_REGEX);
    if (ytMatch) {
      segments.push({ type: "video", content: url, videoId: ytMatch[1] });
    }
    // Verifica se é imagem
    else if (IMG_EXTENSIONS.test(url)) {
      segments.push({ type: "image", content: url, url });
    }
    // Link normal
    else {
      segments.push({ type: "link", content: url, url });
    }

    lastIndex = start + url.length;
  }

  // Resto do texto
  if (lastIndex < text.length) {
    segments.push({ type: "text", content: text.slice(lastIndex) });
  }

  // Se não encontrou nada, retorna como texto
  if (segments.length === 0) {
    segments.push({ type: "text", content: text });
  }

  return segments;
}
