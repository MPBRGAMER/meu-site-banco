"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Globe, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LANGUAGES = [
  { code: "pt", label: "Português", flag: "br" },
  { code: "en", label: "English", flag: "us" },
  { code: "es", label: "Español", flag: "es" },
  { code: "fr", label: "Français", flag: "fr" },
  { code: "de", label: "Deutsch", flag: "de" },
  { code: "ru", label: "Русский", flag: "ru" },
  { code: "it", label: "Italiano", flag: "it" },
  { code: "zh-cn", label: "简体中文", flag: "cn" },
  { code: "zh-tw", label: "繁體中文", flag: "tw" },
  { code: "ko", label: "한국어", flag: "kr" },
  { code: "ja", label: "日本語", flag: "jp" },
  { code: "id", label: "Indonesia", flag: "id" },
  { code: "tr", label: "Türkçe", flag: "tr" },
];

/* Map our codes to Google Translate language codes */
const GT_LANG: Record<string, string> = {
  en: "en", es: "es", fr: "fr", de: "de", ru: "ru",
  it: "it", "zh-cn": "zh-CN", "zh-tw": "zh-TW", ko: "ko", ja: "ja", id: "id", tr: "tr",
};

/* Map to HTML lang attribute values (for dates) */
const LANG_MAP: Record<string, string> = {
  pt: "pt-BR", en: "en-US", es: "es-ES", fr: "fr-FR", de: "de-DE", ru: "ru-RU",
  it: "it-IT", "zh-cn": "zh-CN", "zh-tw": "zh-TW", ko: "ko-KR", ja: "ja-JP", id: "id-ID", tr: "tr-TR",
};

/**
 * Exported helper used by tab components for date formatting.
 * Reads the stored language preference and returns a locale string.
 */
export function getDateLocale(): string {
  if (typeof window === "undefined") return "pt-BR";
  const lang = localStorage.getItem("dayr-language") || "pt";
  return LANG_MAP[lang] || "pt-BR";
}

/**
 * Core function: set cookie + reload so Google Translate picks it up.
 */
function applyLanguage(code: string) {
  localStorage.setItem("dayr-language", code);

  if (code === "pt") {
    // Clear translation cookie and reload to original
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=";
    document.documentElement.lang = "pt-BR";
    window.location.reload();
    return;
  }

  // Set the googtrans cookie — Google Translate reads this on load
  const gtCode = GT_LANG[code];
  if (!gtCode) return;

  document.cookie = `googtrans=/pt/${gtCode}; path=/; max-age=31536000; SameSite=Lax`;
  document.documentElement.lang = LANG_MAP[code] || code;

  // Reload so the GT script (already in layout) picks up the cookie and translates
  window.location.reload();
}

/* ============================================================
   REACT COMPONENTS
   ============================================================ */
export function TranslationPopup() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Show popup on first visit only
    if (!localStorage.getItem("translation-popup-dismissed")) {
      const timer = setTimeout(() => setShowPopup(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const choose = useCallback((code: string) => {
    setShowPopup(false);
    localStorage.setItem("translation-popup-dismissed", "1");
    applyLanguage(code);
  }, []);

  return (
    <>
      {showPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-primary/30 bg-card shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 bg-primary/10 border-b border-border">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-sm font-bold text-foreground">Traduzir o Site</h2>
                  <p className="text-[10px] text-muted-foreground">Selecione seu idioma</p>
                </div>
              </div>
              <button onClick={() => setShowPopup(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 p-4">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => choose(lang.code)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border hover:border-primary/40 text-left transition-colors"
                >
                  <img src={`https://flagcdn.com/w20/${lang.flag}.png`} alt="" width="20" height="15" className="rounded-sm" />
                  <span className="text-xs font-medium">{lang.label}</span>
                </button>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-border flex justify-end">
              <button
                onClick={() => choose("pt")}
                className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold"
              >
                Continuar em Português
              </button>
            </div>
          </div>
        </div>
      )}
      <TranslateFloatButton onChoose={choose} />
    </>
  );
}

function TranslateFloatButton({ onChoose }: { onChoose: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  const [currentFlag, setCurrentFlag] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("dayr-language") || "pt";
    if (saved !== "pt") {
      const lang = LANGUAGES.find((l) => l.code === saved);
      if (lang) setCurrentFlag(lang.flag);
    }
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const currentLang = typeof window !== "undefined" ? (localStorage.getItem("dayr-language") || "pt") : "pt";

  return (
    <div className="fixed bottom-4 right-4 z-[90]" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg flex items-center justify-center border-2 border-primary/50 transition-colors"
        title="Traduzir site"
      >
        {open ? <X className="w-5 h-5" /> : currentFlag ? <img src={`https://flagcdn.com/w20/${currentFlag}.png`} alt="" width="24" height="18" className="rounded-sm" /> : <Globe className="w-5 h-5" />}
      </button>
      {open && (
        <div className="absolute bottom-14 right-0 w-52 rounded-xl border border-primary/30 bg-card shadow-2xl overflow-hidden">
          <div className="px-3 py-2 bg-primary/10 border-b border-border">
            <p className="text-[10px] font-bold">Traduzir para</p>
          </div>
          <div className="max-h-80 overflow-y-auto py-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { onChoose(lang.code); setOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors",
                  currentLang === lang.code ? "bg-primary/15 text-primary" : "hover:bg-primary/10"
                )}
              >
                <img src={`https://flagcdn.com/w20/${lang.flag}.png`} alt="" width="20" height="15" className="rounded-sm" />
                <span className="text-xs font-medium">{lang.label}</span>
                {currentLang === lang.code && <span className="ml-auto text-[10px] text-primary">✓</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
