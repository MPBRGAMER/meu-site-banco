"use client";

import { useEffect, useRef, useState } from "react";
import { Globe, X } from "lucide-react";

const LANGUAGES = [
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

const EN: Record<string, string> = {
  "Day R Survival": "Day R Survival",
  "Posto de Trocas - Sobreviventes": "Trading Post - Survivors",
  "Dashboard": "Dashboard", "Chat": "Chat", "Tabela": "Price Table",
  "Empréstimos": "Loans", "Trocas": "Trades", "Doadores": "Donors",
  "Leilões": "Auctions", "Sorteios": "Raffles", "Lotérica": "Lottery",
  "Investidores": "Investors", "Config Trocas": "Trade Settings",
  "Compras & Vendas": "Purchases & Sales", "Estoque & Caixa": "Stock & Cash",
  "POSTO DE TROCAS": "TRADING POST", "Sistema de gestao para sobreviventes": "Management system for survivors",
  "Empréstimos Pendentes": "Pending Loans", "Empréstimos Pagos": "Paid Loans",
  "Investidores Ativos": "Active Investors", "Trocas Realizadas": "Completed Trades",
  "Compras & Vendas": "Purchases & Sales", "Registros no Caixa": "Cash Records",
  "Leilões Ativos": "Active Auctions", "Sorteios Ativos": "Active Raffles",
  "Top 10 Doadores": "Top 10 Donors", "Top 10 Investidores": "Top 10 Investors",
  "Top 10 Contribuintes": "Top Contributors", "Estoque do Banco": "Bank Stock",
  "Movimentos do Caixa": "Cash Movements", "Buscar item...": "Search item...",
  "Carregando dados do banco...": "Loading bank data...", "Login Admin": "Admin Login",
  "Digite a senha de administrador para acessar o modo Admin.": "Enter the administrator password to access Admin mode.",
  "Senha de admin": "Admin password", "Cancelar": "Cancel", "Entrar": "Sign in",
  "Verificando...": "Verifying...", "Backup": "Backup", "Gerando...": "Generating...",
  "Continuar em Português": "Continue in Portuguese", "Traduzir o Site": "Translate Site",
  "Selecione seu idioma": "Select your language", "Traduzir para": "Translate to",
  "Modo Admin ativado!": "Admin mode enabled!", "Senha incorreta!": "Incorrect password!",
  "Digite a senha de admin!": "Enter the admin password!", "Não autorizado": "Unauthorized",
  "Doação": "Donation", "Quantidade": "Quantity", "Item": "Item", "Nome": "Name",
};

const ES: Record<string, string> = {
  ...EN, "Dashboard": "Panel", "Tabela": "Tabla de precios", "Empréstimos": "Préstamos", "Trocas": "Intercambios", "Doadores": "Donantes", "Leilões": "Subastas", "Sorteios": "Sorteos", "Lotérica": "Lotería", "Buscar item...": "Buscar artículo...", "Carregando dados do banco...": "Cargando datos del banco...", "Cancelar": "Cancelar", "Entrar": "Entrar", "Traduzir para": "Traducir a"
};

const FR: Record<string, string> = { ...EN, "Dashboard": "Tableau de bord", "Tabela": "Table des prix", "Empréstimos": "Prêts", "Trocas": "Échanges", "Doadores": "Donateurs", "Leilões": "Enchères", "Buscar item...": "Rechercher un objet...", "Cancelar": "Annuler", "Entrar": "Entrer" };
const DE: Record<string, string> = { ...EN, "Dashboard": "Übersicht", "Tabela": "Preistabelle", "Empréstimos": "Kredite", "Trocas": "Tausch", "Doadores": "Spender", "Leilões": "Auktionen", "Buscar item...": "Gegenstand suchen...", "Cancelar": "Abbrechen", "Entrar": "Anmelden" };
const RU: Record<string, string> = { ...EN, "Dashboard": "Панель", "Tabela": "Таблица цен", "Empréstimos": "Займы", "Trocas": "Обмены", "Doadores": "Дарители", "Leilões": "Аукционы", "Buscar item...": "Поиск предмета...", "Cancelar": "Отмена", "Entrar": "Войти" };
const dictionaries: Record<string, Record<string, string>> = { en: EN, es: ES, fr: FR, de: DE, ru: RU };
const originalText = new WeakMap<Text, string>();
let observer: MutationObserver | null = null;

function translatePage(langCode: string) {
  const dictionary = dictionaries[langCode];
  document.documentElement.lang = langCode === "pt" ? "pt-BR" : langCode;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "TEXTAREA", "INPUT"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes: Text[] = [];
  let node: Node | null;
  while ((node = walker.nextNode())) nodes.push(node as Text);
  for (const textNode of nodes) {
    if (!originalText.has(textNode)) originalText.set(textNode, textNode.nodeValue || "");
    const source = originalText.get(textNode) || "";
    const trimmed = source.trim();
    if (!trimmed) continue;
    const translated = langCode === "pt" ? source : dictionary?.[trimmed] || source;
    const nextValue = source === trimmed ? translated : source.replace(trimmed, translated);
    if (textNode.nodeValue !== nextValue) textNode.nodeValue = nextValue;
  }
}

function setLanguage(code: string) {
  localStorage.setItem("dayr-language", code);
  translatePage(code);
  if (!observer) {
    observer = new MutationObserver(() => translatePage(localStorage.getItem("dayr-language") || "pt"));
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

export function TranslationPopup() {
  const [showPopup, setShowPopup] = useState(false);
  useEffect(() => {
    const stored = localStorage.getItem("dayr-language") || "pt";
    setLanguage(stored);
    if (!localStorage.getItem("translation-popup-dismissed")) {
      const timer = setTimeout(() => setShowPopup(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);
  const choose = (code: string) => { setLanguage(code); setShowPopup(false); localStorage.setItem("translation-popup-dismissed", "1"); };
  return <>
    {showPopup && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={() => setShowPopup(false)}>
      <div className="w-full max-w-md rounded-xl border border-primary/30 bg-card shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 bg-primary/10 border-b border-border"><div className="flex items-center gap-3"><Globe className="w-5 h-5 text-primary" /><div><h2 className="text-sm font-bold text-foreground">Traduzir o Site</h2><p className="text-[10px] text-muted-foreground">Selecione seu idioma</p></div></div><button onClick={() => setShowPopup(false)}><X className="w-4 h-4" /></button></div>
        <div className="grid grid-cols-2 gap-2 p-4">{LANGUAGES.map((lang) => <button key={lang.code} onClick={() => choose(lang.code)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border hover:border-primary/40 text-left"><span>{lang.flag}</span><span className="text-xs font-medium">{lang.label}</span></button>)}</div>
        <div className="px-5 py-3 border-t border-border flex justify-end"><button onClick={() => setShowPopup(false)} className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold">Continuar em Português</button></div>
      </div>
    </div>}
    <TranslateFloatButton onChoose={choose} />
  </>;
}

export function TranslationPopupSmall({ show: _show, onClose: _onClose }: { show: boolean; onClose: () => void }) { return <TranslateFloatButton onChoose={setLanguage} />; }

function TranslateFloatButton({ onChoose }: { onChoose: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const close = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false); }; if (open) document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, [open]);
  return <div className="fixed bottom-4 right-4 z-[90]" ref={menuRef}><button onClick={() => setOpen(!open)} className="w-12 h-12 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg flex items-center justify-center border-2 border-primary/50" title="Traduzir site">{open ? <X className="w-5 h-5" /> : <Globe className="w-5 h-5" />}</button>{open && <div className="absolute bottom-14 right-0 w-52 rounded-xl border border-primary/30 bg-card shadow-2xl overflow-hidden"><div className="px-3 py-2 bg-primary/10 border-b border-border"><p className="text-[10px] font-bold">Traduzir para</p></div><div className="max-h-80 overflow-y-auto py-1">{LANGUAGES.map((lang) => <button key={lang.code} onClick={() => { onChoose(lang.code); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-primary/10"><span>{lang.flag}</span><span className="text-xs font-medium">{lang.label}</span></button>)}</div></div>}</div>;
}
