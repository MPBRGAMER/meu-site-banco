"use client";
import { useState } from "react";
import { parseMessage, type MessageSegment } from "@/lib/parseMessage";
import { ExternalLink, Play, ImageOff, X } from "lucide-react";

function TextSegment({ content }: { content: string }) {
  return <span>{content}</span>;
}

function LinkSegment({ url }: { url: string }) {
  // Extrai domínio para exibição curta
  let displayUrl = url;
  try {
    const u = new URL(url);
    displayUrl = u.hostname + u.pathname;
    if (displayUrl.length > 50) displayUrl = displayUrl.slice(0, 47) + "...";
  } catch {
    if (displayUrl.length > 50) displayUrl = displayUrl.slice(0, 47) + "...";
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary hover:underline inline-flex items-center gap-1 break-all"
      onClick={(e) => e.stopPropagation()}
    >
      {displayUrl}
      <ExternalLink className="w-2.5 h-2.5 shrink-0" />
    </a>
  );
}

function ImageSegment({ url }: { url: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (error) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-red-400 mt-0.5">
        <ImageOff className="w-3 h-3" />
        <span>Imagem não carregou</span>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">(abrir)</a>
      </div>
    );
  }

  return (
    <div className="mt-1">
      <div
        className={
          expanded
            ? "fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4"
            : "inline-block max-w-[200px] max-h-[150px] cursor-pointer"
        }
        onClick={expanded ? (e) => { e.stopPropagation(); setExpanded(false); } : undefined}
      >
        {expanded && (
          <button
            className="absolute top-3 right-3 text-white/70 hover:text-white z-10"
            onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
          >
            <X className="w-6 h-6" />
          </button>
        )}
        {!loaded && (
          <div className={expanded ? "w-full h-full flex items-center justify-center" : "w-[200px] h-[100px] flex items-center justify-center rounded bg-muted/50"}>
            <span className="text-[10px] text-muted-foreground">Carregando imagem...</span>
          </div>
        )}
        <img
          src={url}
          alt="Imagem compartilhada"
          className={
            expanded
              ? "max-w-full max-h-full object-contain rounded"
              : "max-w-[200px] max-h-[150px] object-cover rounded-md border border-border/50"
          }
          onClick={expanded ? undefined : (e) => { e.stopPropagation(); setExpanded(true); }}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      </div>
      {!expanded && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-[10px] text-muted-foreground hover:text-primary mt-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          Clique para expandir
        </a>
      )}
    </div>
  );
}

function VideoSegment({ videoId, url }: { videoId: string; url: string }) {
  const [showEmbed, setShowEmbed] = useState(false);

  if (!showEmbed) {
    return (
      <div
        className="mt-1 inline-flex items-center gap-2 px-3 py-2 rounded-md bg-red-500/10 border border-red-500/20 cursor-pointer hover:bg-red-500/20 transition-colors"
        onClick={(e) => { e.stopPropagation(); setShowEmbed(true); }}
      >
        <Play className="w-4 h-4 text-red-400" />
        <span className="text-xs font-medium text-foreground">YouTube</span>
        <span className="text-[10px] text-muted-foreground hidden sm:inline">- clique para reproduzir</span>
      </div>
    );
  }

  return (
    <div className="mt-1 w-full max-w-[360px]" onClick={(e) => e.stopPropagation()}>
      <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
        <iframe
          className="absolute inset-0 w-full h-full rounded-md"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title="Vídeo do YouTube"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[10px] text-muted-foreground hover:text-primary mt-0.5 inline-block"
      >
        Abrir no YouTube
      </a>
    </div>
  );
}

const SEGMENT_RENDERERS: Record<MessageSegment["type"], React.FC<any>> = {
  text: TextSegment,
  link: LinkSegment,
  image: ImageSegment,
  video: VideoSegment,
};

export default function ChatMessageContent({ content }: { content: string }) {
  const segments = parseMessage(content);

  return (
    <>
      {segments.map((seg, i) => {
        const Renderer = SEGMENT_RENDERERS[seg.type];
        return <Renderer key={i} {...seg} />;
      })}
    </>
  );
}
