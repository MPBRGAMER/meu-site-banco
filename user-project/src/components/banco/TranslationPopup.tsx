"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Globe, X } from "lucide-react";

const LANGUAGES = [
  { code: "pt", label: "Português", flag: "\u{1F1E7}\u{1F1F7}" },
  { code: "en", label: "English", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "es", label: "Español", flag: "\u{1F1EA}\u{1F1F8}" },
  { code: "fr", label: "Français", flag: "\u{1F1EB}\u{1F1F7}" },
  { code: "de", label: "Deutsch", flag: "\u{1F1E9}\u{1F1EA}" },
  { code: "ru", label: "Русский", flag: "\u{1F1F7}\u{1F1FA}" },
  { code: "it", label: "Italiano", flag: "\u{1F1EE}\u{1F1F9}" },
  { code: "zh-cn", label: "简体中文", flag: "\u{1F1E8}\u{1F1F3}" },
  { code: "zh-tw", label: "繁體中文", flag: "\u{1F1F8}\u{1F1ED}" },
  { code: "ko", label: "한국어", flag: "\u{1F1F0}\u{1F1F7}" },
  { code: "ja", label: "日本語", flag: "\u{1F1EF}\u{1F1F5}" },
  { code: "id", label: "Indonesia", flag: "\u{1F1EE}\u{1F1E9}" },
  { code: "tr", label: "Türkçe", flag: "\u{1F1F9}\u{1F1F7}" },
];

/* Map our codes to Google Translate language codes */
const GMAP: Record<string, string> = {
  en: "en", es: "es", fr: "fr", de: "de", ru: "ru",
  it: "it", "zh-cn": "zh-CN", "zh-tw": "zh-TW", ko: "ko", ja: "ja", id: "id", tr: "tr",
};

/* Map to HTML lang attribute values (for dates) */
const LANG_MAP: Record<string, string> = {
  pt: "pt-BR", en: "en-US", es: "es-ES", fr: "fr-FR", de: "de-DE", ru: "ru-RU",
  it: "it-IT", "zh-cn": "zh-CN", "zh-tw": "zh-TW", ko: "ko-KR", ja: "ja-JP", id: "id-ID", tr: "tr-TR",
};

let _gtLoaded = false;

/** Load the Google Translate element script (once) */
function loadGTS() {
  if (_gtLoaded) return;
  _gtLoaded = true;
  const el = document.getElementById("google_translate_element");
  if (!el) return;
  (window as any).googleTranslateElementInit = function () {
    new (window as any).google.translate.TranslateElement({
      pageLanguage: "pt",
      includedLanguages: "en,es,fr,de,ru,it,zh-CN,zh-TW,ko,ja,id,tr",
      autoDisplay: false,
    }, "google_translate_element");
  };
  const s = document.createElement("script");
  s.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  s.async = true;
  document.head.appendChild(s);
}

/** Programmatically select a language in the Google Translate combo */
function applyGT(code: string) {
  if (code === "pt") return;
  const target = GMAP[code];
  if (!target) return;
  let tries = 0;
  const go = () => {
    const combo = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (combo) {
      if (combo.value !== target) {
        combo.value = target;
        combo.dispatchEvent(new Event("change"));
      }
    } else if (tries < 30) {
      tries++;
      setTimeout(go, 300);
    }
  };
  go();
}

/* ============================================================
   EXPORTED HELPERS (used by other tabs for date formatting)
   ============================================================ */
export function getDateLocale(): string {
  const lang = typeof window !== "undefined" ? (localStorage.getItem("dayr-language") || "pt") : "pt";
  return LANG_MAP[lang] || "pt-BR";
}

export function setTranslationLanguage(code: string) {
  localStorage.setItem("dayr-language", code);
  applyLanguage(code);
}

function applyLanguage(code: string) {
  if (code === "pt") {
    document.documentElement.lang = "pt-BR";
    // Clear Google Translate state
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    const gtFrame = document.querySelector(".goog-te-banner-frame");
    if (gtFrame) gtFrame.remove();
    const gtStyle = document.getElementById("goog-gt-tt");
    if (gtStyle) gtStyle.remove();
    // Remove translation modifications from the body
    document.body.style.top = "";
    return;
  }
  document.documentElement.lang = LANG_MAP[code] || code;
  loadGTS();
  applyGT(code);
}

/* ============================================================
   REACT COMPONENTS
   ============================================================ */
export function TranslationPopup() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("dayr-language") || "pt";
    if (!localStorage.getItem("translation-popup-dismissed")) {
      const timer = setTimeout(() => setShowPopup(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const choose = useCallback((code: string) => {
    localStorage.setItem("dayr-language", code);
    applyLanguage(code);
    setShowPopup(false);
    localStorage.setItem("translation-popup-dismissed", "1");
    if (code !== "pt") {
      // Reload so Google Translate picks up the whole page cleanly
      setTimeout(() => window.location.reload(), 1500);
    }
  }, []);

  return (
    <>
      {/* Hidden Google Translate element */}
      <div id="google_translate_element" style={{ display: "none" }} />

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
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border hover:border-primary/40 text-left"
                >
                  <span>{lang.flag}</span>
                  <span className="text-xs font-medium">{lang.label}</span>
                </button>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-border flex justify-end">
              <button
                onClick={() => { choose("pt"); setShowPopup(false); }}
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

export function TranslationPopupSmall({ show: _show, onClose: _onClose }: { show: boolean; onClose: () => void }) {
  return <TranslateFloatButton onChoose={(c) => { localStorage.setItem("dayr-language", c); applyLanguage(c); if (c !== "pt") setTimeout(() => window.location.reload(), 1500); }} />;
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
        className="w-12 h-12 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg flex items-center justify-center border-2 border-primary/50"
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
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-primary/10"
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
