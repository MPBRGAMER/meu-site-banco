"use client";
import { useState, useEffect, useRef } from "react";
import { Megaphone, Code, Save, Trash2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
  isAdmin?: boolean;
}

export default function AdSlot({ size = "leaderboard", className, id, isAdmin = false }: AdSlotProps) {
  const s = SIZES[size];
  const slotId = id || `ad-${size}-${Math.random().toString(36).slice(2, 8)}`;
  const [codigo, setCodigo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editCode, setEditCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Fetch ad code
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/banco?action=getAd&slotId=${encodeURIComponent(slotId)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) {
          setCodigo(data.codigo || "");
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slotId]);

  // Don't render anything for non-admin while loading or if no code
  if (loading) return null;
  if (!isAdmin && !codigo) return null;

  // Non-admin with ad code: render the ad invisibly (no wrapper chrome)
  if (!isAdmin && codigo) {
    return (
      <div className={cn("w-full", className)}>
        <div
          style={{
            maxWidth: s.w,
            width: "100%",
            minHeight: s.h,
          }}
          dangerouslySetInnerHTML={{ __html: codigo }}
        />
      </div>
    );
  }

  // Admin view
  const handleSave = async () => {
    const pwd = sessionStorage.getItem("adminPwd");
    if (!pwd) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/banco`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": pwd,
        },
        body: JSON.stringify({ action: "setAd", slotId, codigo: editCode }),
      });
      if (res.ok) {
        setCodigo(editCode);
        setEditing(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const pwd = sessionStorage.getItem("adminPwd");
    if (!pwd) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/banco`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": pwd,
        },
        body: JSON.stringify({ action: "deleteAd", slotId }),
      });
      if (res.ok) {
        setCodigo("");
        setEditing(false);
        setEditCode("");
      }
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const openEditor = () => {
    setEditCode(codigo || "");
    setEditing(true);
  };

  return (
    <>
      <div className={cn("w-full", className)}>
        {codigo ? (
          /* Admin sees the live ad + a small edit badge */
          <div className="relative group">
            <div
              style={{
                maxWidth: s.w,
                width: "100%",
                minHeight: s.h,
              }}
              dangerouslySetInnerHTML={{ __html: codigo }}
            />
            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={openEditor}
                className="flex items-center gap-1 px-2 py-1 rounded bg-primary/90 text-primary-foreground text-[10px] font-semibold hover:bg-primary"
                title="Editar propaganda"
              >
                <Code className="w-3 h-3" /> Editar
              </button>
            </div>
          </div>
        ) : (
          /* Admin sees placeholder when no code */
          <div
            className="relative rounded-md border border-dashed border-primary/30 bg-primary/5 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/50 hover:bg-primary/10 transition-colors"
            style={{
              maxWidth: s.w,
              width: "100%",
              height: s.h,
              minHeight: s.h,
            }}
            onClick={openEditor}
          >
            <div className="flex flex-col items-center gap-1 text-primary/40">
              <Megaphone className="w-4 h-4" />
              <span className="text-[9px] font-mono">Espaco publicitario ({s.label})</span>
              <span className="text-[8px] font-mono text-primary/25">clique para inserir codigo</span>
            </div>
          </div>
        )}
        {saved && (
          <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-green-400 font-semibold">
            <Check className="w-3 h-3" /> Salvo!
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {editing && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60" onClick={() => setEditing(false)}>
          <div
            ref={modalRef}
            className="rounded-lg border border-primary/20 bg-card p-4 w-full max-w-lg mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                <Code className="w-4 h-4" /> Propaganda — {slotId}
              </h3>
              <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mb-2">
              Cole o codigo HTML/JS da propaganda (AdSense, etc.). Tamanho recomendado: {s.label}
            </p>
            <textarea
              value={editCode}
              onChange={(e) => setEditCode(e.target.value)}
              placeholder='<ins class="adsbygoogle" ...></ins>'
              className="w-full h-40 rounded-md border border-border bg-muted/30 p-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 resize-none"
              autoFocus
            />
            <div className="flex items-center justify-between mt-3 gap-2">
              <button
                onClick={handleDelete}
                disabled={saving || !codigo}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-red-500/30 text-red-400 text-[11px] font-semibold hover:bg-red-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Limpar
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="px-3 py-1.5 rounded-md border border-border text-muted-foreground text-[11px] font-semibold hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-[11px] font-semibold hover:bg-primary/90 disabled:opacity-60 transition-colors"
                >
                  <Save className="w-3 h-3" /> {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
