"use client";
import { useState, useEffect, useRef } from "react";
import { Globe, X } from "lucide-react";

const LANGUAGES = [
  { code: "pt", label: "Portugues", flag: "\u{1F1E7}\u{1F1F7}" },
  { code: "en", label: "English", flag: "\u{1F1FA}\u{1F1F8}" },
  { code: "ru", label: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439", flag: "\u{1F1F7}\u{1F1FA}" },
  { code: "es", label: "Espanol", flag: "\u{1F1EA}\u{1F1F8}" },
  { code: "fr", label: "Francais", flag: "\u{1F1EB}\u{1F1F7}" },
  { code: "de", label: "Deutsch", flag: "\u{1F1E9}\u{1F1EA}" },
  { code: "it", label: "Italiano", flag: "\u{1F1EE}\u{1F1F9}" },
  { code: "zh-CN", label: "\u7B80\u4F53\u4E2D\u6587", flag: "\u{1F1E8}\u{1F1F3}" },
  { code: "zh-TW", label: "\u7E41\u9AD4\u4E2D\u6587", flag: "\u{1F1F9}\u{1F1FC}" },
  { code: "ko", label: "\uD55C\uAD6D\uC5B4", flag: "\u{1F1F0}\u{1F1F7}" },
  { code: "ja", label: "\u65E5\u672C\u8A9E", flag: "\u{1F1EF}\u{1F1F5}" },
  { code: "id", label: "Indonesia", flag: "\u{1F1EE}\u{1F1E9}" },
  { code: "tr", label: "Turkce", flag: "\u{1F1F9}\u{1F1F7}" },
];

export function TranslationPopup() {
  return <TranslateButton />;
}

export function TranslationPopupSmall({ show, onClose }: { show: boolean; onClose: () => void }) {
  return <TranslateButton />;
}

function TranslateButton() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleTranslate = (langCode: string) => {
    const url = window.location.href;
    const encoded = encodeURIComponent(url);
    const googleUrl = `https://translate.google.com/translate?sl=pt-BR&tl=${langCode}&u=${encoded}`;
    window.open(googleUrl, "_blank");
    setOpen(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-[90]" ref={menuRef}>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center border-2 border-primary/50"
        title="Traduzir site"
      >
        {open ? <X className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute bottom-14 right-0 w-52 rounded-xl border border-primary/30 bg-card shadow-2xl overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="px-3 py-2 bg-primary/10 border-b border-border">
            <p className="text-[10px] font-bold text-foreground flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-primary" /> Traduzir para
            </p>
          </div>
          <div className="max-h-80 overflow-y-auto py-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleTranslate(lang.code)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-primary/10 transition-colors"
              >
                <span className="text-base leading-none">{lang.flag}</span>
                <span className="text-xs font-medium text-foreground">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
