"use client";
import { Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Componente de espaço para anúncio.
 * No futuro, substitua o conteúdo interno pelo código do AdSense/propaganda.
 *
 * Tamanhos padrão de mercado:
 * - "leaderboard": 728x90 (topo de página, entre seções)
 * - "banner": 468x60 (meio de conteúdo)
 * - "sidebar": 300x250 (barra lateral)
 * - "mobile-banner": 320x50 (mobile)
 * - "large": 970x90 (topo grande)
 * - "square": 250x250 (quadrado)
 */

const SIZES: Record<string, { w: string; h: string; label: string }> = {
  leaderboard: { w: "728px", h: "90px", label: "728 x 90" },
  banner: { w: "468px", h: "60px", label: "468 x 60" },
  sidebar: { w: "300px", h: "250px", label: "300 x 250" },
  "mobile-banner": { w: "320px", h: "50px", label: "320 x 50" },
  large: { w: "970px", h: "90px", label: "970 x 90" },
  square: { w: "250px", h: "250px", label: "250 x 250" },
};

interface AdSlotProps {
  size?: keyof typeof SIZES;
  className?: string;
  id?: string;
}

export default function AdSlot({ size = "leaderboard", className, id }: AdSlotProps) {
  const s = SIZES[size];
  const slotId = id || `ad-${size}-${Math.random().toString(36).slice(2, 8)}`;

  return (
    <div
      className={cn(
        "flex items-center justify-center w-full",
        className
      )}
      >
      <div
        id={slotId}
        className="relative rounded-md border border-dashed border-border/60 bg-muted/10 flex items-center justify-center overflow-hidden"
        style={{
          maxWidth: s.w,
          width: "100%",
          height: s.h,
          minHeight: s.h,
        }}
      >
        <div className="flex flex-col items-center gap-1 text-muted-foreground/40 pointer-events-none select-none">
          <Megaphone className="w-4 h-4" />
          <span className="text-[9px] font-mono">Espaço publicitário ({s.label})</span>
        </div>
      </div>
    </div>
  );
}
