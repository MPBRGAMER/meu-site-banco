"use client";
import { useState, useEffect } from "react";
import { Globe, X, ChevronDown, ChevronUp } from "lucide-react";
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
    lang: "简体中文",
    flag: "\u{1F1E8}\u{1F1F3}",
    text: "本网站仅提供巴西葡萄牙语版本。要将其翻译成您的语言，请在页面任意位置点击鼠标右键，然后选择浏览器菜单中的\"翻译为[您的语言]\"。",
  },
  {
    lang: "繁體中文",
    flag: "\u{1F1F9}\u{1F1FC}",
    text: "本網站僅提供巴西葡萄牙語版本。要將其翻譯成您的語言，請在頁面任意位置點擊滑鼠右鍵，然後選擇瀏覽器選單中的「翻譯為[您的語言]」。",
  },
  {
    lang: "한국어",
    flag: "\u{1F1F0}\u{1F1F7}",
    text: "이 사이트는 브라질 포르투갈어로만 제공됩니다. 번역하려면 페이지 아무 곳이나 마우스 오른쪽 버튼을 클릭하고 브라우저 메뉴에서 \"[사용자 언어]로 번역\"을 선택하세요.",
  },
  {
    lang: "日本語",
    flag: "\u{1F1EF}\u{1F1F5}",
    text: "このサイトはブラジルポルトガル語のみです。翻訳するには、ページの任意の場所を右クリックし、ブラウザメニューで\"[言語]に翻訳\"を選択してください。",
  },
  {
    lang: "Bahasa Indonesia",
    flag: "\u{1F1EE}\u{1F1E9}",
    text: "Situs ini hanya tersedia dalam bahasa Portugis Brasil. Untuk menerjemahkannya ke bahasa Anda, klik kanan di mana saja di halaman dan pilih \"Terjemahkan ke [bahasa Anda]\" di menu browser.",
  },
  {
    lang: "Türkçe",
    flag: "\u{1F1F9}\u{1F1F7}",
    text: "Bu site yalnızca Brezilya Portekizcesinde mevcuttur. Dilinize çevirmek için sayfanın herhangi bir yerine sağ tıklayın ve tarayıcı menüsünden \"[Dilinize] Çevir\" seçeneğini seçin.",
  },
];

/* ── Popup de tradução com conteúdo reutilizável ── */
function TranslationContent({
  expanded,
  setExpanded,
  onClose,
}: {
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  onClose: () => void;
}) {
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
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground h-7 mt-1"
              onClick={onClose}
            >
              Não mostrar novamente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Auto-popup (aparece 1x na primeira visita ao chat) ── */
export function TranslationPopup() {
  const [show, setShow] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    const wasDismissed = localStorage.getItem("translationPopupDismissed");
    if (!wasDismissed) {
      const timer = setTimeout(() => setShow(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!show) return null;

  return (
    <TranslationContent
      expanded={expanded}
      setExpanded={setExpanded}
      onClose={() => {
        setShow(false);
        localStorage.setItem("translationPopupDismissed", "1");
      }}
    />
  );
}

/* ── Forçado pelo botão Globe (ignora localStorage) ── */
export function TranslationPopupForce({ show, onClose }: { show: boolean; onClose: () => void }) {
  const [expanded, setExpanded] = useState(true);

  if (!show) return null;

  return (
    <TranslationContent
      expanded={expanded}
      setExpanded={setExpanded}
      onClose={onClose}
    />
  );
}
