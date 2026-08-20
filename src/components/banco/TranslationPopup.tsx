/* ============================================================
   TRANSLATION ENGINE
   ============================================================ */
const originalText = new WeakMap<Text, string>();
let observer: MutationObserver | null = null;
let currentLang = "pt";
let apiDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const apiCache = new Map<string, string>();
let isTranslating = false;

/** Strip diacritics: "Aço" → "Aco", "Preço" → "Preco" */
function stripAccents(str: string): string {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function hasNoTranslateAncestor(node: Node): boolean {
  let el: Node | null = node.parentElement;
  while (el) {
    if (el instanceof HTMLElement && (el.hasAttribute("data-no-translate") || el.getAttribute("translate") === "no")) return true;
    el = el.parentElement;
  }
  return false;
}

/** Look up translation: lang dict → EN dict → accent-stripped → API cache */
function lookup(text: string, langCode: string, dictionary: Record<string, string> | undefined): string | undefined {
  const norm = stripAccents(text);
  if (langCode === "en") {
    return EN[text] || EN[norm] || apiCache.get(text) || apiCache.get(norm);
  }
  return dictionary?.[text] || EN[text] || dictionary?.[norm] || EN[norm] || apiCache.get(text) || apiCache.get(norm);
}

function translatePage(langCode: string) {
  if (isTranslating) return;
  isTranslating = true;
  try {
    currentLang = langCode;
    const dictionary = dictionaries[langCode];
    document.documentElement.lang = langCode === "pt" ? "pt-BR" : langCode;

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if ("SCRIPT STYLE TEXTAREA INPUT".includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (hasNoTranslateAncestor(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const nodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) nodes.push(node as Text);

    const untranslated: string[] = [];

    for (const textNode of nodes) {
      // Double-check no-translate (DOM may have changed since TreeWalker)
      if (hasNoTranslateAncestor(textNode)) continue;

      if (!originalText.has(textNode)) originalText.set(textNode, textNode.nodeValue || "");
      const source = originalText.get(textNode) || "";
      const trimmed = source.trim();
      if (!trimmed) continue;

      if (langCode === "pt") {
        if (textNode.nodeValue !== source) textNode.nodeValue = source;
        continue;
      }

      const translated = lookup(trimmed, langCode, dictionary);
      if (translated) {
        const nextValue = source === trimmed ? translated : source.replace(trimmed, translated);
        if (textNode.nodeValue !== nextValue) textNode.nodeValue = nextValue;
      } else if (trimmed.length > 2 && !/^\d+[\,\d]*$/.test(trimmed) && !/^[#\-+°×→←↑↓]*$/.test(trimmed)) {
        untranslated.push(trimmed);
      }
    }

    // Also translate placeholders and titles
    if (langCode !== "pt") {
      document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach((el) => {
        const htmlEl = el as HTMLInputElement;
        const ph = htmlEl.placeholder;
        if (!ph) return;
        const tr = lookup(ph, langCode, dictionary);
        if (tr) htmlEl.placeholder = tr;
      });
      document.querySelectorAll("[title]").forEach((el) => {
        const htmlEl = el as HTMLElement;
        const t = htmlEl.getAttribute("title");
        if (!t) return;
        const tr = lookup(t, langCode, dictionary);
        if (tr) htmlEl.setAttribute("title", tr);
      });
    }

    // Debounced API fallback
    if (untranslated.length > 0 && langCode !== "pt") {
      queueApiTranslation(untranslated, langCode);
    }
  } finally {
    isTranslating = false;
  }
}

function queueApiTranslation(texts: string[], langCode: string) {
  if (apiDebounceTimer) clearTimeout(apiDebounceTimer);
  apiDebounceTimer = setTimeout(async () => {
    const unique = [...new Set(texts)].slice(0, 30);
    const toFetch = unique.filter((t) => !apiCache.has(t) && !apiCache.has(stripAccents(t)));
    if (toFetch.length === 0) return;
    try {
      const langMap: Record<string, string> = { en: "en", es: "es", fr: "fr", de: "de", ru: "ru" };
      const targetLang = langMap[langCode] || "en";
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texts: toFetch, targetLang }),
      });
      if (!res.ok) return;
      const data = await res.json();
      const translations: Record<string, string> = data.translations || {};
      for (const [key, val] of Object.entries(translations)) {
        if (val && val !== key) {
          apiCache.set(key, val);
          const norm = stripAccents(key);
          if (norm !== key) apiCache.set(norm, val);
        }
      }
      // Re-translate with new cache entries
      if (Object.keys(translations).length > 0) {
        translatePage(langCode);
      }
    } catch {
      // Silently fail - dictionary covers most strings
    }
  }, 400);
}

function setLanguage(code: string) {
  currentLang = code;
  localStorage.setItem("dayr-language", code);
  // Reset all text nodes to original before translating
  if (code === "pt") {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const textNode = node as Text;
      const orig = originalText.get(textNode);
      if (orig !== undefined && textNode.nodeValue !== orig) textNode.nodeValue = orig;
    }
    document.documentElement.lang = "pt-BR";
    if (observer) { observer.disconnect(); observer = null; }
    apiCache.clear();
    // Reset placeholders
    document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach((el) => {
      const htmlEl = el as HTMLInputElement;
      const key = htmlEl.getAttribute("data-original-placeholder");
      if (key) htmlEl.placeholder = key;
    });
    return;
  }

  translatePage(code);

  if (!observer) {
    let observerDebounce: ReturnType<typeof setTimeout> | null = null;
    observer = new MutationObserver(() => {
      if (observerDebounce) clearTimeout(observerDebounce);
      observerDebounce = setTimeout(() => translatePage(currentLang), 150);
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
}
"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { Globe, X } from "lucide-react";

const LANGUAGES = [
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
];

// ===================== DICTIONARIES =====================
const EN: Record<string, string> = {
  "1 hora": "1 hour", "12 horas": "12 hours", "24 horas": "24 hours", "48 horas": "48 hours", "6 horas": "6 hours",
  "Abobora": "Pumpkin", "Acido Sulfurico": "Sulfuric Acid", "Aco": "Steel", "Aco ($)": "Steel ($)",
  "Acucar": "Sugar", "Admin": "Admin", "Agua Enlatada": "Canned Water",
  "Agua Limpa": "Clean Water", "Agua Toxica": "Toxic Water", "Agua Vitae": "Aqua Vitae",
  "Agulha Artesanal": "Handmade Needle", "Agulha Enferrujada": "Rusty Needle",
  "Agulha Resistente": "Reinforced Needle", "Agulha de Aco": "Steel Needle",
  "Agulha de Costura": "Sewing Needle", "Alcool": "Alcohol", "Alcool Diluido": "Diluted Alcohol",
  "Alta": "High", "Aluminio": "Aluminum", "Amanita": "Amanita", "Amora": "Blackberry",
  "Analgésico": "Painkiller", "Antibioticos": "Antibiotics", "Antirad": "Antirad",
  "Armas": "Weapons", "Arroz Cozido": "Cooked Rice", "Atendimento": "Support",
  "Ativo": "Active", "Backup": "Backup", "Baixa": "Low",
  "Bala de Chumbo": "Lead Bullet", "Balsamo Curativo": "Healing Balm", "Banco (100%)": "Bank (100%)",
  "Bandagem Esteril": "Sterile Bandage", "Barra de Chocolate": "Chocolate Bar", "Barril": "Barrel",
  "Batata": "Potato", "Batata Frita": "French Fries", "Bateria de Carro": "Car Battery",
  "Bengala Doce": "Candy Cane", "Bioenergetico": "Bio-Energy Drink", "Biotonico": "Biotonic",
  "Biscoitos Duros": "Hardtack", "Blackjack": "Blackjack", "Blini": "Blini", "Bolo": "Cake",
  "Buscar item no estoque...": "Search stock items...", "Buscar...": "Search...",
  "Cafe": "Coffee", "Cafe Frio": "Iced Coffee", "Cafe Quente": "Hot Coffee",
  "Caixa do Banco": "Bank Cash", "Caldo Rico": "Rich Broth", "Caldo Simples": "Simple Broth",
  "Caldo Sustancioso": "Hearty Broth", "Canais": "Channels", "Cancelar": "Cancel",
  "Cancelar leilão": "Cancel auction", "Cano de Ferro": "Iron Pipe",
  "Cantarela": "Chanterelle", "Cantarela Assada": "Roasted Chanterelle",
  "Carne Enlatada": "Canned Meat", "Carne Moida": "Minced Meat",
  "Carregando chat...": "Loading chat...", "Carregando dados do banco...": "Loading bank data...",
  "Carvao Ativado": "Activated Charcoal", "Carvao Preto": "Black Charcoal",
  "Categoria": "Category", "Caviar": "Caviar", "Cera": "Wax",
  "Cha": "Tea", "Cha Frio": "Iced Tea", "Cha Quente": "Hot Tea",
  "Champanhe": "Champagne", "Chapa de Metal": "Metal Plate",
  "Chat - Posto de Trocas": "Chat - Trading Post", "Chocolate": "Chocolate",
  "Cigarros": "Cigarettes", "Cimento": "Cement", "Clorcistamina": "Chlorcystamine",
  "Clãs": "Clans", "Cobre": "Copper", "Cogumelo Radioativo": "Radioactive Mushroom",
  "Cogumelo com Olhos": "Eyed Mushroom", "Cola de Osso": "Bone Glue",
  "Comida, Bebidas e Ingredientes": "Food, Drinks & Ingredients",
  "Compra": "Purchase", "Comprador": "Buyer", "Comprar": "Buy",
  "Comum": "Common", "Comércio": "Trade", "Config Trocas": "Trade Settings",
  "Confirmar pagamento?": "Confirm payment?", "Continuar em Português": "Continue in Portuguese",
  "Corda": "Rope", "Couro Cru": "Raw Leather", "Couro Curtido": "Tanned Leather",
  "Criar": "Create", "Criar Leilão": "Create Auction", "Criar Sorteio": "Create Raffle",
  "Dar Lance": "Place Bid", "Data": "Date", "Data de Entrada": "Entry Date",
  "Deletar mensagem?": "Delete message?", "Deletar sala": "Delete room",
  "Demanda": "Demand", "Descrição": "Description", "Digite a senha de admin!": "Enter the admin password!",
  "Digite a senha de administrador para acessar o modo Admin.": "Enter the administrator password to access Admin mode.",
  "Digite seu nome para entrar no chat.": "Enter your name to join the chat.",
  "Doador": "Donor", "Doadores": "Donors", "Doação": "Donation",
  "Doação registrada!": "Donation registered!", "Duração": "Duration",
  "Duração do Sorteio": "Raffle Duration", "ENCERRADO": "ENDED", "ENTRADA": "IN",
  "Editar Item": "Edit Item", "Eletrodos": "Electrodes", "Emprestimo": "Loan",
  "Empréstimo excluído!": "Loan deleted!", "Empréstimo registrado!": "Loan registered!",
  "Empréstimos": "Loans", "Encerrado": "Ended", "Energético": "Energy Drink",
  "Entrada": "Entry", "Enviando...": "Sending...", "Enxofre": "Sulfur",
  "Erro ao reportar. Tente novamente.": "Error reporting. Try again.",
  "Estoque Atual": "Current Stock", "Estoque do Banco": "Bank Stock",
  "Estoque vazio.": "Empty stock.", "Eventos Ativos": "Active Events",
  "Excluir": "Delete", "Excluir empréstimo?": "Delete loan?",
  "Excluir leilão?": "Delete auction?", "Excluir troca?": "Delete trade?",
  "Faca de Aco": "Steel Knife", "Faca de Cozinha": "Kitchen Knife",
  "Faca de Pedra": "Stone Knife", "Farinha": "Flour", "Feijao Enlatado": "Canned Beans",
  "Ferramentas": "Tools", "Ferro": "Iron", "Finalizado": "Finished",
  "Fio": "Wire", "Fita Isolante": "Insulating Tape",
  "Fonte dos Dados": "Data Source", "Fosforos": "Matches",
  "Ganhador": "Winner", "Geleia": "Jam", "Geral": "General",
  "Gerando...": "Generating...", "Gerenciar Itens": "Manage Items",
  "Gordura": "Fat", "Graos de Arroz": "Rice Grains", "Graveto": "Twig",
  "Guia da Tabela de Precos": "Price Table Guide", "Guias": "Guides",
  "Guloseimas": "Sweets", "Historico": "History", "Histórico de Sorteios": "Raffle History",
  "Hoje": "Today", "Imagem do Item": "Item Image",
  "Incomum": "Uncommon", "Iniciar sorteio agora?": "Start the raffle now?",
  "Investidor": "Investor", "Investidor registrado!": "Investor registered!",
  "Investidores": "Investors", "Isqueiro": "Lighter", "Item": "Item",
  "Item Dado": "Item Given", "Item Pagamento (opcional)": "Payment Item (optional)",
  "Item Recebido": "Item Received", "Item do Leilão": "Auction Item",
  "Item do Prêmio": "Prize Item", "Já cobrado": "Already collected",
  "Kit de Ferramentas": "Tool Kit", "Kit de Primeiros Socorros": "First Aid Kit",
  "Kit de Quimica": "Chemistry Kit", "Lance": "Bid", "Lance Mínimo": "Minimum Bid",
  "Lance registrado!": "Bid placed!", "Lances": "Bids",
  "Legumes": "Vegetables", "Leilão criado com sucesso!": "Auction created successfully!",
  "Leilão finalizado!": "Auction finished!", "Leilões": "Auctions",
  "Leite": "Milk", "Leite Condensado": "Condensed Milk",
  "Lendario": "Legendary", "Lenha": "Firewood", "Linfa": "Lymph",
  "Linhas": "Threads", "Login Admin": "Admin Login", "Lotérica": "Lottery",
  "Maca": "Apple", "Machado de Aco": "Steel Axe",
  "Maior lance": "Highest bid", "Manual": "Manual",
  "Marcar como Pago": "Mark as Paid", "Massa": "Pasta",
  "Massa Cozida": "Cooked Pasta", "Materiais e Componentes": "Materials & Components",
  "Media": "Medium", "Medicamentos e Quimicos": "Medicines & Chemicals",
  "Mel": "Honey", "Membro": "Member", "Milho": "Corn", "Milho Cozido": "Cooked Corn",
  "Moeda principal. Mais valiosa e amplamente aceita.": "Main currency. Most valuable and widely accepted.",
  "Moeda secundaria. 1 Aco = 2 Cimentos.": "Secondary currency. 1 Steel = 2 Cements.",
  "Moedas do Jogo": "Game Currencies", "Monstro Espaguete Voador": "Flying Spaghetti Monster",
  "Morango": "Strawberry", "Movimentos do Caixa": "Cash Movements",
  "Municao de Pistola": "Pistol Ammo", "Municao de Revolver": "Revolver Ammo",
  "Municao de Rifle": "Rifle Ammo", "Municoes e Explosivos": "Ammo & Explosives",
  "Musgo": "Moss", "Nenhum doador cadastrado.": "No donors registered.",
  "Nenhum investidor cadastrado.": "No investors registered.",
  "Nenhum item encontrado.": "No items found.",
  "Nenhum lance ainda.": "No bids yet.",
  "Nenhum leilão ativo no momento.": "No active auctions at the moment.",
  "Nenhum participante ainda.": "No participants yet.",
  "Nenhum registro ainda.": "No records yet.",
  "Nenhum registro.": "No records.",
  "Nenhum sorteio ativo.": "No active raffles.",
  "Nenhum sorteio finalizado.": "No finished raffles.",
  "Nenhuma mensagem ainda. Seja o primeiro a conversar!": "No messages yet. Be the first to chat!",
  "Nenhuma sala criada.": "No rooms created.",
  "Nenhuma troca registrada.": "No trades registered.",
  "Nome": "Name", "Nome da sala": "Room name",
  "Nome do Doador": "Donor Name", "Nome do Investidor": "Investor Name",
  "Nome do Item": "Item Name", "Nome do Jogador": "Player Name",
  "Notas": "Notes", "Nova Troca": "New Trade", "Novo Empréstimo": "New Loan",
  "Novo Investidor": "New Investor", "Novo Leilão": "New Auction", "Novo Sorteio": "New Raffle",
  "Número Sorteado": "Drawn Number", "Oleo de Maquina": "Machine Oil",
  "Ontem": "Yesterday", "Operação registrada!": "Operation registered!",
  "Origem": "Origin", "Ossos Frescos": "Fresh Bones",
  "Ovo": "Egg", "Ovo Cozido": "Boiled Egg", "PAGO COM": "PAID WITH",
  "Pagamento registrado!": "Payment registered!", "Pagar": "Pay",
  "Pago": "Paid", "Panela": "Pan", "Panela de Aço": "Steel Pan",
  "Pao": "Bread", "Participantes": "Participants",
  "Participar": "Participate", "Participação registrada!": "Participation registered!",
  "Pecas de Pistola": "Pistol Parts", "Pecas de Revolver": "Revolver Parts",
  "Pecas de Rifle": "Rifle Parts", "Pederneira": "Flint",
  "Peixe Fresco": "Fresh Fish", "Peixe Frito": "Fried Fish",
  "Pele Crua": "Raw Hide", "Pendente": "Pending",
  "Pepsi": "Pepsi", "Pilaf": "Pilaf", "Pneus": "Tires",
  "Polvora": "Gunpowder", "Porco Enlatado": "Canned Pork",
  "Posto de Trocas": "Trading Post",
  "Posto de Trocas - Sobreviventes": "Trading Post - Survivors",
  "Preco": "Price", "Preco Aco": "Steel Price", "Preco Cimento": "Cement Price",
  "Preencha os campos obrigatórios!": "Fill required fields!",
  "Preencha os obrigatórios.": "Fill required fields.",
  "Preencha todos os campos e selecione um item!": "Fill all fields and select an item!",
  "Prego": "Nail", "Prêmio": "Prize", "Pure de Batatas": "Mashed Potatoes",
  "Qtd Aco": "Steel Qty", "Qtd Cimento": "Cement Qty",
  "Qtd Pagamento": "Payment Qty", "Quantidade": "Quantity",
  "Queijo": "Cheese", "Quitina": "Chitin", "RECEBIDO EM": "RECEIVED IN",
  "Raridade": "Rarity", "Raro": "Rare", "Recebedor": "Receiver",
  "Recolher": "Collapse", "Registrar": "Register",
  "Registrar Doação": "Register Donation", "Registrar Empréstimo": "Register Loan",
  "Registrar Investidor": "Register Investor", "Registrar Prêmio": "Register Prize",
  "Registrar Saída": "Register Exit", "Registrar Troca": "Register Trade",
  "Registre itens que saíram do estoque para leilões do banco.": "Register items that left stock for bank auctions.",
  "Registre o prêmio que saiu do estoque quando um sorteio for finalizado.": "Register the prize that left stock when a raffle ends.",
  "Registro Manual": "Manual Register", "Registro adicionado!": "Record added!",
  "Regras:": "Rules:", "Remo": "Oar", "Remover Sorteio?": "Remove Raffle?",
  "Reportar": "Report", "Reportar Preco": "Report Price",
  "Resetar": "Reset", "Resultado do Sorteio": "Raffle Result",
  "Risole": "Risole", "SAÍDA": "OUT", "Sabao": "Soap", "Sal": "Salt",
  "Sala": "Room", "Sala Privada": "Private Room",
  "Salada Olivier": "Olivier Salad", "Salas Privadas": "Private Rooms",
  "Salitre": "Saltpeter", "Salsicha": "Sausage", "Salvar": "Save",
  "Saída": "Exit", "Saída por Leilão do Banco (100%)": "Bank Auction Exit (100%)",
  "Saída por Sorteio (Prêmio)": "Raffle Exit (Prize)",
  "Selecione seu idioma": "Select your language",
  "Senha (opcional)": "Password (optional)", "Senha da sala": "Room password",
  "Senha de admin": "Admin password", "Senha incorreta!": "Incorrect password!",
  "Seu Apelido no Jogo": "Your In-game Nickname", "Seu nome no jogo": "Your in-game name",
  "Sistema de gestao para sobreviventes": "Management system for survivors",
  "Sortear": "Draw", "Sorteio criado!": "Raffle created!",
  "Sorteio realizado!": "Raffle completed!", "Sorteios": "Raffles",
  "Sorvete": "Ice Cream", "Status": "Status",
  "Sucata de Aluminio": "Aluminum Scrap", "Sucata de Cobre": "Copper Scrap",
  "Sucata de Metal": "Metal Scrap", "Sushi": "Sushi",
  "Tabua": "Plank", "Tangerina": "Tangerine", "Taxa": "Fee",
  "Taxa do Leilão": "Auction Fee", "Tecido": "Fabric", "Tendencia": "Trend",
  "Termite": "Thermite", "Tijolo": "Brick", "Tipo": "Type",
  "Tipo de Membro": "Member Type", "Tipo de Origem": "Origin Type",
  "Todos": "All", "Torta": "Pie", "Traduzir o Site": "Translate Site",
  "Traduzir para": "Translate to", "Trapos": "Rags", "Trigo": "Wheat",
  "Troca registrada!": "Trade registered!", "Trocas": "Trades", "Tronco": "Log",
  "URL da imagem": "Image URL",
  "Um território onde todos os sobreviventes são bem-vindos.": "A territory where all survivors are welcome.",
  "Usque": "Whiskey", "Valor": "Value", "Valor Aco ($)": "Steel Value ($)",
  "Valor Cimento": "Cement Value", "Valor do Empréstimo": "Loan Amount",
  "Venda": "Sale", "Vendedor": "Seller", "Veneno": "Poison",
  "Ver Participantes": "View Participants", "Verificando...": "Verifying...",
  "Vinho Tinto": "Red Wine", "Vinho de Arroz": "Rice Wine",
  "Vodka": "Vodka", "Voltar": "Back",
  "desde": "since", "itens": "items", "leilao_banco": "bank_auction",
  "negativos": "negative", "por": "by", "positivos": "positive",
  "registros": "records", "sorteio": "raffle", "Água Suja": "Dirty Water",
  // Extra UI entries
  "Dashboard": "Dashboard", "Chat": "Chat", "Tabela": "Price Table",
  "Estoque & Caixa": "Stock & Cash", "Compras & Vendas": "Purchases & Sales",
  "Empréstimos Pendentes": "Pending Loans", "Empréstimos Pagos": "Paid Loans",
  "Investidores Ativos": "Active Investors", "Trocas Realizadas": "Completed Trades",
  "Registros no Caixa": "Cash Records", "Leilões Ativos": "Active Auctions",
  "Sorteios Ativos": "Active Raffles", "Top 10 Doadores": "Top 10 Donors",
  "Top 10 Investidores": "Top 10 Investors", "Top 10 Contribuintes": "Top 10 Contributors",
  "Nenhum contribuinte ainda. Contribua reportando precos na aba Tabela!": "No contributors yet. Report prices on the Price Table tab!",
  "Preencha nome, ID e categoria!": "Fill name, ID and category!",
  "Erro ao adicionar item.": "Error adding item.", "Erro de conexão.": "Connection error.",
  "Buscar item para editar ou remover...": "Search item to edit or remove...",
  "Restaurar": "Restore", "Item restaurado.": "Item restored.",
  "Erro ao remover.": "Error removing.",
  "Fonte: dayr.wiki.gg + comunidade": "Source: dayr.wiki.gg + community",
  "Reports": "Reports", "Sem Preco": "No Price", "Tendencias": "Trends",
  "Gerenciar Itens": "Manage Items", "Guia": "Guide",
  "Abrir": "Open", "Fechar": "Close", "Icone": "Icon",
  "Dem.": "Dem.", "Rep.": "Rep.",
  "Ultimos Reports da Comunidade": "Latest Community Reports",
  "Nenhum report ainda. Seja o primeiro a reportar precos!": "No reports yet. Be the first to report prices!",
  "reportou": "reported", "Preco pendente": "Price pending",
  // Chat rules
  "Respeite todos os participantes": "Respect all participants",
  "Sem spam ou flood": "No spam or flood",
  "Rivalidades ficam no jogo": "Rivalries stay in-game",
  "Pedir/Oferecer ajuda": "Ask/Offer help", "Compartilhar dicas": "Share tips",
  "Seja claro no problema": "Be clear about the problem",
  "Aguarde atendimento": "Wait for assistance",
  "Admin responde com discrição": "Admin responds discreetly",
  "Não use pra conversas gerais": "Don\'t use for general chat",
  "Conteúdo relacionado ao jogo": "Game-related content",
  "Informe a versão do guia": "State the guide version",
  "Evite informações sem confirmação": "Avoid unconfirmed info",
  "Não repita conteúdos": "Don\'t repeat content",
  "Respeite o trabalho dos autores": "Respect authors\' work",
  "Proibido atacar outros clãs": "Attacking other clans is forbidden",
  "Sem rivalidades no chat": "No rivalries in chat",
  "Divulgue sem spam": "Promote without spam",
  "Jogadores sem clã são bem-vindos": "Clanless players are welcome",
  "Faça parcerias": "Make partnerships",
  "Seja claro nas ofertas": "Be clear in your offers",
  "Respeite os acordos": "Respect agreements",
  "Sem spam de anúncios": "No ad spam",
  "Negocie com honestidade": "Negotiate honestly",
  "Trocas são por conta dos participantes": "Trades are at participants\' own risk",
  // DB description patterns
  "Emprestimo para": "Loan for", "Pagamento de empréstimo -": "Loan payment -",
  "Doação de": "Donation from", "Compra de": "Purchase from",
  "Venda para": "Sale to", "Pagamento compra -": "Purchase payment -",
  "Recebimento venda -": "Sale receipt -",
  "Leilão do banco:": "Bank auction:", "Taxa casa leilão:": "Auction house fee:",
  "vencedor:": "winner:", "ganhador:": "winner:",
  "Troca interna banco: saiu": "Internal bank trade: out",
  "Troca interna banco: entrou": "Internal bank trade: in",
  "Estorno troca interna: devolveu/removeu": "Internal trade reversal: returned/removed",
  "Estorno troca de/para": "Trade reversal for/with",
  "devolveu/recuperou": "returned/recovered",
  "Sorteio:": "Raffle:", "Número sorteado:": "Number drawn:",
  "Ninguém acertou! Prêmio de": "Nobody guessed! Prize of",
  "Ganhador:": "Winner:", "Prêmio:": "Prize:",
  "contribuicoes": "contributions",
  // Misc
  "Imagem não carregou": "Image failed to load",
  "Clique para expandir": "Click to expand",
  "Carregando imagem...": "Loading image...",
  "Entrar como Admin (requer senha)": "Login as Admin (password required)",
  "Clique para sair do modo Admin": "Click to exit Admin mode",
  "Baixar backup completo do banco": "Download full bank backup",
  "Entre no modo Admin para baixar o backup.": "Enter Admin mode to download the backup.",
  "Não foi possível gerar o backup.": "Unable to generate backup.",
  "Backup baixado com sucesso!": "Backup downloaded successfully!",
  "Erro ao baixar o backup.": "Error downloading backup.",
  "Erro ao verificar senha.": "Error verifying password.",
  "Entrar": "Enter",
  "Mensagem em": "Message in",
  "item": "item", "itens": "items",
  "Nenhuma operação registrada.": "No operations registered.",
  "Nenhum número disponível.": "No numbers available.",
  "Nenhum sorteio realizado.": "No draws yet.",
  "requer senha.": "requires a password.",
  "Nome da sala é obrigatório.": "Room name is required.",
  "Digite um nome.": "Enter a name.",
  "Preencha o item e a quantidade.": "Fill in the item and quantity.",
  "Preencha o item, quantidade e ganhador.": "Fill in the item, quantity and winner.",
  "Sorteio finalizado!": "Raffle finished!",
  "Selecionar...": "Select...",
  "Escolher imagem": "Choose image",
  "Salvando...": "Saving...",
  "Wiki Link": "Wiki Link",
  "Ver no Wiki:": "View on Wiki:",
  "sem preco": "no price",
  "Preco pendente - reporte para ajudar!": "Price pending - report to help!",
  // Long descriptions for chat channels
  "Bem-vindo ao Chat Geral. Espaço para todos conversarem, fazerem amizades, compartilharem experiências e trocarem conhecimentos sobre Day R Survival. Trate todos com respeito.": "Welcome to General Chat. A space for everyone to chat, make friends, share experiences and exchange knowledge about Day R Survival. Treat everyone with respect.",
  "Espaço para contato direto com a administração. Tire dúvidas, solicite ajuda, reporte problemas, denuncie comportamentos ou envie sugestões.": "Space for direct contact with administration. Ask questions, request help, report problems, report behavior or send suggestions.",
  "Espaço para compartilhar guias, dicas de sobrevivência, estratégias de combate, rotas de exploração e tutoriais sobre Day R Survival.": "Space to share guides, survival tips, combat strategies, exploration routes and tutorials about Day R Survival.",
  "Espaço para clãs se apresentarem, divulgarem recrutamentos, fazerem parcerias e compartilharem eventos. Respeito entre todos.": "Space for clans to introduce themselves, share recruitment, make partnerships and share events. Respect everyone.",
  "Espaço para comprar, vender ou trocar itens. Anuncie ofertas, procure recursos específicos e negocie com educação.": "Space to buy, sell or trade items. Post offers, look for specific resources and negotiate politely.",
  "Sopa de Abobora": "Pumpkin Soup", "Sopa de Cogumelos": "Mushroom Soup",
  "Semente de Morango": "Strawberry Seeds", "Sementes de Abobora": "Pumpkin Seeds",
  "Sementes de Batata": "Potato Seeds", "Sementes de Legumes": "Vegetable Seeds",
  "Sementes de Maca": "Apple Seeds", "Sementes de Milho": "Corn Seeds",
  "Sementes de Tangerina": "Tangerine Seeds", "Sementes de Trigo": "Wheat Seeds",
  "Sementes, Ervas e Cogumelos": "Seeds, Herbs & Mushrooms",
  "Toucinho Cru": "Raw Bacon", "Toucinho Defumado": "Smoked Bacon",
  "Pao de Arroz": "Rice Bread", "Panquecas de Batata": "Potato Pancakes",
  "Vendas encerradas": "Sales closed",
  "Você já está participando!": "You are already participating!",
  "Número comprado com sucesso!": "Number purchased successfully!",
  "Lotérica criada!": "Lottery created!",
  "Não há lances neste leilão.": "No bids on this auction.",
  "Banco resetado com sucesso!": "Bank reset successfully!",
  "Leilão removido!": "Auction removed!",
  "Pa de Aco": "Steel Shovel", "Pa Enferrujada": "Rusty Shovel",
  "Pe de Cabra Enferrujado": "Rusty Crowbar",
  "Pé de Cabra de Aço": "Steel Crowbar",
  "Coelho de Chocolate": "Chocolate Bunny",
  "Macarrao com Cogumelos": "Pasta with Mushrooms",
  "Massa com Carne Moida": "Pasta with Minced Meat",
  "Cerveja": "Beer",
  "Munição de Fuzil de Assalto": "Assault Rifle Ammo",
  "Cartucho de Fuzil de Assalto": "Assault Rifle Cartridge",
  "Cartucho de Pistola": "Pistol Cartridge",
  "Cartucho de Revolver": "Revolver Cartridge",
  "Cartucho de Escopeta": "Shotgun Cartridge",
  "Cartucho Artesanal": "Handmade Cartridge",
  "Cartucho em Branco": "Blank Cartridge",
  "Cartucho 7.62x25mm TT": "7.62x25mm TT Cartridge",
  "Bala de Chumbo": "Lead Bullet",
  "Virote de Besta": "Crossbow Bolt",
  "Virote de Besta (Venenoso)": "Poisoned Crossbow Bolt",
  "Pocao Desintoxicante": "Detox Potion",
  "Pocao Energizante": "Energy Potion",
  "Estimulante Eurekognasol": "Eurekognasol Stimulant",
  "Metocaina": "Metocaine",
  "Chlorcystamine": "Chlorcystamine",
  "Lidiacide-34": "Lidiacide-34",
  "IR-190": "IR-190",
  "Bye-Bye Rad": "Bye-Bye Rad",
  "Filtro de Mascara de Gas": "Gas Mask Filter",
  "Explosivos Plasticos": "Plastic Explosives",
  "Pecas Sobressalentes de Arma": "Gun Spare Parts",
  "Pecas de Metralhadora": "Machine Gun Parts",
  "Pecas de Fuzil de Assalto": "Assault Rifle Parts",
  "Pecas Sobressalentes de Moto": "Motorcycle Spare Parts",
  "Motor de Motosserra": "Chainsaw Motor",
  "Pneus": "Tires",
  "Tabua": "Plank",
  "Trapos": "Rags",
  "Rei dos Coringas": "King of Jokers",
  "Peso Russo": "Russian Weight",
  "Machado Enferrujado": "Rusty Axe",
  "Serra Enferrujada": "Rusty Saw",
  "Couro Fervido": "Boiled Leather",
  "Couro Grosso": "Thick Leather",
  "Couro de Qualidade": "Quality Leather",
  "Pele Grossa": "Thick Hide",
  "Pele de Qualidade": "Quality Hide",
  "Pelmeni": "Pelmeni",
  "Kholodets": "Kholodets",
  "Shchi": "Shchi",
  "Ukha": "Ukha",
  "Blini": "Blini",
  "Coulibiac": "Coulibiac",
  "Pilaf": "Pilaf",
  "Risole": "Risole",
  "Risole de Carne": "Meat Risole",
  "Rolinho de Repolho": "Cabbage Roll",
  "Salada Olivier": "Olivier Salad",
  "Pato Laqueado": "Lacquered Duck",
  "Sanduiche de Caviar": "Caviar Sandwich",
  "Churrasco Espetado": "Skewered Barbecue",
  "Churrasco Grego": "Greek Barbecue",
  "Peixe Podre": "Rotten Fish",
  "Peixe Salgado": "Salted Fish",
  "Peixe Seco": "Dried Fish",
  "Carne Podre": "Rotten Meat",
  "Carne Salgada": "Salted Meat",
  "Carne Seca": "Dried Meat",
  "Carne Ensopada": "Stewed Meat",
  "Carne Grelhada": "Grilled Meat",
  "Carne de Cobra": "Snake Meat",
  "Carne de Rato": "Rat Meat",
  "Carne de Mutante": "Mutant Meat",
  "Cobra Frita": "Fried Snake",
  "Carne de Rato Frita": "Fried Rat Meat",
  "Legumes em Conserva": "Canned Vegetables",
  "Legumes Podres": "Rotten Vegetables",
  "Mingau Enlatado": "Canned Porridge",
  "Mingau Podre": "Rotten Porridge",
  "Porco Enlatado": "Canned Pork",
  "Feijao Enlatado": "Canned Beans",
  "Charuto Cubano": "Cuban Cigar",
  "Cigarros Russos": "Russian Cigarettes",
  "Cerveja": "Beer",
  "Vinho Artesanal": "Artisan Wine",
  "Vinho Quente Especiado": "Spiced Hot Wine",
  "Aguardente": "Cachaça",
  "Cordial de Maca": "Apple Cordial",
  "Ponche de Bruxa": "Witch Punch",
  "Conhaque Trofeu": "Trophy Brandy",
  "Energetico Assustador": "Scary Energy Drink",
  "Energetico Falsificado": "Fake Energy Drink",
  "Energético Chinês": "Chinese Energy Drink",
  "Energético Contrabandeado": "Smuggled Energy Drink",
  "Energético de Feriado": "Holiday Energy Drink",
  "Bioenergetico": "Bio-Energy Drink",
  "Suco de Besouro": "Beetle Juice",
  "Bengala Doce": "Candy Cane",
  "Coelho de Chocolate": "Chocolate Bunny",
  "Guloseima de Coelho": "Bunny Sweet",
  "Maca do Amor": "Candy Apple",
  "Torta": "Pie",
  "Bolo de Gengibre": "Gingerbread",
  "Bolo de Morango": "Strawberry Cake",
  "Bolo de Páscoa": "Easter Cake",
  "Ovo de Páscoa": "Easter Egg",
  "Ovo de Páscoa Dourado": "Golden Easter Egg",
  "Ovo de Pascoa Arco-Iris": "Rainbow Easter Egg",
  "Pryanik Velho": "Old Pryanik",
  "Maca do Amor": "Candy Apple",
  "Vela de Ignicao": "Ignition Plug",
  "Canteleira Assada": "Roasted Chanterelle",
  "Glandula Acida": "Acid Gland",
  "Mofo Sangrento": "Blood Mold",
  "Orelha-de-veado": "Stag Ear",
  "Urtiga": "Nettle",
  "Acidoemitter": "Acidemitter",
  "Cesteiro de Bambu": "Bamboo Basket",
  "Espacador": "Spacer",
  "Faca Forjada": "Forged Knife",
  "Faca de Titanio": "Titanium Knife",
  "Machado de Titanio": "Titanium Axe",
  "Pa de Titanio": "Titanium Shovel",
  "Pe de Cabra de Titanio": "Titanium Crowbar",
  "Kvass": "Kvass",
  "Pepsi": "Pepsi",
  "Especiaria": "Spice",
  "Tijolo Refratario": "Refractory Brick",
  "Estearina": "Stearin",
  "Colonia C-3": "Colony C-3",
  "Graos de Trigo-sarraceno": "Buckwheat Grains",
  "Trigo-sarraceno Cozido": "Cooked Buckwheat",
  "Municao de Treinamento": "Training Ammo",
  "Cogumelo Estranho (Amarelo)": "Strange Mushroom (Yellow)",
  "Cogumelo Estranho (Azul Claro)": "Strange Mushroom (Light Blue)",
  "Cogumelo Estranho (Azul)": "Strange Mushroom (Blue)",
  "Cogumelo Estranho (Branco)": "Strange Mushroom (White)",
  "Cogumelo Estranho (Preto)": "Strange Mushroom (Black)",
  "Cogumelo Estranho (Verde)": "Strange Mushroom (Green)",
  "Cogumelo Estranho (Vermelho)": "Strange Mushroom (Red)",
  "Cogumelo Estranho (Violeta)": "Strange Mushroom (Violet)",
  "Foguete Artesanal": "Handmade Rocket",
  "Tacapao de Choque": "Shock Baton",
  "Destilado Caustico": "Caustic Distillate",
  "Frasco de \"...amina\"": "Flask of \"...amine\"",
  "Chapa de Metal": "Metal Plate",
  "Remo": "Oar",
  "Champanhe": "Champagne",
  "Pao Achatado": "Flatbread",
  "Biscoito Duro Infectado": "Infected Hardtack",
  "Carne Contaminada": "Contaminated Meat",
  "Carne Contaminada Frita": "Fried Contaminated Meat",
  "Carne Dura": "Tough Meat",
  "Carne Dura Frita": "Fried Tough Meat",
  "Carne Gordurosa": "Fatty Meat",
  "Carne Gordurosa Frita": "Fried Fatty Meat",
  "Carne Enlatada Velha": "Old Canned Meat",
  "Carne de Mutante Frita": "Fried Mutant Meat",
  "Carne de Rato Frita": "Fried Rat Meat",
  "Peixe Seco Infectado": "Infected Dried Fish",
  "Filtro de Mascara de Gas": "Gas Mask Filter",
  "Bateria de Carro Quebrada": "Broken Car Battery",
  "Mistura de Curtimento": "Tanning Mixture",
  "Acidoemitter": "Acidemitter",
  "Configurações de Trocas": "Trade Configuration",
  "Não Contribuinte": "Non-Contributor",
  "Não autorizado": "Unauthorized",
  "Pausar leilão?": "Pause auction?",
  "Retomar leilão?": "Resume auction?",
  "Lotérica criada!": "Lottery created!",
  "Criar Lotérica": "Create Lottery",
  "Comprar Número": "Buy Number",
  "Ganhador da Lotérica": "Lottery Winner",
  "Iniciar sorteio da lotérica?": "Start the lottery draw?",
  "Preço do Número": "Number Price",
  "Quantidade de Números": "Number Quantity",
  "Números disponíveis": "Available numbers",
  "Seus Números": "Your Numbers",
  "Sortear Número": "Draw Number",
  "Faltam": "Remaining",
  "Não Contribuinte (20%)": "Non-Contributor (20%)",
  "Investidor (10%)": "Investor (10%)",
  "Comum (15%)": "Common (15%)",
  "Especial (0%)": "Special (0%)",
  "Top 10 (5%)": "Top 10 (5%)",
  "Valor com taxa": "Value with fee",
  "Valor a Cobrar": "Amount to Collect",
  "Adicionar Item": "Add Item",
  "Imagem do Item": "Item Image",
  "Pecas de Fuzil de Assalto": "Assault Rifle Parts",
  "Pecas Sobressalentes de Arma": "Gun Spare Parts",
  "Pecas Sobressalentes de Moto": "Motorcycle Spare Parts",
  "Faca de Titanio": "Titanium Knife",
  "Machado de Titanio": "Titanium Axe",
  "Pa de Titanio": "Titanium Shovel",
  "Pe de Cabra de Titanio": "Titanium Crowbar",
};

const ES: Record<string, string> = { ...EN, "Dashboard": "Panel", "Tabela": "Tabla de precios", "Empréstimos": "Préstamos", "Trocas": "Intercambios", "Doadores": "Donantes", "Leilões": "Subastas", "Sorteios": "Sorteos", "Lotérica": "Lotería", "Buscar item...": "Buscar artículo...", "Geral": "General", "Atendimento": "Soporte", "Guias": "Guías", "Comércio": "Comercio", "Investidores": "Inversores", "Emprestimo": "Préstamo", "Novo Empréstimo": "Nuevo Préstamo", "Historico": "Historial", "Pendente": "Pendiente", "Pago": "Pagado" };
const FR: Record<string, string> = { ...EN, "Dashboard": "Tableau de bord", "Tabela": "Table des prix", "Empréstimos": "Prêts", "Trocas": "Échanges", "Doadores": "Donateurs", "Leilões": "Enchères", "Geral": "Général", "Atendimento": "Support", "Guias": "Guides", "Comércio": "Commerce", "Investidores": "Investisseurs", "Emprestimo": "Prêt", "Novo Empréstimo": "Nouveau Prêt", "Historico": "Historique", "Pendente": "En attente", "Pago": "Payé" };
const DE: Record<string, string> = { ...EN, "Dashboard": "Übersicht", "Tabela": "Preistabelle", "Empréstimos": "Kredite", "Trocas": "Tausch", "Doadores": "Spender", "Leilões": "Auktionen", "Geral": "Allgemein", "Atendimento": "Support", "Guias": "Anleitungen", "Comércio": "Handel", "Investidores": "Investoren", "Emprestimo": "Kredit", "Novo Empréstimo": "Neuer Kredit", "Historico": "Verlauf", "Pendente": "Ausstehend", "Pago": "Bezahlt" };
const RU: Record<string, string> = { ...EN, "Dashboard": "Панель", "Tabela": "Таблица цен", "Empréstimos": "Займы", "Trocas": "Обмены", "Doadores": "Дарители", "Leilões": "Аукционы", "Geral": "Основной", "Atendimento": "Поддержка", "Guias": "Руководства", "Comércio": "Торговля", "Investidores": "Инвесторы", "Emprestimo": "Займ", "Novo Empréstimo": "Новый заём", "Historico": "История", "Pendente": "Ожидает", "Pago": "Оплачено" };

const dictionaries: Record<string, Record<string, string>> = { en: EN, es: ES, fr: FR, de: DE, ru: RU };

// ===================== CLIENT-SIDE CACHE =====================
function getClientCache(lang: string): Record<string, string> {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(localStorage.getItem(`tr-cache-${lang}`) || "{}"); } catch { return {}; }
}
function setClientCache(lang: string, cache: Record<string, string>) {
  if (typeof window === "undefined") return;
  try {
    const json = JSON.stringify(cache);
    if (json.length > 200_000) {
      const keys = Object.keys(cache);
      const trimmed: Record<string, string> = {};
      for (let i = Math.floor(keys.length / 2); i < keys.length; i++) trimmed[keys[i]] = cache[keys[i]];
      localStorage.setItem(`tr-cache-${lang}`, JSON.stringify(trimmed));
    } else {
      localStorage.setItem(`tr-cache-${lang}`, json);
    }
  } catch { /* storage full */ }
}

// ===================== TRANSLATION ENGINE =====================
const originalTextMap = new WeakMap<Text, string>();
const originalPlaceholderMap = new WeakMap<HTMLInputElement | HTMLTextAreaElement, string>();
const originalTitleMap = new WeakMap<HTMLElement, string>();
let currentLang = "pt";
let observer: MutationObserver | null = null;
let apiQueue: string[] = [];
let apiTimer: ReturnType<typeof setTimeout> | null = null;
let isApiBusy = false;
let clientCache: Record<string, string> = {};

// Regex to detect pure player names: single word, not in dict, likely a proper noun
// We skip translating text nodes that are just a single word not found in dict/cache
const PLAYER_NAME_SKIP = /^[A-ZÀ-Ú][a-zà-úA-ZÀ-Ú]{1,19}$/;
// Regex to detect text that's mostly numbers/symbols (not translatable)
const NON_TRANSLATABLE = /^[\d\s+\-.,:;!?#@$%^&*()_={}\[\]<>|\\~`'"/]+$/;

/**
 * Try to translate a single string using dictionary + substring matching + client cache.
 */
function translateString(text: string, dict: Record<string, string>): string {
  if (!text || !text.trim()) return text;
  const trimmed = text.trim();

  // Skip non-translatable content
  if (NON_TRANSLATABLE.test(trimmed)) return text;

  // 1. Exact match in dictionary
  if (dict[trimmed]) return dict[trimmed];

  // 2. Exact match in client cache
  if (clientCache[trimmed]) return clientCache[trimmed];

  // 3. PROTECT PLAYER NAMES: single proper-noun-like word not in dict → skip entirely
  if (PLAYER_NAME_SKIP.test(trimmed) && trimmed.length < 25) return text;

  // 4. Substring replacement for known dictionary keys (longest first)
  let result = text;
  const dictKeys = Object.keys(dict).filter(k => k.length > 3 && text.includes(k));
  dictKeys.sort((a, b) => b.length - a.length);
  if (dictKeys.length > 0) {
    const replaced = new Set<string>();
    for (const key of dictKeys) {
      if (replaced.has(key)) continue;
      if (result.includes(key)) {
        result = result.split(key).join(dict[key]);
        replaced.add(key);
      }
    }
  }

  // 5. Substring match in client cache (for API-translated content)
  if (result === text) {
    const cacheKeys = Object.keys(clientCache).filter(k => k.length > 3 && text.includes(k));
    cacheKeys.sort((a, b) => b.length - a.length);
    const replaced = new Set<string>();
    for (const key of cacheKeys) {
      if (replaced.has(key)) continue;
      if (result.includes(key)) {
        result = result.split(key).join(clientCache[key]);
        replaced.add(key);
      }
    }
  }

  return result;
}

/** Translate all text nodes in the DOM */
function translateTextNodes(dict: Record<string, string>) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const nodes: Text[] = [];
  let n: Node | null;
  while ((n = walker.nextNode())) nodes.push(n as Text);

  for (const textNode of nodes) {
    if (!originalTextMap.has(textNode)) {
      originalTextMap.set(textNode, textNode.nodeValue || "");
    }
    const source = originalTextMap.get(textNode) || "";
    const trimmed = source.trim();
    if (!trimmed) continue;
    const translated = translateString(source, dict);
    if (textNode.nodeValue !== translated) textNode.nodeValue = translated;
  }
}

/** Translate placeholder and title attributes */
function translateAttributes(dict: Record<string, string>) {
  document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach(el => {
    const input = el as HTMLInputElement;
    if (!originalPlaceholderMap.has(input)) originalPlaceholderMap.set(input, input.placeholder);
    const original = originalPlaceholderMap.get(input) || "";
    if (!original.trim()) return;
    const translated = translateString(original, dict);
    if (input.placeholder !== translated) input.placeholder = translated;
  });
  document.querySelectorAll("[title]:not([data-tr-button])").forEach(el => {
    const htmlEl = el as HTMLElement;
    const title = htmlEl.getAttribute("title") || "";
    if (!title.trim()) return;
    if (!originalTitleMap.has(htmlEl)) originalTitleMap.set(htmlEl, title);
    const original = originalTitleMap.get(htmlEl) || "";
    const translated = translateString(original, dict);
    if (htmlEl.getAttribute("title") !== translated) htmlEl.setAttribute("title", translated);
  });
}

/** Collect untranslated strings and send to API */
function collectUntranslated(dict: Record<string, string>): string[] {
  const unseen = new Set<string>();
  const seen = new Set<string>();

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  let n: Node | null;
  while ((n = walker.nextNode())) {
    const text = (n as Text).nodeValue || "";
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 5 || seen.has(trimmed)) continue;
    seen.add(trimmed);
    // Skip if already translated by dict or cache
    if (dict[trimmed] || clientCache[trimmed]) continue;
    // Skip player names (single proper noun)
    if (PLAYER_NAME_SKIP.test(trimmed)) continue;
    // Skip non-translatable
    if (NON_TRANSLATABLE.test(trimmed)) continue;
    // Check if substring match already handles it
    const hasMatch = Object.keys(dict).some(k => k.length > 3 && trimmed.includes(k)) ||
                     Object.keys(clientCache).some(k => k.length > 3 && trimmed.includes(k));
    if (!hasMatch) unseen.add(trimmed);
  }
  return Array.from(unseen).slice(0, 20);
}

async function fetchApiTranslation(dict: Record<string, string>) {
  if (currentLang === "pt" || apiQueue.length === 0 || isApiBusy) return;
  isApiBusy = true;
  const batch = apiQueue.splice(0, 20);
  try {
    const resp = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts: batch, targetLang: currentLang }),
    });
    if (resp.ok) {
      const data = await resp.json();
      const translations: string[] = data.translations || [];
      let hasNew = false;
      for (let i = 0; i < batch.length; i++) {
        if (translations[i] && translations[i] !== batch[i]) {
          clientCache[batch[i]] = translations[i];
          hasNew = true;
        }
      }
      if (hasNew) {
        setClientCache(currentLang, clientCache);
        translateTextNodes(dict);
        translateAttributes(dict);
      }
    }
  } catch { /* API unavailable */ }
  isApiBusy = false;
  if (apiQueue.length > 0) apiTimer = setTimeout(() => fetchApiTranslation(dict), 2000);
}

function queueApiTranslation(dict: Record<string, string>) {
  if (currentLang === "pt" || isApiBusy) return;
  const unseen = collectUntranslated(dict);
 if (unseen.length === 0) return;
  const newStrings = unseen.filter(s => !apiQueue.includes(s));
  if (newStrings.length === 0) return;
  apiQueue.push(...newStrings);
  if (apiTimer) clearTimeout(apiTimer);
  apiTimer = setTimeout(() => fetchApiTranslation(dict), 800);
}

function translatePage(langCode: string) {
  const dict = dictionaries[langCode];
  document.documentElement.lang = langCode === "pt" ? "pt-BR" : langCode;

  if (langCode === "pt") {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    let n: Node | null;
    while ((n = walker.nextNode())) nodes.push(n as Text);
    for (const textNode of nodes) {
      if (originalTextMap.has(textNode)) {
        const orig = originalTextMap.get(textNode);
        if (textNode.nodeValue !== orig) textNode.nodeValue = orig || "";
      }
    }
    document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach(el => {
      const input = el as HTMLInputElement;
      if (originalPlaceholderMap.has(input)) {
        const orig = originalPlaceholderMap.get(input);
        if (input.placeholder !== orig) input.placeholder = orig || "";
      }
    });
    document.querySelectorAll("[title]:not([data-tr-button])").forEach(el => {
      const htmlEl = el as HTMLElement;
      if (originalTitleMap.has(htmlEl)) {
        const orig = originalTitleMap.get(htmlEl);
        if (htmlEl.getAttribute("title") !== orig) htmlEl.setAttribute("title", orig || "");
      }
    });
    return;
  }

  translateTextNodes(dict || {});
  translateAttributes(dict || {});
  queueApiTranslation(dict || {});
}

function patchConfirm(dict: Record<string, string>) {
  const originalConfirm = window.confirm.bind(window);
  (window as unknown as Record<string, unknown>).confirm = (message?: string) => {
    if (message && dict) message = translateString(message, dict);
    return originalConfirm(message);
  };
}

function setLanguage(code: string) {
  currentLang = code;
  localStorage.setItem("dayr-language", code);
  clientCache = getClientCache(code);
  const dict = dictionaries[code];
  patchConfirm(dict || {});
  translatePage(code);
  if (!observer) {
    observer = new MutationObserver(() => translatePage(localStorage.getItem("dayr-language") || "pt"));
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
}

/** Returns the locale for date formatting */
export function getDateLocale(): string {
  const lang = typeof window !== "undefined" ? (localStorage.getItem("dayr-language") || "pt") : "pt";
  const map: Record<string, string> = { pt: "pt-BR", en: "en-US", es: "es-ES", fr: "fr-FR", de: "de-DE", ru: "ru-RU" };
  return map[lang] || "pt-BR";
}

// ===================== REACT COMPONENTS =====================
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
  const choose = useCallback((code: string) => {
    setLanguage(code);
    setShowPopup(false);
    localStorage.setItem("translation-popup-dismissed", "1");
  }, []);
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

export function TranslationPopupSmall({ show: _show, onClose: _onClose }: { show: boolean; onClose: () => void }) {
  return <TranslateFloatButton onChoose={setLanguage} />;
}

function TranslateFloatButton({ onChoose }: { onChoose: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false); };
    if (open) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  return <div className="fixed bottom-4 right-4 z-[90]" ref={menuRef}>
    <button onClick={() => setOpen(!open)} className="w-12 h-12 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground shadow-lg flex items-center justify-center border-2 border-primary/50" title="Traduzir site" data-tr-button="1">{open ? <X className="w-5 h-5" /> : <Globe className="w-5 h-5" />}</button>
    {open && <div className="absolute bottom-14 right-0 w-52 rounded-xl border border-primary/30 bg-card shadow-2xl overflow-hidden">
      <div className="px-3 py-2 bg-primary/10 border-b border-border"><p className="text-[10px] font-bold">Traduzir para</p></div>
      <div className="max-h-80 overflow-y-auto py-1">{LANGUAGES.map((lang) => <button key={lang.code} onClick={() => { onChoose(lang.code); setOpen(false); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-primary/10"><span>{lang.flag}</span><span className="text-xs font-medium">{lang.label}</span></button>)}</div>
    </div>}
  </div>;
}