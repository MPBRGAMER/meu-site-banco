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

const STORAGE_KEY = "translationPopupDismissed";

export function TranslationPopup() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      const timer = setTimeout(() => setShowPopup(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShowPopup(false);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  const handleTranslate = (langCode: string) => {
    const url = window.location.href;
    const encoded = encodeURIComponent(url);
    const googleUrl = `https://translate.google.com/translate?sl=pt-BR&tl=${langCode}&u=${encoded}`;
    window.open(googleUrl, "_blank");
    handleClose();
  };

  return (
    <>
      {/* Popup on first visit */}
      {showPopup && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-md rounded-xl border border-primary/30 bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-primary/10 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground">Traduzir o Site</h2>
                  <p className="text-[10px] text-muted-foreground">Selecione seu idioma</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Language grid */}
            <div className="p-4">
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleTranslate(lang.code)}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all text-left"
                  >
                    <span className="text-lg leading-none">{lang.flag}</span>
                    <span className="text-xs font-medium text-foreground">{lang.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-border bg-muted/20 flex justify-end">
              <button
                onClick={handleClose}
                className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                Continuar em Portugues
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating button (always visible) */}
      <TranslateFloatButton />
    </>
  );
}

export function TranslationPopupSmall({ show, onClose }: { show: boolean; onClose: () => void }) {
  return <TranslateFloatButton />;
}

function TranslateFloatButton() {
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
