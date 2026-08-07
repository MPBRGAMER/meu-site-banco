"use client";
import { useState, useEffect } from "react";
import { Globe, X, ChevronDown, ChevronUp, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";

const TRANSLATIONS = [
  {
    lang: "Português (Brasil)",
    flag: "\u{1F1E7}\u{1F1F7}",
    text: "Este site está disponível apenas em Português Brasileiro. Para traduzir para o seu idioma, clique com o botão direito do mouse em qualquer parte da página e selecione \"Traduzir para [seu idioma]\" no menu do navegador.",
  },
  {
    lang: "English",
    flag: "\u{1F1FA}\u{1F1F8}",
    text: "This site is only available in Brazilian Portuguese. To translate it to your language, right-click anywhere on the page and select \"Translate to [your language]\" in the browser menu.",
  },
  {
    lang: "\u0420\u0443\u0441\u0441\u043A\u0438\u0439",
    flag: "\u{1F1F7}\u{1F1FA}",
    text: "\u042D\u0442\u043E\u0442 \u0441\u0430\u0439\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u0442\u043E\u043B\u044C\u043A\u043E \u043D\u0430 \u0431\u0440\u0430\u0437\u0438\u043B\u044C\u0441\u043A\u043E\u043C \u043F\u043E\u0440\u0442\u0443\u0433\u0430\u043B\u044C\u0441\u043A\u043E\u043C. \u0427\u0442\u043E\u0431\u044B \u043F\u0435\u0440\u0435\u0432\u0435\u0441\u0442\u0438 \u0435\u0433\u043E \u043D\u0430 \u0432\u0430\u0448 \u044F\u0437\u044B\u043A, \u043D\u0430\u0436\u043C\u0438\u0442\u0435 \u043F\u0440\u0430\u0432\u043E\u0439 \u043A\u043D\u043E\u043F\u043A\u043E\u0439 \u043C\u044B\u0448\u0438 \u0432 \u043B\u044E\u0431\u043E\u043C \u043C\u0435\u0441\u0442\u0435 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B \u0438 \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \"\u041F\u0435\u0440\u0435\u0432\u0435\u0441\u0442\u0438 \u043D\u0430 [\u0432\u0430\u0448 \u044F\u0437\u044B\u043A]\" \u0432 \u043C\u0435\u043D\u044E \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430.",
  },
  {
    lang: "Español",
    flag: "\u{1F1EA}\u{1F1F8}",
    text: "Este sitio solo está disponible en portugués brasileño. Para traducirlo a tu idioma, haz clic derecho en cualquier parte de la página y selecciona \"Traducir a [tu idioma]\" en el menú del navegador.",
  },
  {
    lang: "Français",
    flag: "\u{1F1EB}\u{1F1F7}",
    text: "Ce site est uniquement disponible en portugais brésilien. Pour le traduire dans votre langue, faites un clic droit n'importe où sur la page et sélectionnez \"Traduire en [votre langue]\" dans le menu du navigateur.",
  },
  {
    lang: "Deutsch",
    flag: "\u{1F1E9}\u{1F1EA}",
    text: "Diese Website ist nur auf brasilianischem Portugiesisch verfügbar. Um sie in Ihre Sprache zu übersetzen, klicken Sie mit der rechten Maustaste auf eine beliebige Stelle der Seite und wählen Sie \"Übersetzen in [Ihre Sprache]\" im Browsermenü.",
  },
  {
    lang: "Italiano",
    flag: "\u{1F1EE}\u{1F1F9}",
    text: "Questo sito è disponibile solo in portoghese brasiliano. Per tradurlo nella tua lingua, fai clic con il tasto destro in qualsiasi punto della pagina e seleziona \"Traduci in [la tua lingua]\" nel menu del browser.",
  },
  {
    lang: "\u7B80\u4F53\u4E2D\u6587",
    flag: "\u{1F1E8}\u{1F1F3}",
    text: "\u672C\u7F51\u7AD9\u4EC5\u63D0\u4F9B\u5DF4\u897F\u8461\u8404\u7259\u8BED\u7248\u672C\u3002\u8981\u5C06\u5176\u7FFB\u8BD1\u6210\u60A8\u7684\u8BED\u8A00\uFF0C\u8BF7\u5728\u9875\u9762\u4EFB\u610F\u4F4D\u7F6E\u70B9\u51FB\u9F20\u6807\u53F3\u952E\uFF0C\u7136\u540E\u9009\u62E9\u6D4F\u89C8\u5668\u83DC\u5355\u4E2D\u7684\"\u7FFB\u8BD1\u4E3A[\u60A8\u7684\u8BED\u8A00]\"\u3002",
  },
  {
    lang: "\u7E41\u9AD4\u4E2D\u6587",
    flag: "\u{1F1F9}\u{1F1FC}",
    text: "\u672C\u7DB2\u7AD9\u50C5\u63D0\u4F9B\u5DF4\u897F\u8461\u8404\u7259\u8A9E\u7248\u672C\u3002\u8981\u5C07\u5176\u7FFB\u8B6F\u6210\u60A8\u7684\u8A9E\u8A00\uFF0C\u8ACB\u5728\u9801\u9762\u4EFB\u610F\u4F4D\u7F6E\u9EDE\u64CA\u6ED1\u9F20\u53F3\u9375\uFF0C\u7136\u5F8C\u9078\u64C7\u700F\u89BD\u5668\u9078\u55AE\u4E2D\u7684\u300C\u7FFB\u8B6F\u70BA[\u60A8\u7684\u8A9E\u8A00]\u300D\u3002",
  },
  {
    lang: "\uD55C\uAD6D\uC5B4",
    flag: "\u{1F1F0}\u{1F1F7}",
    text: "\uC774 \uC0AC\uC774\uD2B8\uB294 \uBE0C\uB77C\uC9C0\uB9AC \uD3EC\uB974\uD22C\uAC08\uC5B4\uB85C\uB9CC \uC81C\uACF5\uB429\uB2C8\uB2E4. \uBC88\uC5ED\uD558\uB824\uBA74 \uD398\uC774\uC9C0 \uC544\uBB34 \uACF3\uC774\uB098 \uB9C8\uC6B0\uC2A4 \uC624\uB978\uCABD \uBC84\uD2BC\uC744 \uD074\uB9AD\uD558\uACE0 \uBE0C\uB77C\uC6B0\uC800 \uBA54\uB274\uC5D0\uC11C \"[\uC0AC\uC6A9\uC790 \uC5B8\uC5B4]\uB85C \uBC88\uC5ED\"\uC744 \uC120\uD0DD\uD558\uC138\uC694.",
  },
  {
    lang: "\u65E5\u672C\u8A9E",
    flag: "\u{1F1EF}\u{1F1F5}",
    text: "\u3053\u306E\u30B5\u30A4\u30C8\u306F\u30D6\u30E9\u30B8\u30EB\u30DD\u30EB\u30C8\u30AC\u30EB\u8A9E\u306E\u307F\u3067\u3059\u3002\u7FFB\u8A33\u3059\u308B\u306B\u306F\u3001\u30DA\u30FC\u30B8\u306E\u4EFB\u610F\u306E\u5834\u6240\u3092\u53F3\u30AF\u30EA\u30C3\u30AF\u3057\u3001\u30D6\u30E9\u30A6\u30B6\u30E1\u30CB\u30E5\u30FC\u3067\"[\u8A00\u8A9E]\u306B\u7FFB\u8A33\"\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044\u3002",
  },
  {
    lang: "Bahasa Indonesia",
    flag: "\u{1F1EE}\u{1F1E9}",
    text: "Situs ini hanya tersedia dalam bahasa Portugis Brasil. Untuk menerjemahkannya ke bahasa Anda, klik kanan di mana saja di halaman dan pilih \"Terjemahkan ke [bahasa Anda]\" di menu browser.",
  },
  {
    lang: "T\u00FCrk\u00E7e",
    flag: "\u{1F1F9}\u{1F1F7}",
    text: "Bu site yaln\u0131zca Brezilya Portekizcesinde mevcuttur. Dilinize \u00E7evirmek i\u00E7in sayfan\u0131n herhangi bir yerine sa\u011F t\u0131klay\u0131n ve taray\u0131c\u0131 men\u00FCs\u00FCnden \"[Dilinize] \u00C7evir\" se\u00E7ene\u011Fini se\u00E7in.",
  },
];

const STORAGE_KEY = "translationPopupDismissed";

/* ── Modal GRANDE site-wide ── */
export function TranslationPopup() {
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const wasDismissed = localStorage.getItem(STORAGE_KEY);
    if (!wasDismissed) {
      const timer = setTimeout(() => setShow(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, "1");
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={handleClose}>
      <div
        className="w-full max-w-2xl max-h-[85vh] rounded-xl border border-primary/30 bg-card shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-primary/10 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Tradução do Site</h2>
              <p className="text-[11px] text-muted-foreground">Este site está em Português Brasileiro</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Visual instruction */}
          <div className="flex items-center gap-3 rounded-lg bg-primary/5 border border-primary/20 p-3">
            <MousePointerClick className="w-8 h-8 text-primary shrink-0" />
            <div>
              <p className="text-xs font-bold text-foreground">Como traduzir:</p>
              <p className="text-[11px] text-muted-foreground">Clique com o <strong>botão direito</strong> do mouse em qualquer parte da página e selecione <strong>"Traduzir para..."</strong> no menu do navegador.</p>
            </div>
          </div>

          {/* Language cards */}
          {expanded ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TRANSLATIONS.map((t) => (
                <div key={t.lang} className="rounded-lg bg-muted/30 border border-border/50 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">{t.flag}</span>
                    <span className="text-xs font-bold text-foreground">{t.lang}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{t.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-muted/20 border border-border/50 p-3 text-center">
              <p className="text-xs text-muted-foreground">Clique para expandir as instruções em todos os idiomas</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-muted/20 shrink-0">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            {expanded ? "Recolher idiomas" : "Expandir idiomas"}
          </button>
          <Button
            onClick={handleClose}
            className="bg-primary text-primary-foreground text-xs h-8 px-4"
          >
            Entendi
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Versão pequena para o botão Globe no chat ── */
export function TranslationPopupSmall({ show, onClose }: { show: boolean; onClose: () => void }) {
  const [expanded, setExpanded] = useState(true);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[55] w-80 max-w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="rounded-lg border border-border bg-card shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-primary/10 border-b border-border cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground">Tradução do Site</span>
          </div>
          <div className="flex items-center gap-1">
            {expanded ? <ChevronDown className="w-3 h-3 text-muted-foreground" /> : <ChevronUp className="w-3 h-3 text-muted-foreground" />}
            <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-muted-foreground hover:text-foreground ml-1">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {expanded && (
          <div className="max-h-72 overflow-y-auto p-2 space-y-2">
            {TRANSLATIONS.map((t) => (
              <div key={t.lang} className="rounded-md bg-muted/30 border border-border/50 p-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm">{t.flag}</span>
                  <span className="text-[11px] font-bold text-foreground">{t.lang}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{t.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
