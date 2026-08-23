"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Globe, X } from "lucide-react";

const LANGUAGES = [
  { code: "pt", label: "Português", flag: "F1E7F1F7" },
  { code: "en", label: "English", flag: "F1FAF1F8" },
  { code: "es", label: "Español", flag: "F1EAF1F8" },
  { code: "fr", label: "Français", flag: "F1EBF1F7" },
  { code: "de", label: "Deutsch", flag: "F1E9F1EA" },
  { code: "ru", label: "Русский", flag: "F1F7F1FA" },
  { code: "it", label: "Italiano", flag: "F1EEF1F9" },
  { code: "zh-cn", label: "简体中文", flag: "F1E8F1F3" },
  { code: "zh-tw", label: "繁體中文", flag: "F1F8F1ED" },
  { code: "ko", label: "한국어", flag: "F1F0F1F7" },
  { code: "ja", label: "日本語", flag: "F1EFF1F5" },
  { code: "id", label: "Indonesia", flag: "F1EEF1E9" },
  { code: "tr", label: "Türkçe", flag: "F1F9F1F7" },
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
 * Exported helper — apply translation from other components.
 */
export function setTranslationLanguage(code: string) {
  applyLanguage(code);
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
                  <span>{lang.flag}</span>
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
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className="fixed bottom-4 right-4 z-[90]" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg flex items-center justify-center border-2 border-primary/50 transition-colors"
        title="Traduzir site"
      >
        {open ? <X className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
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
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-primary/10 transition-colors"
              >
                <span>{lang.flag}</span>
                <span className="text-xs font-medium">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
