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
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "zh-cn", label: "简体中文", flag: "🇨🇳" },
  { code: "zh-tw", label: "繁體中文", flag: "🇸🇭" },
  { code: "ko", label: "한국어", flag: "🇰🇷" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "id", label: "Indonesia", flag: "🇮🇩" },
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
];

/* ============================================================
   COMPREHENSIVE ENGLISH DICTIONARY (base for all languages)
   ============================================================ */
const EN: Record<string, string> = {
  // ---- Page / Header ----
  "Day R Survival": "Day R Survival",
  "Posto de Trocas": "Trading Post",
  "Posto de Trocas - Sobreviventes": "Trading Post - Survivors",
  "POSTO DE TROCAS": "TRADING POST",
  "Sistema de gestao para sobreviventes": "Management system for survivors",
  "Day R Survival - Posto de Trocas": "Day R Survival - Trading Post",

  // ---- Tabs ----
  "Dashboard": "Dashboard",
  "Chat": "Chat",
  "Tabela": "Price Table",
  "Empréstimos": "Loans",
  "Trocas": "Trades",
  "Doadores": "Donors",
  "Leilões": "Auctions",
  "Sorteios": "Raffles",
  "Lotérica": "Lottery",
  "Investidores": "Investors",
  "Config Trocas": "Trade Settings",
  "Compras & Vendas": "Purchases & Sales",
  "Estoque & Caixa": "Stock & Cash",

  // ---- Common ----
  "Carregando...": "Loading...",
  "Carregando dados do banco...": "Loading bank data...",
  "Carregando chat...": "Loading chat...",
  "Cancelar": "Cancel",
  "Entrar": "Sign in",
  "Salvar": "Save",
  "Fechar": "Close",
  "Criar": "Create",
  "Remover": "Remove",
  "Registrar": "Register",
  "Buscar...": "Search...",
  "Buscar item...": "Search item...",
  "Buscar numero ou comprador...": "Search number or buyer...",
  "Nome": "Name",
  "Item": "Item",
  "Quantidade": "Quantity",
  "Tipo": "Type",
  "Data": "Date",
  "Player": "Player",
  "Todos": "All",
  "Admin": "Admin",
  "Modo visual": "View mode",
  "total": "total",
  "registros": "records",
  "Observação": "Note",
  "Opcional": "Optional",
  "Dono": "Owner",
  "Moeda": "Currency",
  "Ganhador": "Winner",
  "Vencedor": "Winner",
  "Participantes": "Participants",
  "Criado": "Created",
  "Qtd": "Qty",
  "Inicial": "Initial",
  "Maior": "Highest",
  "Lances": "Bids",
  "Taxa": "Fee",
  "Lucro": "Profit",
  "Ação": "Action",
  "Bruto:": "Gross:",
  "Descrição": "Description",
  "Origem": "Source",
  "Item Pagamento": "Payment Item",
  "Item Pagamento (opcional)": "Payment Item (optional)",
  "Qtd Pagamento": "Payment Qty",
  "Disponível": "Available",
  "Disponivel": "Available",

  // ---- Dashboard ----
  "Empréstimos Pendentes": "Pending Loans",
  "Empréstimos Pagos": "Paid Loans",
  "Investidores Ativos": "Active Investors",
  "Trocas Realizadas": "Completed Trades",
  "Registros no Caixa": "Cash Records",
  "Leilões Ativos": "Active Auctions",
  "Sorteios Ativos": "Active Raffles",
  "Top 10 Doadores": "Top 10 Donors",
  "Top 10 Investidores": "Top 10 Investors",
  "Top 10 Contribuintes": "Top Contributors",
  "Estoque do Banco": "Bank Stock",
  "Movimentos do Caixa": "Cash Movements",
  "Eventos Ativos": "Active Events",
  "Nenhum doador cadastrado.": "No donors registered.",
  "Nenhum investidor cadastrado.": "No investors registered.",
  "Nenhum contribuinte ainda. Contribua reportando precos na aba Tabela!": "No contributors yet. Contribute by reporting prices on the Price Table tab!",
  "Nenhum item encontrado.": "No item found.",
  "Estoque vazio.": "Empty stock.",
  "Nenhum registro ainda.": "No records yet.",
  "desde": "since",
  "contribuicoes": "contributions",

  // ---- Chat ----
  "Canais": "Channels",
  "Salas Privadas": "Private Rooms",
  "Geral": "General",
  "Atendimento": "Support",
  "Guias": "Guides",
  "Clãs": "Clans",
  "Comércio": "Trade",
  "Chat - Posto de Trocas": "Chat - Trading Post",
  "Digite seu nome para entrar no chat.": "Enter your name to join the chat.",
  "Seu nome no jogo": "Your in-game name",
  "Nenhuma mensagem ainda. Seja o primeiro a conversar!": "No messages yet. Be the first to chat!",
  "Nenhuma sala criada.": "No rooms created.",
  "Nome da sala": "Room name",
  "Senha (opcional)": "Password (optional)",
  "Senha da sala": "Room password",
  "Sala Privada": "Private Room",
  "requer senha": "requires password",
  "Voltar": "Back",
  "Hoje": "Today",
  "Ontem": "Yesterday",
  "Membro": "Member",
  "Bem-vindo ao Chat Geral. Espaço para todos conversarem, fazerem amizades, compartilharem experiências e trocarem conhecimentos sobre Day R Survival. Trate todos com respeito.": "Welcome to General Chat. A space for everyone to talk, make friends, share experiences and exchange knowledge about Day R Survival. Treat everyone with respect.",
  "Espaço para contato direto com a administração. Tire dúvidas, solicite ajuda, reporte problemas, denuncie comportamentos ou envie sugestões.": "Space for direct contact with administration. Ask questions, request help, report problems, report behavior or send suggestions.",
  "Espaço para compartilhar guias, dicas de sobrevivência, estratégias de combate, rotas de exploração e tutoriais sobre Day R Survival.": "Space to share guides, survival tips, combat strategies, exploration routes and tutorials about Day R Survival.",
  "Espaço para clãs se apresentarem, divulgarem recrutamentos, fazerem parcerias e compartilharem eventos. Respeito entre todos.": "Space for clans to introduce themselves, advertise recruitment, make partnerships and share events. Respect among all.",
  "Espaço para comprar, vender ou trocar itens. Anuncie ofertas, procure recursos específicos e negocie com educação.": "Space to buy, sell or trade items. Advertise offers, look for specific resources and negotiate politely.",
  "Respeite todos os participantes": "Respect all participants",
  "Sem spam ou flood": "No spam or flood",
  "Rivalidades ficam no jogo": "Rivalries stay in the game",
  "Pedir/Oferecer ajuda": "Ask/Offer help",
  "Compartilhar dicas": "Share tips",
  "Seja claro no problema": "Be clear about the problem",
  "Aguarde atendimento": "Wait for assistance",
  "Admin responde com discrição": "Admin responds discreetly",
  "Não use pra conversas gerais": "Don't use for general chat",
  "Conteúdo relacionado ao jogo": "Game-related content",
  "Informe a versão do guia": "State the guide version",
  "Evite informações sem confirmação": "Avoid unconfirmed info",
  "Não repita conteúdos": "Don't repeat content",
  "Respeite o trabalho dos autores": "Respect authors' work",
  "Proibido atacar outros clãs": "Attacking other clans is forbidden",
  "Sem rivalidades no chat": "No rivalries in chat",
  "Divulgue sem spam": "Advertise without spam",
  "Jogadores sem clã são bem-vindos": "Players without clans are welcome",
  "Faça parcerias": "Make partnerships",
  "Seja claro nas ofertas": "Be clear in your offers",
  "Respeite os acordos": "Respect agreements",
  "Sem spam de anúncios": "No ad spam",
  "Negocie com honestidade": "Negotiate honestly",
  "Trocas são por conta dos participantes": "Trades are at participants' own risk",
  "Regras:": "Rules:",
  "por": "by",

  // ---- Doadores ----
  "❤️ Doadores": "❤️ Donors",
  "Registre doações. Toda doação entra no estoque automaticamente.": "Register donations. Every donation goes into stock automatically.",
  "Ranking": "Ranking",
  "Reordenar": "Reorder",
  "Reordenar Doadores": "Reorder Donors",
  "Nova Doação": "New Donation",
  "Registrar Doação": "Register Donation",
  "Histórico": "History",
  "Nenhuma doação.": "No donations.",
  "Nenhuma doação ainda. Seja o primeiro a conversar!": "No donations yet.",

  // ---- Investidores ----
  "💎 Membros Investidores": "💎 Investor Members",
  "Benefício:": "Benefit:",
  "em empréstimos e trocas": "on loans and trades",
  "comum": "common",
  "Como obter a tag?": "How to get the tag?",
  "Ajude o banco — doando itens, fazendo trocas ou de qualquer outra forma.": "Help the bank — by donating items, making trades or any other way.",
  "Adicionar Investidor": "Add Investor",
  "Nome do investidor": "Investor name",
  "Adicionar": "Add",
  "Reordenar Investidores": "Reorder Investors",
  "Desde": "Since",
  "Ativos": "Active",
  "Nenhum investidor.": "No investors.",

  // ---- Trocas ----
  "Registro de Trocas": "Trade Register",
  "Nova Troca": "New Trade",
  "Selecione": "Select",
  "Nenhuma tabela": "No table",
  "Preencha o formulário ao lado.": "Fill the form on the side.",
  "sem taxa": "no fee",
  "Player Recebe:": "Player Receives:",
  "Player entregou:": "Player handed in:",
  "Sai do estoque do Banco:": "Leaves Bank stock:",
  "O item recebido entra no estoque do Banco; não há taxa nem lucro.": "The received item enters Bank stock; no fee or profit.",
  "Entra no estoque do Banco:": "Enters Bank stock:",
  "Entregou": "Handed in",
  "Recebeu / Entrou no estoque": "Received / Entered stock",
  "Especial (0%)": "Special (0%)",
  "Top 10 (5%)": "Top 10 (5%)",
  "Investidor (10%)": "Investor (10%)",
  "Comum (15%)": "Common (15%)",
  "Não Contribuinte (20%)": "Non-Contributor (20%)",
  "Banco (100% — troca interna)": "Bank (100% — internal trade)",
  "Banco (100%)": "Bank (100%)",
  "Item que sai do estoque do Banco": "Item leaving Bank stock",
  "Item que ele entrega": "Item he hands in",
  "Quantidade (em base)": "Quantity (in base)",
  "Registrar Troca": "Register Trade",
  "Calculadora": "Calculator",

  // ---- Compras & Vendas ----
  "🛒 Compras e Vendas": "🛒 Purchases & Sales",
  "COMPRA:": "PURCHASE:",
  "Você paga → Recebe do player": "You pay → Receive from player",
  "VENDA:": "SALE:",
  "Você entrega → Recebe do player": "You hand over → Receive from player",
  "Entra": "Enters",
  "Sai": "Leaves",
  "Paga": "Pays",
  "Recebe": "Receives",
  "Compras": "Purchases",
  "Vendas": "Sales",
  "Nenhuma compra ou venda.": "No purchases or sales.",

  // ---- Caixa ----
  "💰 Caixa do Banco": "💰 Bank Cash",
  "Saída por Leilão do Banco (100%)": "Auction Output (100%)",
  "Registre itens que saíram do estoque para leilões do banco.": "Register items that left stock for bank auctions.",
  "Saída por Sorteio (Prêmio)": "Raffle Output (Prize)",
  "Registre o prêmio que saiu do estoque quando um sorteio for finalizado.": "Register the prize that left stock when a raffle is finalized.",
  "Registro Manual": "Manual Record",
  "ENTRADA": "INCOME",
  "SAÍDA": "EXPENSE",
  "Entrada": "Income",
  "Saída": "Expense",
  "Nome do jogador": "Player name",
  "Registrar Saída": "Register Output",
  "Registrar Prêmio": "Register Prize",
  "Estoque Atual": "Current Stock",
  "BAIXO": "LOW",
  "Resetar": "Reset",
  "Resetar TUDO?": "Reset EVERYTHING?",

  // ---- Leilões ----
  "🔨 Leilões": "🔨 Auctions",
  "Como Funciona": "How It Works",
  "O leilão conta o tempo escolhido (1h a 48h).": "The auction counts the chosen time (1h to 48h).",
  "Qualquer pessoa pode dar lance durante o tempo.": "Anyone can bid during the time.",
  "Após o tempo acabar, cada novo lance adiciona": "After time runs out, each new bid adds",
  "+1 minuto": "+1 minute",
  "de disputa.": "of dispute.",
  "Quando o tempo de disputa acaba, o leilão vai para": "When dispute time runs out, the auction goes to",
  "fila de espera": "waiting queue",
  "O admin finaliza após entregar o item e receber o pagamento.": "Admin finalizes after delivering the item and receiving payment.",
  "Novo Leilão": "New Auction",
  "Criar Leilão": "Create Auction",
  "Item (nome em pt-BR)": "Item (name in pt-BR)",
  "Valor Inicial (total do lote)": "Initial Value (total lot)",
  "Origem / Taxa": "Origin / Fee",
  "Duração": "Duration",
  "Imagem (preenche sozinho pelo nome do item)": "Image (auto-filled by item name)",
  "Auto-preenchido": "Auto-filled",
  "1 minuto (teste)": "1 minute (test)",
  "1 hora": "1 hour",
  "6 horas": "6 hours",
  "12 horas": "12 hours",
  "24 horas": "24 hours",
  "48 horas": "48 hours",
  "Fila de Espera": "Waiting Queue",
  "EM ESPERA": "ON HOLD",
  "Nenhum leilão ativo.": "No active auctions.",
  "Dar Lance": "Place Bid",
  "O tempo de disputa acabou.": "Dispute time has ended.",
  "Seu Nome": "Your Name",
  "Valor (mín:": "Value (min:",
  "Dono:": "Owner:",
  "Disputa final!": "Final dispute!",
  "Finalizar Entrega": "Finalize Delivery",
  "Histórico de Ganhadores": "Winners History",

  // ---- Sorteios ----
  "Admin cria sorteio com": "Admin creates raffle with",
  "item e duracao": "item and duration",
  "Qualquer membro participa com seu nome.": "Any member participates with their name.",
  "Timer acaba": "Timer ends",
  "ganhador": "winner",
  "sorteado": "drawn",
  "Novo Sorteio": "New Raffle",
  "Duracao (min)": "Duration (min)",
  "Nenhum.": "None.",
  "Participar": "Participate",
  "Sortear": "Draw",
  "Seu nome": "Your name",
  "Historico de Ganhadores": "Winners History",
  "Data do Sorteio": "Raffle Date",
  "Todos os Participantes": "All Participants",
  "Nenhum": "None",
  "Encerrado": "Closed",
  "ENCERRADO": "CLOSED",
  "Quantidade:": "Quantity:",

  // ---- Lotérica ----
  "Lotérica Ativa": "Active Lottery",
  "Vendas abertas": "Sales open",
  "Sorteio realizado": "Draw performed",
  "Finalizada": "Finalized",
  "Configurando": "Configuring",
  "Vendidos": "Sold",
  "Disponiveis": "Available",
  "Arrecadado Total": "Total Raised",
  "Premio": "Prize",
  "Min. acumulado": "Min. accumulated",
  "Taxa Banco (20%)": "Bank Fee (20%)",
  "Credita ao finalizar": "Credits on finalization",
  "Calculo do Premio": "Prize Calculation",
  "80% arrecadado": "80% raised",
  "Minimo original": "Original minimum",
  "Min. efetivo": "Effective minimum",
  "Premio = maior entre 80% do arrecadado e o minimo efetivo": "Prize = max of 80% raised and effective minimum",
  "Premio = maior entre 80% do arrecadado e o minimo efetivo (que veio do acumulado).": "Prize = max of 80% raised and effective minimum (from accumulated).",
  "Teve Ganhador!": "We have a Winner!",
  "Ninguem acertou - Premio acumulou!": "Nobody got it right - Prize accumulated!",
  "Ninguem acertou - Premio acumulou": "Nobody got it right - Prize accumulated",
  "Numero": "Number",
  "Ganhador:": "Winner:",
  "Premio:": "Prize:",
  "Nao foi vendido": "Not sold",
  "acumulados": "accumulated",
  "20% das vendas": "20% of sales",
  "creditado no estoque.": "credited to stock.",
  "Finalizar Lotérica": "Finalize Lottery",
  "Vender Numero": "Sell Number",
  "Nome do Comprador": "Buyer Name",
  "Vender": "Sell",
  "Realizar Sorteio": "Perform Draw",
  "As vendas encerraram. Sorteie para definir o ganhador.": "Sales have ended. Draw to determine the winner.",
  "Nenhum numero vendido! Nao e possivel sortear.": "No numbers sold! Cannot draw.",
  "Nenhum numero.": "No numbers.",
  "Nenhuma lotérica ativa. Crie uma nova acima.": "No active lottery. Create a new one above.",
  "Nenhuma lotérica ativa no momento.": "No active lottery at the moment.",
  "Historico de Sorteios": "Draw History",
  "Premio Min.": "Min. Prize",
  "Acumulado Anterior": "Previous Accumulated",
  "acumulado": "accumulated",
  "Nova Lotérica": "New Lottery",
  "Configurar Lotérica": "Configure Lottery",
  "Criar Lotérica": "Create Lottery",
  "Valor/Numero": "Value/Number",
  "Premio Minimo": "Minimum Prize",
  "Duracao Vendas (min)": "Sales Duration (min)",
  "1000 numeros": "1000 numbers",
  "20%": "20%",
  "80%": "80%",
  "preco fixo por numero.": "fixed price per number.",
  "das vendas vai pro banco": "of sales goes to the bank",
  "vai pro premio": "goes to the prize",
  "Premio =": "Prize =",
  "maior entre 80% das vendas e o minimo": "max of 80% of sales and the minimum",
  "Se ninguem acertar, o premio": "If nobody gets it right, the prize",
  "vira o novo minimo": "becomes the new minimum",
  "da proxima.": "of the next one.",
  "So reseta quando sair um": "Only resets when a",
  "comes out!": "comes out!",

  // ---- Empréstimos ----
  "Regras do Banco": "Bank Rules",
  "Membro Especial": "Special Member",
  "Top 10 Investidor": "Top 10 Investor",
  "Investidor": "Investor",
  "Membro Comum": "Common Member",
  "Não Contribuinte": "Non-Contributor",
  "sem acréscimo": "no surcharge",
  "de acréscimo": "surcharge",
  "Calculadora de Empréstimo": "Loan Calculator",
  "Dias de Atraso": "Days Late",
  "Total a Devolver": "Total to Repay",
  "itens": "items",
  "Prazo: 24 horas. Após: +1% de juros por dia.": "Deadline: 24 hours. After: +1% interest per day.",
  "Novo Empréstimo": "New Loan",
  "Pendentes": "Pending",
  "Pagos": "Paid",
  "Nenhum empréstimo pendente.": "No pending loans.",
  "Pendente": "Pending",
  "Pago": "Paid",
  "Atrasado": "Overdue",
  "Pagar": "Pay",
  "Valor a cobrar:": "Amount to charge:",
  "Vencimento:": "Due date:",
  "Registrar Pagamento": "Register Payment",
  "Item do Pagamento": "Payment Item",
  "Confirmar Pagamento": "Confirm Payment",
  "Empréstimo atrasado - Juros já incluídos": "Overdue loan - Interest already included",
  "Item:": "Item:",
  "Top 10 Investidor (5%)": "Top 10 Investor (5%)",

  // ---- Tabela ----
  "Alta": "High",
  "Media": "Medium",
  "Baixa": "Low",
  "Comum": "Common",
  "Incomum": "Uncommon",
  "Raro": "Rare",
  "Lendario": "Legendary",
  "Demanda": "Demand",
  "Raridade": "Rarity",
  "Preço (Aço)": "Price (Steel)",
  "Preço (Cimento)": "Price (Cement)",

  // ---- Admin ----
  "Login Admin": "Admin Login",
  "Digite a senha de administrador para acessar o modo Admin.": "Enter the administrator password to access Admin mode.",
  "Senha de admin": "Admin password",
  "Verificando...": "Verifying...",
  "Backup": "Backup",
  "Gerando...": "Generating...",
  "Modo Admin ativado!": "Admin mode enabled!",
  "Senha incorreta!": "Incorrect password!",
  "Digite a senha de admin!": "Enter the admin password!",
  "Entre no modo Admin para baixar o backup.": "Enter Admin mode to download the backup.",
  "Não foi possível gerar o backup.": "Could not generate backup.",
  "Backup baixado com sucesso!": "Backup downloaded successfully!",
  "Erro ao baixar o backup.": "Error downloading backup.",

  "Erro ao verificar senha.": "Error verifying password.",
  "Baixar backup completo do banco": "Download full database backup",
  "Clique para sair do modo Admin": "Click to exit Admin mode",
  "Entrar como Admin (requer senha)": "Enter as Admin (password required)",

  // ---- Translation Popup ----
  "Traduzir o Site": "Translate Site",
  "Selecione seu idioma": "Select your language",
  "Traduzir para": "Translate to",
  "Continuar em Português": "Continue in Portuguese",

  // ---- Confirm/Toast common ----
  "Deletar mensagem?": "Delete message?",
  "Remover?": "Remove?",
  "Registro adicionado!": "Record added!",
  "Ordem atualizada!": "Order updated!",
  "Lotérica criada!": "Lottery created!",
  "Sorteio criado!": "Raffle created!",
  "Participando!": "Participating!",
  "Preencha os obrigatórios.": "Fill required fields.",
  "Preencha todos os campos.": "Fill all fields.",
  "Preencha nome e valor.": "Fill name and value.",
  "Preencha o item e a quantidade.": "Fill item and quantity.",
  "Preencha todos.": "Fill all.",
  "Preencha valor e moeda.": "Fill value and currency.",
  "Numero e nome obrigatorios.": "Number and name required.",
  "Numero entre 1 e 1000.": "Number between 1 and 1000.",
  "Sem loterica ativa.": "No active lottery.",
  "Ja existe loterica ativa. Finalize a atual.": "There's already an active lottery. Finalize the current one.",
  "Digite seu nome.": "Enter your name.",
  "Digite um nome.": "Enter a name.",
  "Digite o nome do investidor.": "Enter the investor name.",
  "Nome da sala é obrigatório.": "Room name is required.",
  "Preencha nome, item e quantidade.": "Fill name, item and quantity.",
  "Preencha o item, quantidade e ganhador.": "Fill item, quantity and winner.",

  // ---- ChatMessageContent ----
  "Imagem não carregou": "Image failed to load",
  "(abrir)": "(open)",
  "Carregando imagem...": "Loading image...",
  "Imagem compartilhada": "Shared image",
  "Clique para expandir": "Click to expand",
  "- clique para reproduzir": "- click to play",
  "Vídeo do YouTube": "YouTube Video",
  "Abrir no YouTube": "Open on YouTube",

  // ---- ConfigTrocasTab ----
  "Configuração de Tabelas de Troca": "Trade Table Configuration",
  "Nova Regra": "New Rule",
  "Se o player der...": "If the player gives...",
  "Ele recebe...": "They receive...",
  "Base": "Base",
  "Proporção": "Proportion",
  "Resultado": "Result",
  "Ações": "Actions",
  "Nenhuma regra configurada.": "No rules configured.",
  "Como funciona:": "How it works:",
  "As regras são usadas na aba \"Trocas\" para calcular automaticamente. Taxas: 15% comum / 10% investidor.": "Rules are used in the \"Trades\" tab for automatic calculation. Fees: 15% common / 10% investor.",
  "Tabela adicionada!": "Table added!",

  // ---- TabelaTab ----
  "Tabela de Precos": "Price Table",
  "Reportar Precos": "Report Prices",
  "Guia da Tabela de Precos": "Price Table Guide",
  "Gerenciar Itens": "Manage Items",
  "Viu um preco diferente no jogo? Reporte para ajudar a comunidade a manter a tabela atualizada! Seus reports aparecem na Tendencia.": "See a different price in-game? Report it to help the community keep the table updated! Your reports appear in Trends.",
  "Seu Apelido no Jogo": "Your In-Game Nickname",
  "Qtd Aco": "Steel Qty",
  "Valor Aco ($)": "Steel Value ($)",
  "Qtd Cimento": "Cement Qty",
  "Valor Cimento ($)": "Cement Value ($)",
  "Formato:": "Format:",
  "Como funcionam os precos?": "How do prices work?",
  "Moedas do Jogo": "Game Currencies",
  "Moeda principal. Mais valiosa e amplamente aceita.": "Main currency. Most valuable and widely accepted.",
  "Moeda secundaria. 1 Aco = 2 Cimentos.": "Secondary currency. 1 Steel = 2 Cements.",
  "Niveis de Demanda": "Demand Levels",
  "Itens muito procurados, precos estaveis ou em alta.": "Highly sought items, stable or rising prices.",
  "Demanda normal, precos razoaveis.": "Normal demand, reasonable prices.",
  "Pouco procurados, difficeis de vender.": "Sought after, hard to sell.",
  "Tendencia": "Trend",
  "Itens sem preco (?:?)": "Items without price (?:?)",
  "Fonte dos Dados": "Data Source",
  "Preencha todos os campos e selecione um item!": "Fill all fields and select an item!",
  "reportado!": "reported!",
  "Obrigado": "Thank you",
  "Erro ao reportar. Tente novamente.": "Error reporting. Try again.",
  "Enviando...": "Sending...",
  "Reportar": "Report",
  "Preencha nome, ID e categoria!": "Fill name, ID and category!",
  "ja existe!": "already exists!",
  "adicionado! (salvo no banco)": "added! (saved to database)",
  "Erro ao adicionar item.": "Error adding item.",
  "Erro de conexao.": "Connection error.",
  "Imagem enviada. Clique em Salvar para aplicar ao item.": "Image uploaded. Click Save to apply to item.",
  "Erro ao enviar imagem.": "Error uploading image.",
  "Informe o nome do item para gerar o ID antes de enviar a imagem.": "Enter the item name to generate the ID before uploading the image.",
  "Imagem enviada. Ela será salva junto com o novo item.": "Image uploaded. It will be saved with the new item.",
  "atualizado!": "updated!",
  "Erro ao salvar.": "Error saving.",
  "marcado para remocao.": "marked for removal.",
  "Item restaurado.": "Item restored.",
  "itens removidos!": "items removed!",
  "Erro ao remover.": "Error removing.",
  "Removidos": "Removed",
  "Adicione novos itens a tabela. Eles serao salvos no banco de dados como override.": "Add new items to the table. They will be saved to the database as overrides.",
  "Nome do Item *": "Item Name *",
  "Categoria *": "Category *",
  "Selecionar...": "Select...",
  "Imagem do item": "Item image",
  "Wiki Link": "Wiki Link",
  "Preco Aco": "Steel Price",
  "Preco Cimento": "Cement Price",
  "Notas": "Notes",
  "Escolher imagem": "Choose image",
  "Adicionar Item": "Add Item",
  "Editar": "Edit",
  "Restaurar": "Restore",
  "Itens marcados para remocao nesta sessao.": "Items marked for removal in this session.",
  "Nenhum item removido.": "No items removed.",
  "Confirmar Remocao de": "Confirm Removal of",
  "Reports": "Reports",
  "Sem Preco": "No Price",
  "Tendencias": "Trends",
  "Abrir": "Open",
  "Icone": "Icon",
  "Aco ($)": "Steel ($)",
  "Cimento": "Cement",
  "Dem.": "Dem.",
  "Rep.": "Rep.",
  "Preco pendente": "Price pending",
  "(sem preco)": "(no price)",
  "Nenhum report ainda. Seja o primeiro a reportar precos!": "No reports yet. Be the first to report prices!",
  "Ultimos Reports da Comunidade": "Latest Community Reports",
  "Ver no Wiki:": "View on Wiki:",
  "Buscar item para editar ou remover...": "Search item to edit or remove...",
  "reportou": "reported",

  // ---- TrocasTab additional ----
  "Banco": "Bank",
  "Entrou:": "Entered:",
  "Recebeu:": "Received:",
  "Excluir troca e estornar estoque": "Exclude trade and reverse stock",
  "Troca excluída e estoque estornado.": "Trade excluded and stock reversed.",
  "Não foi possível excluir a troca.": "Could not exclude the trade.",

  // ---- EmprestimosTab additional ----

  // ---- DoadoresTab additional ----
  "Doação excluída e estoque estornado.": "Donation deleted and stock reversed.",
  "Não foi possível excluir a doação.": "Could not delete the donation.",

  // ---- InvestidoresTab additional ----
  "Membros Investidores": "Investor Members",

  // ---- CaixaTab additional ----
  "Nenhum registro.": "No records.",

  // ---- LeiloesTab additional ----
  "Preencha os campos obrigatórios.": "Fill required fields.",
  "Moeda:": "Currency:",
  "Valor": "Value",
  "Excluir a troca de": "Exclude trade from",
  "O movimento registrado no estoque será estornado.": "The stock movement will be reversed.",

  // ---- LotericaTab additional ----
  "Numero (1-1000)": "Number (1-1000)",
  "Numero sorteado:": "Drawn number:",
  "Acumulou": "Accumulated",
  "Arrecadado": "Raised",
  "Premio Final": "Final Prize",
  "Data Sorteio": "Draw Date",
  "que veio do acumulado.": "that came from accumulated.",

  // ---- ChatTab additional ----
  "Um território onde todos os sobreviventes são bem-vindos.": "A territory where all survivors are welcome.",
  "Sala": "Room",
  "Mensagem em": "Message in",
  "A sala": "The room",
  "requer senha.": "requires password.",
  "Deletar sala": "Delete room",
  "Sobreviventes": "Survivors",
  "Nenhuma mensagem ainda.": "No messages yet.",

  // ---- TabelaTab additional ----
  "Reportar Preco": "Report Price",
  "Editar/Remover": "Edit/Remove",
  "ID (auto) *": "ID (auto) *",
  "Categoria": "Category",
  "Prévia do novo item": "New item preview",
  "Prévia do item": "Item preview",
  "Observacoes sobre o item...": "Notes about the item...",
  "Salvando...": "Saving...",
  "Aco": "Steel",
  "item": "item",
  "sem preco": "no price",
  "Guia": "Guide",
  "Preco pendente - reporte para ajudar!": "Price pending - report to help!",
  "Ex: Agua Potavel": "Ex: PotableWater",
  "Fonte: dayr.wiki.gg + comunidade": "Source: dayr.wiki.gg + community",
  "Os precos estao no formato quantidade:valor. Por exemplo, 5:1 significa que voce da 5 unidades do item e recebe 1 de Aco ($). Ou seja, o primeiro numero e a quantidade do item e o segundo e o valor em moeda.": "Prices are in quantity:value format. For example, 5:1 means you give 5 units of the item and receive 1 Steel ($). The first number is the item quantity and the second is the currency value.",
  "A coluna Tendencia mostra a media dos precos reportados pela comunidade para cada item. Quando ha reports, aparece o valor medio em Aco ($) e Cimento seguido do numero de reports entre parenteses. Quando nao ha reports, aparece o grafico sparkline com a variacao dos ultimos 7 dias.": "The Trend column shows the average of community-reported prices for each item. When there are reports, the average value in Steel ($) and Cement appears followed by the number of reports in parentheses. When there are no reports, a sparkline chart shows the variation over the last 7 days.",
  "Clique no botao Reportar para compartilhar os precos que voce ve no jogo. Isso ajuda toda a comunidade! Quanto mais pessoas reportam, mais precisa fica a tendencia. O ranking dos maiores contribuidores aparece no Dashboard.": "Click the Report button to share the prices you see in-game. This helps the whole community! The more people report, the more accurate the trend becomes. The top contributors ranking appears on the Dashboard.",
  "Alguns itens ainda nao tem preco definido. Isso acontece porque sao novos na tabela ou ninguem reportou ainda. Use o botao Reportar para adicionar o primeiro preco!": "Some items don't have a defined price yet. This happens because they are new to the table or nobody has reported yet. Use the Report button to add the first price!",
  "Precos baseados em pesquisa de comunidades (Reddit, Discord, Facebook, Foruns). A lista completa de itens foi extraida do wiki oficial do jogo (dayr.wiki.gg). Os precos sao atualizados pela comunidade atraves de reports.": "Prices based on community research (Reddit, Discord, Facebook, Forums). The complete item list was extracted from the official game wiki (dayr.wiki.gg). Prices are updated by the community through reports.",

  // ---- EmprestimosTab additional ----
  "⚠️ Prazo: 24 horas. Após: +1% de juros por dia.": "⚠️ Deadline: 24 hours. After: +1% interest per day.",
  "Ex: Sal, Carne...": "Ex: Salt, Meat...",

  // ---- InvestidoresTab additional ----
  "Taxa de": "Fee of",
  "em empréstimos e trocas (vs": "on loans and trades (vs",
  "comum).": "common).",

  // ---- LeiloesTab additional (bullet point versions) ----
  "• O leilão conta o tempo escolhido (1h a 48h).": "• The auction counts the chosen time (1h to 48h).",
  "• Qualquer pessoa pode dar lance durante o tempo.": "• Anyone can bid during the time.",
  "• Após o tempo acabar, cada novo lance adiciona": "• After time runs out, each new bid adds",
  "• Quando o tempo de disputa acaba, o leilão vai para": "• When dispute time runs out, the auction goes to",
  "• O admin finaliza após entregar o item e receber o pagamento.": "• Admin finalizes after delivering the item and receiving payment.",
  "Ex: Água Tóxica": "Ex: Toxic Water",

  // ---- SorteiosTab additional ----
  "Timer acaba ganhador": "Timer ends, winner",
  "Ex: Katana": "Ex: Katana",

  // ---- LotericaTab additional ----
  "Numero:": "Number:",
  "- Ganhador:": "- Winner:",
  "- Premio:": "- Prize:",
  "- Nao foi vendido -": "- Not sold -",
  "das vendas vai pro banco,": "of sales goes to the bank,",
  "Ex: Aco": "Ex: Steel",

  // ---- ComprasVendasTab additional ----
  "🔴 Compra": "🔴 Purchase",
  "🟢 Venda": "🟢 Sale",
  "Obs": "Notes",
  "Ex: Moeda": "Ex: Currency",

  // ---- CaixaTab additional ----
  "📦 Entrada": "📦 Income",
  "📤 Saída": "📤 Expense",
  "Ex: Compra": "Ex: Purchase",

  // ---- ConfigTrocasTab additional ----
  "Taxas: 15% comum / 10% investidor.": "Fees: 15% common / 10% investor.",

  // ---- Dynamic toast/message strings ----
  "Saída de leilão registrada:": "Auction output registered:",
  "Saída de sorteio registrada:": "Raffle output registered:",
  "para": "for",
  "PAGO COM": "PAID WITH",
  "RECEBIDO EM": "RECEIVED IN",
  "Leilão do Banco:": "Bank Auction:",
  "Sorteio:": "Raffle:",
  "(ganhador:": "(winner:",
  "1º": "1st",
  "2º": "2nd",
  "3º": "3rd",

  // ---- Common game items (for inventory & cash flow) ----
  "Aço": "Steel",
  "Moedas": "Currencies",
  "Munição": "Ammo",
  "Munição de Pistola": "Pistol Ammo",
  "Bateria Quebrada": "Broken Battery",
  "Moedas Velhas": "Old Coins",
  "Agua Potavel": "Potable Water",
  "Água Potável": "Potable Water",
  "Água": "Water",
  "Carne": "Meat",
  "Peixe": "Fish",
  "Sal": "Salt",
  "Açúcar": "Sugar",
  "Pão": "Bread",
  "Gelo": "Ice",
  "Madeira": "Wood",
  "Metal": "Metal",
  "Ferro": "Iron",
  "Cobre": "Copper",
  "Ouro": "Gold",
  "Diamante": "Diamond",
  "Couro": "Leather",
  "Tecido": "Fabric",
  "Linha": "Thread",
  "Prego": "Nail",
  "Parafuso": "Screw",
  "Martelo": "Hammer",
  "Machado": "Axe",
  "Katana": "Katana",
  "Espada": "Sword",
  "Arma": "Weapon",
  "Armadura": "Armor",
  "Roupa": "Clothing",
  "Botas": "Boots",
  "Capacete": "Helmet",
  "Mochila": "Backpack",
  "Bandeagem": "Bandage",
  "Remédio": "Medicine",
  "Antibiótico": "Antibiotic",
  "Soro": "Serum",
  "Vacina": "Vaccine",
  "Veneno": "Poison",
  "Bomba": "Bomb",
  "Dinamite": "Dynamite",
  "Isqueiro": "Lighter",
  "Fósforo": "Match",
  "Lanterna": "Lantern",
  "Bateria": "Battery",
  "Gerador": "Generator",
  "Rádio": "Radio",
  "Peças": "Parts",
  "Peça": "Part",
  "Ferramenta": "Tool",
  "Chave": "Key",
  "Cadeado": "Padlock",
  "Comida enlatada": "Canned food",
  "Comida": "Food",
  "Bebida": "Drink",
  "Álcool": "Alcohol",
  "Gasolina": "Gasoline",
  "Diesel": "Diesel",
  "Combustível": "Fuel",
  "Óleo": "Oil",
  "Munição de Escopeta": "Shotgun Ammo",
  "Munição de Rifle": "Rifle Ammo",
  "Munição de SMG": "SMG Ammo",

  // ---- Common accented words ----
  "Preço": "Price",
  "Preços": "Prices",
  "preço": "price",
  "preços": "prices",
  "Situação": "Situation",
  "Informação": "Information",
  "Conexão": "Connection",
  "Opção": "Option",
  "Função": "Function",
  "Integração": "Integration",
  "Confirmação": "Confirmation",
  "Verificação": "Verification",
  "Localização": "Location",
  "Qualidade": "Quality",
  "Possível": "Possible",
  "Impossível": "Impossible",
  "Indisponível": "Unavailable",
  "Necessário": "Necessary",
  "Obrigatório": "Mandatory",
  "Preencha": "Fill",
  "Seleção": "Selection",
  "Configuração": "Configuration",
  "Manutenção": "Maintenance",
  "Prazo": "Deadline",
  "Prêmio": "Prize",
  "Número": "Number",
  "Números": "Numbers",
  "Nível": "Level",
  "Acúmulo": "Accumulation",
  "Relatório": "Report",
  "Relatórios": "Reports",
  "Público": "Public",
  "Privado": "Private",
  "Vencimento": "Due date",
  "Acumulado": "Accumulated",
  "Calculado": "Calculated",
  "Estimado": "Estimated",
  "Atualizado": "Updated",
  "Removido": "Removed",
  "Adicionado": "Added",
  "Registrado": "Registered",
  "Finalizado": "Finalized",
  "Iniciado": "Started",
  "Cancelado": "Cancelled",

  // ---- Tabela tab (Reportar/Guia) ----
  "Tabela de Preços": "Price Table",
  "Reportar Preços": "Report Prices",
  "Guia da Tabela de Preços": "Price Table Guide",
  "Viu um preço diferente no jogo?": "See a different price in-game?",
  "Seus reports aparecem na Tendência.": "Your reports appear in Trends.",
  "Qtd Aço": "Steel Qty",
  "Valor Aço ($)": "Steel Value ($)",
  "Níveis de Demanda": "Demand Levels",
  "Últimos Reports da Comunidade": "Latest Community Reports",
  "Tendência": "Trend",
  "Erro ao reportar.": "Error reporting.",
  "Nenhum report ainda.": "No reports yet.",

  // ---- Trocas tab history ----

  // ---- Leilão tab ----

  // ---- Lotérica tab ----
  "Prêmio Mínimo": "Minimum Prize",
  "Duração Vendas (min)": "Sales Duration (min)",
  "1000 números": "1000 numbers",
  "preço fixo por número.": "fixed price per number.",
  "vai pro prêmio": "goes to the prize",
  "Se ninguém acertar, o prêmio": "If nobody gets it right, the prize",
  "Só reseta quando sair um": "Only resets when a",
  "- Prêmio:": "- Prize:",
  "- Não foi vendido -": "- Not sold -",

  // ---- Caixa tab additional ----
  "📦 ENTRADA": "📦 INCOME",
  "📤 SAÍDA": "📤 EXPENSE",

  // ---- Trocas tab additional ----
  "Troca registrada!": "Trade registered!",
  "Excluir a troca": "Exclude the trade",

  // ---- Doadores tab additional ----
  "Doação registrada!": "Donation registered!",
  "Excluir a doação": "Exclude the donation",
  "será estornado do estoque.": "will be reversed from stock.",

  // ---- Leilão tab additional ----
  "Lance deve ser > ": "Bid must be > ",
  "Lance de ": "Bid of ",
  " registrado!": " registered!",
  "Valor (mín: ": "Value (min: ",
  "Leilão criado!": "Auction created!",

  // ---- Lotérica tab additional ----
  "Loterica Ativa": "Active Lottery",
  "Premio = maior entre 80% do arrecadado e o minimo efetivo...": "Prize = max of 80% collected and effective min...",
  "Numero sorteado: ": "Drawn number: ",
  "20% das vendas creditado no estoque.": "20% of sales credited to stock.",

  // ---- Compras & Vendas tab additional ----
  "Registrar Compra": "Register Purchase",
  "Registrar Venda": "Register Sale",
  "Compra registrada!": "Purchase registered!",
  "Venda registrada!": "Sale registered!",

  // ---- Chat tab additional ----
  "Mensagem em ": "Message in ",
  "A sala ": "The room ",
  " requer senha.": " requires password.",
  "Deletar sala ": "Delete room ",
  "Evento": "Event",

  // ---- Investidores tab additional ----
  "Valor Investido": "Invested Value",
  "Data Entrada": "Entry Date",
  "Status Inv.": "Inv. Status",
  "Novo Investidor": "New Investor",
  "Editar Investidor": "Edit Investor",
  "Valor investido": "Invested value",
  "Data de entrada": "Entry date",
  "Status": "Status",
  "Ativo": "Active",
  "Inativo": "Inactive",
  "Investidor cadastrado!": "Investor registered!",
  "Investidor atualizado!": "Investor updated!",
  "Investidor excluído!": "Investor deleted!",
  "Preencha nome e valor investido.": "Fill name and invested value.",

  // ---- Emprestimos tab additional ----
  "Empréstimo registrado!": "Loan registered!",
  "Pagamento registrado!": "Payment registered!",
  "Empréstimo excluído!": "Loan deleted!",
  "Excluir empréstimo?": "Delete loan?",

  // ---- Sorteios tab additional ----
  "Sorteio finalizado!": "Raffle finalized!",
  "Participar do Sorteio": "Join Raffle",
  "Participação registrada!": "Participation registered!",
  "Já participa deste sorteio.": "Already participating in this raffle.",

  // ---- Config Trocas additional ----
  "Configuração salva!": "Configuration saved!",

  // ---- Additional common items (lowercase variants for case-insensitive) ----
  "aço": "Steel",
  "gelo": "Ice",
  "cimento": "Cement",
  "moeda": "Currency",
  "moedas": "Currencies",
  "munição": "Ammo",
  "carne": "Meat",
  "peixe": "Fish",
  "sal": "Salt",
  "açúcar": "Sugar",
  "pão": "Bread",
  "madeira": "Wood",
  "metal": "Metal",
  "ferro": "Iron",
  "cobre": "Copper",
  "ouro": "Gold",
  "diamante": "Diamond",
  "couro": "Leather",
  "tecido": "Fabric",
  "linha": "Thread",
  "martelo": "Hammer",
  "machado": "Axe",
  "espada": "Sword",
  "arma": "Weapon",
  "armadura": "Armor",
  "roupa": "Clothing",
  "botas": "Boots",
  "capacete": "Helmet",
  "mochila": "Backpack",
  "remédio": "Medicine",
  "antibiótico": "Antibiotic",
  "bomba": "Bomb",
  "isqueiro": "Lighter",
  "lanterna": "Lantern",
  "bateria": "Battery",
  "gerador": "Generator",
  "rádio": "Radio",
  "comida": "Food",
  "bebida": "Drink",
  "água": "Water",
  "combustível": "Fuel",
  "gasolina": "Gasoline",
  "óleo": "Oil",

  // ---- Additional missing UI strings ----
  "Imagem indisponível para": "Image unavailable for",

  "Compras e Vendas": "Purchases & Sales",
  "Banco (100%):": "Bank (100%):",
  "registrada!": "registered!",
  "adicionado!": "added!",

  "excluída!": "deleted!",
  "excluído!": "deleted!",

  "Investidor adicionado!": "Investor added!",

  "Empréstimo de": "Loan from",
  "Doação de": "Donation from",
  "marcado como pago!": "marked as paid!",




  "+... acumulado": "+... accumulated",
  "20% das vendas (...) creditado no estoque.": "20% of sales (...) credited to stock.",




  "Mensagem em #": "Message in #",


  "Mensagem": "Message",





  "Sai do estoque": "Leaves stock",
  "Entra no estoque": "Enters stock",

























  "Loterica criada!": "Lottery created!",























































  "Viu um preco diferente no jogo?": "See a different price in-game?",
  "Seus reports aparecem na Tendencia.": "Your reports appear in Trends.",
















































  "Formato: Qtd:Valor. Ex: Agua 5:1 aco = voce da 5 aguas por 1 aco. 10:1 cimento = voce da 10 aguas por 1 cimento. Os reports calculam a media na Tendencia.": "Format: Qty:Value. Ex: Water 5:1 steel = you give 5 waters for 1 steel. 10:1 cement = you give 10 waters for 1 cement. Reports calculate the average in Trends.",


















































  "Excluir a doação de": "Exclude the donation from",

































  "Preco de": "Price of",
  "reportado! Obrigado": "reported! Thank you",
  "Imagem enviada.": "Image uploaded.",
































  "Traduzir site": "Translate site",
  "Recibido": "Received",
  "Recibido / Entrou no estoque": "Received / Entered stock",


  ">>> ": ">>> ",

  // ---- Missing entries found in audit ----
  "Sem spam": "No spam",
  "Excluir doação de": "Delete donation from",
  "⭐ Especial (0%)": "⭐ Special (0%)",
  "👑 Top 10 Investidor (5%)": "👑 Top 10 Investor (5%)",
  "💎 Investidor (10%)": "💎 Investor (10%)",
  "👤 Comum (15%)": "👤 Common (15%)",
  "⚠️ Não Contribuinte (20%)": "⚠️ Non-Contributor (20%)",
};

/* ============================================================
   LANGUAGE-SPECIFIC OVERRIDES
   ============================================================ */
const ES: Record<string, string> = {
  // ---- Tabs ----
  "Dashboard": "Panel", "Tabela": "Tabla de precios", "Empréstimos": "Préstamos",
  "Trocas": "Intercambios", "Doadores": "Donantes", "Leilões": "Subastas",
  "Sorteios": "Sorteos", "Lotérica": "Lotería", "Investidores": "Inversores",
  "Config Trocas": "Config. Intercambios", "Compras & Vendas": "Compras y Ventas",
  "Estoque & Caixa": "Stock y Caja",

  // ---- Common ----
  "Carregando...": "Cargando...", "Carregando dados do banco...": "Cargando datos del banco...",
  "Carregando chat...": "Cargando chat...", "Cancelar": "Cancelar", "Entrar": "Entrar",
  "Salvar": "Guardar", "Fechar": "Cerrar", "Criar": "Crear", "Remover": "Eliminar",
  "Registrar": "Registrar", "Buscar...": "Buscar...", "Buscar item...": "Buscar artículo...",
  "Buscar numero ou comprador...": "Buscar número o comprador...",
  "Nome": "Nombre", "Item": "Artículo", "Quantidade": "Cantidad", "Tipo": "Tipo",
  "Data": "Fecha", "Player": "Jugador", "Todos": "Todos", "Admin": "Admin",
  "Modo visual": "Modo visual", "total": "total", "registros": "registros",
  "Observação": "Observación", "Opcional": "Opcional",
  "Dono": "Dueño", "Moeda": "Moneda", "Ganhador": "Ganador", "Vencedor": "Ganador",
  "Participantes": "Participantes", "Criado": "Creado", "Qtd": "Cant",
  "Inicial": "Inicial", "Maior": "Mayor", "Lances": "Pujas", "Taxa": "Comisión",
  "Lucro": "Ganancia", "Bruto:": "Bruto:", "Descrição": "Descripción",
  "Origem": "Origen", "Ação": "Acción", "Disponível": "Disponible",
  "Disponivel": "Disponible",

  // ---- Dashboard ----
  "Empréstimos Pendentes": "Préstamos Pendientes", "Empréstimos Pagos": "Préstamos Pagados",
  "Investidores Ativos": "Inversores Activos", "Trocas Realizadas": "Intercambios Realizados",
  "Registros no Caixa": "Registros en Caja", "Leilões Ativos": "Subastas Activas",
  "Sorteios Ativos": "Sorteos Activos", "Top 10 Doadores": "Top 10 Donantes",
  "Top 10 Investidores": "Top 10 Inversores", "Top 10 Contribuintes": "Top 10 Contribuyentes",
  "Estoque do Banco": "Stock del Banco", "Movimentos do Caixa": "Movimientos de Caja",
  "Eventos Ativos": "Eventos Activos", "Nenhum doador cadastrado.": "Ningún donante registrado.",
  "Nenhum investidor cadastrado.": "Ningún inversor registrado.",
  "Nenhum contribuinte ainda. Contribua reportando precos na aba Tabela!": "Ningún contribuyente aún. ¡Contribuye reportando precios en la pestaña Tabla!",
  "Nenhum item encontrado.": "Ningún artículo encontrado.",
  "Estoque vazio.": "Stock vacío.", "Nenhum registro ainda.": "Ningún registro aún.",
  "desde": "desde", "contribuicoes": "contribuciones",

  // ---- Chat ----
  "Canais": "Canales", "Salas Privadas": "Salas Privadas",
  "Geral": "General", "Atendimento": "Soporte", "Guias": "Guías",
  "Clãs": "Clanes", "Comércio": "Comercio",
  "Nenhuma mensagem ainda. Seja o primeiro a conversar!": "¡Aún no hay mensajes. ¡Sé el primero en chatear!",
  "Nenhuma sala criada.": "Ninguna sala creada.",
  "Nome da sala": "Nombre de la sala", "Senha (opcional)": "Contraseña (opcional)",
  "Senha da sala": "Contraseña de la sala", "Sala Privada": "Sala Privada",
  "requer senha": "requiere contraseña", "Voltar": "Volver",
  "Hoje": "Hoy", "Ontem": "Ayer", "Membro": "Miembro",
  "Regras:": "Reglas:", "por": "por",
  "Digite seu nome para entrar no chat.": "Introduce tu nombre para entrar al chat.",
  "Seu nome no jogo": "Tu nombre en el juego",
  "Nenhuma mensagem ainda.": "Aún no hay mensajes.",
  "Sala": "Sala", "Mensagem": "Mensaje",
  "Evento": "Evento", "Sobreviventes": "Supervivientes",
  "Deletar sala": "Eliminar sala", "Deletar mensagem?": "¿Eliminar mensaje?",

  // ---- Doadores ----
  "❤️ Doadores": "❤️ Donantes",
  "Ranking": "Ranking", "Reordenar": "Reordenar",
  "Nova Doação": "Nueva Donación", "Registrar Doação": "Registrar Donación",
  "Histórico": "Historial", "Nenhuma doação.": "Ninguna donación.",
  "Nenhuma doação ainda. Seja o primeiro a conversar!": "¡Aún no hay donaciones.",
  "Doação registrada!": "¡Donación registrada!",
  "Doação excluída e estoque estornado.": "Donación eliminada y stock revertido.",
  "Não foi possível excluir a doação.": "No se pudo eliminar la donación.",
  "Excluir a doação de": "Excluir la donación de",
  "Excluir doação de": "Excluir donación de",

  // ---- Investidores ----
  "💎 Membros Investidores": "💎 Miembros Inversores",
  "Benefício:": "Beneficio:",
  "em empréstimos e trocas": "en préstamos e intercambios",
  "comum": "común",
  "Como obter a tag?": "¿Cómo obtener la etiqueta?",
  "Ajude o banco — doando itens, fazendo trocas ou de qualquer outra forma.": "Ayuda al banco — donando artículos, haciendo intercambios o de cualquier otra forma.",
  "Adicionar Investidor": "Añadir Inversor", "Nome do investidor": "Nombre del inversor",
  "Adicionar": "Añadir", "Ativos": "Activos", "Nenhum investidor.": "Ningún inversor.",
  "Valor Investido": "Valor Invertido", "Data Entrada": "Fecha de entrada",
  "Status Inv.": "Estado Inv.", "Novo Investidor": "Nuevo Inversor",
  "Editar Investidor": "Editar Inversor", "Valor investido": "Valor invertido",
  "Data de entrada": "Fecha de entrada", "Status": "Estado",
  "Ativo": "Activo", "Inativo": "Inactivo",
  "Investidor cadastrado!": "¡Inversor registrado!",
  "Investidor atualizado!": "¡Inversor actualizado!",
  "Investidor excluído!": "¡Inversor eliminado!",
  "Investidor adicionado!": "¡Inversor añadido!",
  "Taxa de": "Comisión de",
  "em empréstimos e trocas (vs": "en préstamos e intercambios (vs",
  "comum).": "común).",

  // ---- Trocas ----
  "Registro de Trocas": "Registro de Intercambios", "Nova Troca": "Nuevo Intercambio",
  "Selecione": "Seleccionar", "Nenhuma tabela": "Ninguna tabla",
  "Preencha o formulário ao lado.": "Rellena el formulario al lado.",
  "sem taxa": "sin comisión", "Player Receibe:": "Jugador Recibe:",
  "Player entregou:": "Jugador entregó:",
  "Sai do estoque do Banco:": "Sale del stock del Banco:",
  "O item recebido entra no estoque do Banco; não há taxa nem lucro.": "El artículo recibido entra al stock del Banco; sin comisión ni ganancia.",
  "Entra no estoque do Banco:": "Entra al stock del Banco:",
  "Entregou": "Entregó", "Recebeu / Entrou no estoque": "Recibió / Entró al stock",
  "Recibido / Entrou no estoque": "Recibido / Entró al stock",
  "Calculadora": "Calculadora",
  "Troca registrada!": "¡Intercambio registrado!",
  "Excluir troca e estornar estoque": "Excluir intercambio y revertir stock",
  "Troca excluída e estoque estornado.": "Intercambio excluido y stock revertido.",
  "Não foi possível excluir a troca.": "No se pudo excluir el intercambio.",
  "Excluir a troca de": "Excluir el intercambio de",
  "Excluir a troca": "Excluir el intercambio",
  "Registrar Troca": "Registrar Intercambio",
  "Especial (0%)": "Especial (0%)", "Top 10 (5%)": "Top 10 (5%)",
  "Investidor (10%)": "Inversor (10%)", "Comum (15%)": "Común (15%)",
  "Não Contribuinte (20%)": "No Contribuyente (20%)",
  "Banco (100% — troca interna)": "Banco (100% — intercambio interno)",
  "Banco (100%)": "Banco (100%)",
  "Banco (100%):": "Banco (100%):",
  "⭐ Especial (0%)": "⭐ Especial (0%)",
  "👑 Top 10 Investidor (5%)": "👑 Top 10 Inversor (5%)",
  "💎 Investidor (10%)": "💎 Inversor (10%)",
  "👤 Comum (15%)": "👤 Común (15%)",
  "⚠️ Não Contribuinte (20%)": "⚠️ No Contribuyente (20%)",

  // ---- Compras & Vendas ----
  "🛒 Compras e Vendas": "🛒 Compras y Ventas",
  "COMPRA:": "COMPRA:", "Você paga → Recebe do player": "Tú pagas → Recibes del jugador",
  "VENDA:": "VENTA:", "Você entrega → Recebe do player": "Tú entregas → Recibes del jugador",
  "Entra": "Entra", "Sai": "Sale", "Paga": "Paga", "Recebe": "Recibe",
  "Compras": "Compras", "Vendas": "Ventas",
  "Nenhuma compra ou venda.": "Ninguna compra o venta.",
  "Registrar Compra": "Registrar Compra", "Registrar Venda": "Registrar Venta",
  "Compra registrada!": "¡Compra registrada!", "Venda registrada!": "¡Venta registrada!",

  // ---- Caixa ----
  "💰 Caixa do Banco": "💰 Caja del Banco",
  "Saída por Leilão do Banco (100%)": "Salida por Subasta del Banco (100%)",
  "Registre itens que saíram do estoque para leilões do banco.": "Registra artículos que salieron del stock para subastas del banco.",
  "Saída por Sorteio (Prêmio)": "Salida por Sorteo (Premio)",
  "Registre o prêmio que saiu do estoque quando um sorteio for finalizado.": "Registra el premio que salió del stock cuando se finalice un sorteo.",
  "Registro Manual": "Registro Manual", "ENTRADA": "INGRESO", "SAÍDA": "GASTO",
  "Entrada": "Ingreso", "Saída": "Gasto",
  "Nome do jogador": "Nombre del jugador",
  "Registrar Saída": "Registrar Salida", "Registrar Prêmio": "Registrar Premio",
  "Estoque Atual": "Stock Actual", "BAIXO": "BAJO",
  "Resetar": "Resetear", "Resetar TUDO?": "¿Resetear TODO?",
  "📦 ENTRADA": "📦 INGRESO", "📤 SAÍDA": "📤 GASTO",
  "Nenhum registro.": "Ningún registro.",
  "Item Pagamento": "Artículo de Pago", "Item Pagamento (opcional)": "Artículo de Pago (opcional)",
  "Qtd Pagamento": "Cant. de Pago",

  // ---- Leilões ----
  "🔨 Leilões": "🔨 Subastas", "Como Funciona": "Cómo Funciona",
  "Novo Leilão": "Nueva Subasta", "Criar Leilão": "Crear Subasta",
  "Duração": "Duración", "Fila de Espera": "Fila de Espera",
  "EM ESPERA": "EN ESPERA", "Nenhum leilão ativo.": "Ninguna subasta activa.",
  "Dar Lance": "Ofertar", "Finalizar Entrega": "Finalizar Entrega",
  "Histórico de Ganhadores": "Historial de Ganadores",
  "Leilão criado!": "¡Subasta creada!",
  "Lance deve ser > ": "La puja debe ser > ",
  "Lance de ": "Puja de ", " registrado!": " ¡registrada!",

  // ---- Sorteios ----
  "Novo Sorteio": "Nuevo Sorteo", "Nenhum.": "Ninguno.",
  "Participar": "Participar", "Sortear": "Sortear",
  "Encerrado": "Cerrado", "ENCERRADO": "CERRADO",
  "Sorteio criado!": "¡Sorteo creado!",
  "Participando!": "¡Participando!",
  "Historico de Ganhadores": "Historial de Sorteos",
  "Data do Sorteio": "Fecha del Sorteo", "Todos os Participantes": "Todos los Participantes",
  "Nenhum": "Ninguno", "Participar do Sorteio": "Participar del Sorteo",
  "Participação registrada!": "¡Participación registrada!",
  "Já participa deste sorteio.": "Ya participa de este sorteo.",
  "Sorteio finalizado!": "¡Sorteo finalizado!",

  // ---- Lotérica ----
  "Lotérica Ativa": "Lotería Activa", "Vendas abiertas": "Ventas abiertas",
  "Sorteio realizado": "Sorteo realizado", "Finalizada": "Finalizada",
  "Configurando": "Configurando", "Vendidos": "Vendidos",
  "Arrecadado Total": "Total Recaudado",
  "Premio": "Premio", "Teve Ganhador!": "¡Hay Ganador!",
  "Ninguem acertou - Premio acumulou!": "Nadie acertó - ¡Premio acumulado!",
  "Finalizar Lotérica": "Finalizar Lotería",
  "Vender Numero": "Vender Número", "Nome do Comprador": "Nombre del Comprador",
  "Vender": "Vender", "Realizar Sorteio": "Realizar Sorteo",
  "Loterica criada!": "¡Lotería creada!",
  "Nova Lotérica": "Nueva Lotería", "Configurar Lotérica": "Configurar Lotería",
  "Criar Lotérica": "Crear Lotería",
  "Premio Mínimo": "Premio Mínimo", "Prêmio Mínimo": "Premio Mínimo",
  "Nenhuma lotérica ativa. Crie uma nova acima.": "Ninguna lotería activa. Crea una nueva arriba.",
  "Nenhuma lotérica ativa no momento.": "Ninguna lotería activa en el momento.",

  // ---- Empréstimos ----
  "Regras do Banco": "Reglas del Banco",
  "Membro Especial": "Miembro Especial", "Membro Comum": "Miembro Común",
  "Não Contribuinte": "No Contribuyente",
  "Calculadora de Empréstimo": "Calculadora de Préstamo",
  "Dias de Atraso": "Días de Atraso", "Total a Devolver": "Total a Devolver",
  "itens": "ítems", "Novo Empréstimo": "Nuevo Préstamo",
  "Pendentes": "Pendientes", "Pagos": "Pagados",
  "Nenhum empréstimo pendente.": "Ningún préstamo pendiente.",
  "Pendente": "Pendiente", "Pago": "Pagado", "Atrasado": "Atrasado",
  "Pagar": "Pagar", "Confirmar Pagamento": "Confirmar Pago",
  "Empréstimo registrado!": "¡Préstamo registrado!",
  "Pagamento registrado!": "¡Pago registrado!",
  "Empréstimo excluído!": "¡Préstamo eliminado!",
  "Excluir empréstimo?": "¿Eliminar préstamo?",
  "Empréstimo atrasado - Juros já incluídos": "Préstamo atrasado - Intereses ya incluidos",

  // ---- Tabela ----
  "Tabela de Precos": "Tabla de Precios", "Tabela de Preços": "Tabla de Precios",
  "Reportar Precos": "Reportar Precios", "Reportar Preços": "Reportar Precios",
  "Guia da Tabela de Precos": "Guía de la Tabla de Precios",
  "Guia da Tabela de Preços": "Guía de la Tabla de Precios",
  "Alta": "Alta", "Media": "Media", "Baixa": "Baja",
  "Comum": "Común", "Incomum": "Poco común", "Raro": "Raro", "Lendario": "Legendario",
  "Demanda": "Demanda", "Raridade": "Rareza",
  "Gerenciar Itens": "Gestionar Artículos",
  "Reportar": "Reportar", "Editar": "Editar", "Restaurar": "Restaurar",
  "Nome do Item *": "Nombre del Artículo *", "Categoria *": "Categoría *",
  "Selecionar...": "Seleccionar...", "Wiki Link": "Enlace Wiki",
  "Adicionar Item": "Añadir Artículo",

  // ---- Admin ----
  "Login Admin": "Login Admin", "Verificando...": "Verificando...",
  "Backup": "Backup", "Gerando...": "Generando...",
  "Senha incorreta!": "¡Contraseña incorrecta!",
  "Modo Admin ativado!": "¡Modo Admin activado!",
  "Digite a senha de admin!": "¡Introduce la contraseña de admin!",
  "Entre no modo Admin para baixar o backup.": "Entra en modo Admin para descargar el backup.",
  "Não foi possível gerar o backup.": "No se pudo generar el backup.",
  "Backup baixado com sucesso!": "¡Backup descargado con éxito!",
  "Erro ao baixar o backup.": "Error al descargar el backup.",

  // ---- Translation Popup ----
  "Continuar em Português": "Continuar en Portugués",
  "Traduzir o Site": "Traducir el Sitio",
  "Selecione seu idioma": "Seleccione su idioma",
  "Traduzir para": "Traducir a",
  "Traduzir site": "Traducir sitio",

  // ---- Toasts / Messages ----
  "Registro adicionado!": "¡Registro añadido!",
  "Ordem atualizada!": "¡Orden actualizada!",
  "Preencha os obrigatórios.": "Rellena los obligatorios.",
  "Preencha todos os campos.": "Rellena todos los campos.",
  "Preencha nome e valor.": "Rellena nombre y valor.",
  "Preencha o item e a quantidade.": "Rellena el artículo y la cantidad.",
  "Preencha todos.": "Rellena todo.",
  "Preencha valor e moeda.": "Rellena valor y moneda.",
  "Numero e nome obrigatorios.": "Número y nombre obligatorios.",
  "Numero entre 1 e 1000.": "Número entre 1 y 1000.",
  "Sem loterica ativa.": "Sin lotería activa.",
  "Ja existe loterica ativa. Finalize a atual.": "Ya existe lotería activa. Finaliza la actual.",
  "Digite seu nome.": "Introduce tu nombre.",
  "Digite um nome.": "Introduce un nombre.",
  "Digite o nome do investidor.": "Introduce el nombre del inversor.",
  "Nome da sala é obrigatório.": "El nombre de la sala es obligatorio.",
  "Preencha nome, item e quantidade.": "Rellena nombre, artículo y cantidad.",
  "Preencha o item, quantidade e ganhador.": "Rellena el artículo, cantidad y ganador.",
  "Remover?": "¿Eliminar?",
  "Erro ao verificar senha.": "Error al verificar la contraseña.",
  "Baixar backup completo do banco": "Descargar backup completo del banco",
  "Clique para sair do modo Admin": "Clic para salir del modo Admin",
  "Entrar como Admin (requer senha)": "Entrar como Admin (requiere contraseña)",

  // ---- Chat rules ----
  "Sem spam": "Sin spam",
  "Respeite todos os participantes": "Respeta a todos los participantes",
  "Sem spam ou flood": "Sin spam ni flood",
  "Rivalidades ficam no jogo": "Las rivalidades se quedan en el juego",
  "Pedir/Oferecer ajuda": "Pedir/Ofrecer ayuda",
  "Compartilhar dicas": "Compartir consejos",
  "Seja claro no problema": "Sé claro con el problema",
  "Aguarde atendimento": "Espera atención",
  "Admin responde com discrição": "Admin responde con discreción",
  "Não use pra conversas gerais": "No lo uses para charlas generales",

  // ---- Config Trocas ----
  "Configuração de Tabelas de Troca": "Configuración de Tablas de Intercambio",
  "Nova Regra": "Nueva Regla",
  "Se o player der...": "Si el jugador da...",
  "Ele recebe...": "El recibe...",
  "Base": "Base", "Proporção": "Proporción", "Resultado": "Resultado",
  "Ações": "Acciones",
  "Nenhuma regra configurada.": "Ninguna regla configurada.",
  "Como funciona:": "Cómo funciona:",
  "Configuração salva!": "¡Configuración guardada!",
};

const FR: Record<string, string> = {
  // ---- Tabs ----
  "Dashboard": "Tableau de bord", "Tabela": "Table des prix", "Empréstimos": "Prêts",
  "Trocas": "Échanges", "Doadores": "Donateurs", "Leilões": "Enchères",
  "Sorteios": "Tirages", "Lotérica": "Loterie", "Investidores": "Investisseurs",
  "Config Trocas": "Config. Échanges", "Compras & Vendas": "Achats & Ventes",
  "Estoque & Caixa": "Stock & Caisse",

  // ---- Common ----
  "Carregando...": "Chargement...", "Carregando dados do banco...": "Chargement des données...",
  "Carregando chat...": "Chargement du chat...", "Cancelar": "Annuler",
  "Entrar": "Entrer", "Salvar": "Enregistrer", "Fechar": "Fermer",
  "Criar": "Créer", "Remover": "Supprimer", "Registrar": "Enregistrer",
  "Buscar...": "Rechercher...", "Buscar item...": "Rechercher un objet...",
  "Buscar numero ou comprador...": "Rechercher un numéro ou acheteur...",
  "Nome": "Nom", "Item": "Objet", "Quantidade": "Quantité",
  "Tipo": "Type", "Data": "Date", "Player": "Joueur",
  "Todos": "Tous", "Admin": "Admin", "Modo visual": "Mode visual",
  "total": "total", "registros": "enregistrements",
  "Observação": "Remarque", "Opcional": "Facultatif",
  "Dono": "Propriétaire", "Moeda": "Monnaie", "Ganhador": "Gagnant",
  "Vencedor": "Gagnant", "Participantes": "Participants",
  "Criado": "Créé", "Qtd": "Qté", "Inicial": "Initial",
  "Maior": "Plus haut", "Lances": "Enchères", "Taxa": "Commission",
  "Lucro": "Profit", "Bruto:": "Brut:", "Descrição": "Description",
  "Origem": "Origine", "Ação": "Action", "Disponível": "Disponible",
  "Disponivel": "Disponible",

  // ---- Dashboard ----
  "Empréstimos Pendentes": "Prêts en attente", "Empréstimos Pagos": "Prêts payés",
  "Investidores Ativos": "Investisseurs actifs", "Trocas Realizadas": "Échanges effectués",
  "Registros no Caixa": "Enregistrements en caisse", "Leilões Ativos": "Enchères actives",
  "Sorteios Ativos": "Tirages actifs", "Top 10 Doadores": "Top 10 Donateurs",
  "Top 10 Investidores": "Top 10 Investisseurs", "Top 10 Contribuintes": "Top 10 Contributeurs",
  "Estoque do Banco": "Stock de la Banque", "Movimentos do Caixa": "Mouvements de Caisse",
  "Eventos Ativos": "Événements actifs",
  "Nenhum doador cadastrado.": "Aucun donateur enregistré.",
  "Nenhum investidor cadastrado.": "Aucun investisseur enregistré.",
  "Nenhum item encontrado.": "Aucun objet trouvé.",
  "Estoque vazio.": "Stock vide.", "Nenhum registro ainda.": "Aucun enregistrement.",
  "desde": "depuis", "contribuicoes": "contributions",

  // ---- Chat ----
  "Canais": "Canaux", "Salas Privadas": "Salles Privées",
  "Geral": "Général", "Atendimento": "Support", "Guias": "Guides",
  "Clãs": "Clans", "Comércio": "Commerce",
  "Nenhuma mensagem ainda. Seja o primeiro a conversar!": "Pas encore de messages. Soyez le premier !",
  "Nenhuma sala criada.": "Aucune salle créée.",
  "Nome da sala": "Nom de la salle", "Senha (opcional)": "Mot de passe (facultatif)",
  "Senha da sala": "Mot de passe de la salle", "Sala Privada": "Salle Privée",
  "requer senha": "requiert un mot de passe", "Voltar": "Retour",
  "Hoje": "Aujourd'hui", "Ontem": "Hier", "Membro": "Membre",
  "Regras:": "Règles :", "por": "par",
  "Digite seu nome para entrar no chat.": "Entrez votre nom pour rejoindre le chat.",
  "Seu nome no jogo": "Votre nom en jeu",
  "Nenhuma mensagem ainda.": "Pas encore de messages.",
  "Sala": "Salle", "Mensagem": "Message",
  "Evento": "Événement", "Sobreviventes": "Survivants",
  "Deletar sala": "Supprimer la salle", "Deletar mensagem?": "Supprimer le message ?",

  // ---- Doadores ----
  "❤️ Doadores": "❤️ Donateurs",
  "Ranking": "Classement", "Reordenar": "Réordonner",
  "Nova Doação": "Nouveau Don", "Registrar Doação": "Enregistrer le Don",
  "Histórico": "Historique", "Nenhuma doação.": "Aucun don.",
  "Doação registrada!": "Don enregistré !",
  "Doação excluída e estoque estornado.": "Don supprimé et stock rétabli.",
  "Não foi possível excluir a doação.": "Impossible de supprimer le don.",
  "Excluir a doação de": "Supprimer le don de",
  "Excluir doação de": "Supprimer don de",

  // ---- Investidores ----
  "💎 Membros Investidores": "💎 Membres Investisseurs",
  "Benefício:": "Avantage :",
  "em empréstimos e trocas": "sur les prêts et échanges",
  "comum": "commun",
  "Como obter a tag?": "Comment obtenir le tag ?",
  "Ajude o banco — doando itens, fazendo trocas ou de qualquer outra forma.": "Aidez la banque — en faisant des dons, des échanges ou autrement.",
  "Adicionar Investidor": "Ajouter Investisseur", "Nome do investidor": "Nom de l'investisseur",
  "Adicionar": "Ajouter", "Ativos": "Actifs",
  "Nenhum investidor.": "Aucun investisseur.",
  "Valor Investido": "Valeur Investie", "Data Entrada": "Date d'entrée",
  "Status Inv.": "Statut Inv.", "Novo Investidor": "Nouvel Investisseur",
  "Editar Investidor": "Modifier Investisseur", "Valor investido": "Valeur investie",
  "Data de entrada": "Date d'entrée", "Status": "Statut",
  "Ativo": "Actif", "Inativo": "Inactif",
  "Investidor cadastrado!": "Investisseur enregistré !",
  "Investidor atualizado!": "Investisseur mis à jour !",
  "Investidor excluído!": "Investisseur supprimé !",
  "Investidor adicionado!": "Investisseur ajouté !",

  // ---- Trocas ----
  "Registro de Trocas": "Registre des Échanges", "Nova Troca": "Nouvel Échange",
  "Selecione": "Sélectionner", "Nenhuma tabela": "Aucune table",
  "Preencha o formulário ao lado.": "Remplissez le formulaire à côté.",
  "sem taxa": "sans commission", "Player Receibe:": "Joueur Reçoit :",
  "Player entregou:": "Joueur a donné :",
  "Sai do estoque do Banco:": "Quitte le stock de la Banque :",
  "O item recebido entra no estoque do Banco; não há taxa nem lucro.": "L'objet reçu entre dans le stock de la Banque ; pas de commission ni de profit.",
  "Entra no estoque do Banco:": "Entre dans le stock de la Banque :",
  "Entregou": "A donné", "Recebeu / Entrou no estoque": "Reçu / Entré en stock",
  "Recibido / Entrou no estoque": "Reçu / Entré en stock",
  "Calculadora": "Calculatrice",
  "Troca registrada!": "Échange enregistré !",
  "Excluir troca e estornar estoque": "Supprimer l'échange et rétablir le stock",
  "Troca excluída e estoque estornado.": "Échange supprimé et stock rétabli.",
  "Não foi possível excluir a troca.": "Impossible de supprimer l'échange.",
  "Excluir a troca de": "Supprimer l'échange de",
  "Excluir a troca": "Supprimer l'échange",
  "Registrar Troca": "Enregistrer l'Échange",
  "Especial (0%)": "Spécial (0%)", "Top 10 (5%)": "Top 10 (5%)",
  "Investidor (10%)": "Investisseur (10%)", "Comum (15%)": "Commun (15%)",
  "Não Contribuinte (20%)": "Non-Contributeur (20%)",
  "Banco (100% — troca interna)": "Banque (100% — échange interne)",
  "Banco (100%)": "Banque (100%)", "Banco (100%):": "Banque (100%) :",
  "⭐ Especial (0%)": "⭐ Spécial (0%)",
  "👑 Top 10 Investidor (5%)": "👑 Top 10 Investisseur (5%)",
  "💎 Investidor (10%)": "💎 Investisseur (10%)",
  "👤 Comum (15%)": "👤 Commun (15%)",
  "⚠️ Não Contribuinte (20%)": "⚠️ Non-Contributeur (20%)",

  // ---- Compras & Vendas ----
  "🛒 Compras e Vendas": "🛒 Achats & Ventes",
  "COMPRA:": "ACHAT :", "Você paga → Recebe do player": "Vous payez → Recevez du joueur",
  "VENDA:": "VENTE :", "Você entrega → Recebe do player": "Vous donnez → Recevez du joueur",
  "Entra": "Entre", "Sai": "Sort", "Paga": "Paie", "Recebe": "Reçoit",
  "Compras": "Achats", "Vendas": "Ventes",
  "Nenhuma compra ou venda.": "Aucun achat ou vente.",
  "Registrar Compra": "Enregistrer l'Achat", "Registrar Venda": "Enregistrer la Vente",
  "Compra registrada!": "Achat enregistré !", "Venda registrada!": "Vente enregistrée !",

  // ---- Caixa ----
  "💰 Caixa do Banco": "💰 Caisse de la Banque",
  "Saída por Leilão do Banco (100%)": "Sortie pour Enchère de la Banque (100%)",
  "Registro Manual": "Enregistrement Manuel",
  "ENTRADA": "REVENUS", "SAÍDA": "DÉPENSES",
  "Entrada": "Revenus", "Saída": "Dépenses",
  "Nome do jogador": "Nom du joueur",
  "Registrar Saída": "Enregistrer la Sortie", "Registrar Prêmio": "Enregistrer le Prix",
  "Estoque Atual": "Stock Actuel", "BAIXO": "BAS",
  "Resetar": "Réinitialiser", "Resetar TUDO?": "Réinitialiser TOUT ?",
  "📦 ENTRADA": "📦 REVENUS", "📤 SAÍDA": "📤 DÉPENSES",
  "Nenhum registro.": "Aucun enregistrement.",

  // ---- Leilões ----
  "🔨 Leilões": "🔨 Enchères", "Como Funciona": "Comment ça marche",
  "Novo Leilão": "Nouvelle Enchère", "Criar Leilão": "Créer l'Enchère",
  "Duração": "Durée", "Fila de Espera": "File d'attente",
  "EM ESPERA": "EN ATTENTE",
  "Nenhum leilão ativo.": "Aucune enchère active.",
  "Dar Lance": "Enchérir", "Finalizar Entrega": "Finaliser la Livraison",
  "Histórico de Ganhadores": "Historique des Gagnants",
  "Leilão criado!": "Enchère créée !",
  "Lance deve ser > ": "L'enchère doit être > ",
  "Lance de ": "Enchère de ", " registrado!": " enregistrée !",

  // ---- Sorteios ----
  "Novo Sorteio": "Nouveau Tirage", "Nenhum.": "Aucun.",
  "Participar": "Participer", "Sortear": "Tirer",
  "Encerrado": "Terminé", "ENCERRADO": "TERMINÉ",
  "Sorteio criado!": "Tirage créé !", "Participando!": "Participation !",
  "Historico de Ganhadores": "Historique des Tirages",
  "Data do Sorteio": "Date du Tirage", "Todos os Participantes": "Tous les Participants",
  "Nenhum": "Aucun", "Participar do Sorteio": "Participer au Tirage",
  "Participação registrada!": "Participation enregistrée !",
  "Já participa deste sorteio.": "Participe déjà à ce tirage.",
  "Sorteio finalizado!": "Tirage finalisé !",

  // ---- Lotérica ----
  "Lotérica Ativa": "Loterie Active", "Vendas abiertas": "Ventes ouvertes",
  "Sorteio realizado": "Tirage effectué", "Finalizada": "Finalisée",
  "Configurando": "Configuration", "Vendidos": "Vendus",
  "Arrecadado Total": "Total Collecté",
  "Premio": "Prix", "Teve Ganhador!": "Nous avons un Gagnant !",
  "Ninguem acertou - Premio acumulou!": "Personne n'a trouvé - Prix accumulé !",
  "Finalizar Lotérica": "Finaliser la Loterie",
  "Vender Numero": "Vendre un Numéro", "Nome do Comprador": "Nom de l'Acheteur",
  "Vender": "Vendre", "Realizar Sorteio": "Effectuer le Tirage",
  "Loterica criada!": "Loterie créée !",
  "Nova Lotérica": "Nouvelle Loterie", "Configurar Lotérica": "Configurer la Loterie",
  "Criar Lotérica": "Créer la Loterie",
  "Nenhuma lotérica ativa. Crie uma nova acima.": "Aucune loterie active. Créez-en une ci-dessus.",
  "Nenhuma lotérica ativa no momento.": "Aucune loterie active pour le moment.",

  // ---- Empréstimos ----
  "Empréstimos": "Prêts",
  "Membro Especial": "Membre Spécial", "Membro Comum": "Membre Commun",
  "Não Contribuinte": "Non-Contributeur",
  "Calculadora de Empréstimo": "Calculatrice de Prêt",
  "Dias de Atraso": "Jours de Retard", "Total a Devolver": "Total à Rembourser",
  "itens": "objets", "Novo Empréstimo": "Nouveau Prêt",
  "Pendentes": "En attente", "Pagos": "Payés",
  "Nenhum empréstimo pendente.": "Aucun prêt en attente.",
  "Pendente": "En attente", "Pago": "Payé", "Atrasado": "En retard",
  "Pagar": "Payer", "Confirmar Pagamento": "Confirmer le Paiement",
  "Empréstimo registrado!": "Prêt enregistré !",
  "Pagamento registrado!": "Paiement enregistré !",
  "Empréstimo excluído!": "Prêt supprimé !",
  "Excluir empréstimo?": "Supprimer le prêt ?",

  // ---- Tabela ----
  "Tabela de Precos": "Table des Prix", "Tabela de Preços": "Table des Prix",
  "Reportar Precos": "Rapporter les Prix", "Reportar Preços": "Rapporter les Prix",
  "Alta": "Haute", "Media": "Moyenne", "Baixa": "Basse",
  "Comum": "Commun", "Incomum": "Peu commun", "Raro": "Rare",
  "Lendario": "Légendaire", "Demanda": "Demande", "Raridade": "Rareté",
  "Gerenciar Itens": "Gérer les Objets", "Reportar": "Rapporter",
  "Editar": "Modifier", "Restaurar": "Restaurer",
  "Nome do Item *": "Nom de l'Objet *", "Categoria *": "Catégorie *",
  "Selecionar...": "Sélectionner...", "Wiki Link": "Lien Wiki",
  "Adicionar Item": "Ajouter un Objet",

  // ---- Admin ----
  "Login Admin": "Connexion Admin", "Verificando...": "Vérification...",
  "Backup": "Sauvegarde", "Gerando...": "Génération...",
  "Senha incorreta!": "Mot de passe incorrect !",
  "Modo Admin ativado!": "Mode Admin activé !",
  "Continuar em Português": "Continuer en Portugais",
  "Traduzir o Site": "Traduire le Site",
  "Selecione seu idioma": "Sélectionnez votre langue",
  "Traduzir para": "Traduire en",
  "Traduzir site": "Traduire le site",

  // ---- Toasts / Messages ----
  "Registro adicionado!": "Enregistrement ajouté !",
  "Ordem atualizada!": "Ordre mis à jour !",
  "Preencha os obrigatórios.": "Remplissez les champs obligatoires.",
  "Preencha todos os campos.": "Remplissez tous les champs.",
  "Preencha nome e valor.": "Remplissez le nom et la valeur.",
  "Preencha o item e a quantidade.": "Remplissez l'objet et la quantité.",
  "Preencha todos.": "Remplissez tout.",
  "Remover?": "Supprimer ?",
  "Erro ao verificar senha.": "Erreur de vérification du mot de passe.",
  "Sem spam": "Pas de spam",
  "Respeite todos os participantes": "Respectez tous les participants",
  "Sem spam ou flood": "Pas de spam ni flood",

  // ---- Config Trocas ----
  "Configuração de Tabelas de Troca": "Configuration des Tables d'Échange",
  "Nova Regra": "Nouvelle Règle", "Se o player der...": "Si le joueur donne...",
  "Ele recebe...": "Il reçoit...", "Base": "Base", "Proporção": "Proportion",
  "Resultado": "Résultat", "Ações": "Actions",
  "Nenhuma regra configurada.": "Aucune règle configurée.",
  "Como funciona:": "Comment ça marche :",
  "Configuração salva!": "Configuration sauvegardée !",
};

const DE: Record<string, string> = {
  // ---- Tabs ----
  "Dashboard": "Übersicht", "Tabela": "Preistabelle", "Empréstimos": "Kredite",
  "Trocas": "Tausch", "Doadores": "Spender", "Leilões": "Auktionen",
  "Sorteios": "Verlosungen", "Lotérica": "Lotterie", "Investidores": "Investoren",
  "Config Trocas": "Tausch-Einstellungen",
  "Compras & Vendas": "Käufe & Verkäufe",
  "Estoque & Caixa": "Bestand & Kasse",

  // ---- Common ----
  "Carregando...": "Laden...", "Carregando dados do banco...": "Lade Bankdaten...",
  "Carregando chat...": "Lade Chat...", "Cancelar": "Abbrechen",
  "Entrar": "Anmelden", "Salvar": "Speichern", "Fechar": "Schließen",
  "Criar": "Erstellen", "Remover": "Entfernen", "Registrar": "Registrieren",
  "Buscar...": "Suchen...", "Buscar item...": "Gegenstand suchen...",
  "Buscar numero ou comprador...": "Nummer oder Käufer suchen...",
  "Nome": "Name", "Item": "Gegenstand", "Quantidade": "Menge",
  "Tipo": "Typ", "Data": "Datum", "Player": "Spieler",
  "Todos": "Alle", "Admin": "Admin", "Modo visual": "Ansichtsmodus",
  "total": "gesamt", "registros": "Einträge",
  "Observação": "Bemerkung", "Opcional": "Optional",
  "Dono": "Besitzer", "Moeda": "Währung", "Ganhador": "Gewinner",
  "Vencedor": "Gewinner", "Participantes": "Teilnehmer",
  "Criado": "Erstellt", "Qtd": "Menge", "Inicial": "Start",
  "Maior": "Höchstes", "Lances": "Gebote", "Taxa": "Gebühr",
  "Lucro": "Gewinn", "Bruto:": "Brutto:", "Descrição": "Beschreibung",
  "Origem": "Quelle", "Ação": "Aktion", "Disponível": "Verfügbar",
  "Disponivel": "Verfügbar",

  // ---- Dashboard ----
  "Empréstimos Pendentes": "Ausstehende Kredite", "Empréstimos Pagos": "Bezahlte Kredite",
  "Investidores Ativos": "Aktive Investoren", "Trocas Realizadas": "Durchgeführte Tausch",
  "Registros no Caixa": "Kasseneinträge", "Leilões Ativos": "Aktive Auktionen",
  "Sorteios Ativos": "Aktive Verlosungen", "Top 10 Doadores": "Top 10 Spender",
  "Top 10 Investidores": "Top 10 Investoren", "Top 10 Contribuintes": "Top 10 Beitragende",
  "Estoque do Banco": "Bankbestand", "Movimentos do Caixa": "Kassenbewegungen",
  "Eventos Ativos": "Aktive Veranstaltungen",
  "Nenhum doador cadastrado.": "Keine Spender registriert.",
  "Nenhum investidor cadastrado.": "Keine Investoren registriert.",
  "Nenhum item encontrado.": "Kein Gegenstand gefunden.",
  "Estoque vazio.": "Bestand leer.", "Nenhum registro ainda.": "Noch keine Einträge.",
  "desde": "seit", "contribuicoes": "Beiträge",

  // ---- Chat ----
  "Canais": "Kanäle", "Salas Privadas": "Private Räume",
  "Geral": "Allgemein", "Atendimento": "Support", "Guias": "Anleitungen",
  "Clãs": "Clans", "Comércio": "Handel",
  "Nenhuma mensagem ainda. Seja o primeiro a conversar!": "Noch keine Nachrichten. Sei der Erste!",
  "Nenhuma sala criada.": "Keine Räume erstellt.",
  "Nome da sala": "Raumname", "Senha (opcional)": "Passwort (optional)",
  "Senha da sala": "Raumpasswort", "Sala Privada": "Privater Raum",
  "requer senha": "erfordert Passwort", "Voltar": "Zurück",
  "Hoje": "Heute", "Ontem": "Gestern", "Membro": "Mitglied",
  "Regras:": "Regeln:", "por": "von",
  "Digite seu nome para entrar no chat.": "Gib deinen Namen ein, um den Chat zu betreten.",
  "Seu nome no jogo": "Dein Spielname",
  "Nenhuma mensagem ainda.": "Noch keine Nachrichten.",
  "Sala": "Raum", "Mensagem": "Nachricht",
  "Evento": "Veranstaltung", "Sobreviventes": "Überlebende",
  "Deletar sala": "Raum löschen", "Deletar mensagem?": "Nachricht löschen?",

  // ---- Doadores ----
  "❤️ Doadores": "❤️ Spender",
  "Ranking": "Rangliste", "Reordenar": "Neu ordnen",
  "Nova Doação": "Neue Spende", "Registrar Doação": "Spende registrieren",
  "Histórico": "Verlauf", "Nenhuma doação.": "Keine Spenden.",
  "Doação registrada!": "Spende registriert!",
  "Excluir a doação de": "Spende löschen von",
  "Excluir doação de": "Spende löschen von",

  // ---- Investidores ----
  "💎 Membros Investidores": "💎 Investor-Mitglieder",
  "Benefício:": "Vorteil:",
  "em empréstimos e trocas": "bei Krediten und Tausch",
  "comum": "gewöhnlich",
  "Como obter a tag?": "Wie bekommt man das Tag?",
  "Ajude o banco — doando itens, fazendo trocas ou de qualquer outra forma.": "Helfen Sie der Bank — durch Spenden, Tausch oder anders.",
  "Adicionar Investidor": "Investor hinzufügen", "Nome do investidor": "Name des Investors",
  "Adicionar": "Hinzufügen", "Ativos": "Aktiv",
  "Nenhum investidor.": "Keine Investoren.",
  "Valor Investido": "Investierter Wert", "Data Entrada": "Eintrittsdatum",
  "Novo Investidor": "Neuer Investor", "Editar Investidor": "Investor bearbeiten",
  "Status": "Status", "Ativo": "Aktiv", "Inativo": "Inaktiv",
  "Investidor cadastrado!": "Investor registriert!",
  "Investidor adicionado!": "Investor hinzugefügt!",

  // ---- Trocas ----
  "Registro de Trocas": "Tausch-Register", "Nova Troca": "Neuer Tausch",
  "Selecione": "Auswählen", "Nenhuma tabela": "Keine Tabelle",
  "Preencha o formulário ao lado.": "Füllen Sie das Formular aus.",
  "sem taxa": "ohne Gebühr", "Player Receibe:": "Spieler erhält:",
  "Player entregou:": "Spieler gab:",
  "Sai do estoque do Banco:": "Verlässt Bankbestand:",
  "Entra no estoque do Banco:": "Geht in Bankbestand:",
  "Entregou": "Gegeben", "Recebeu / Entrou no estoque": "Erhalten / In Bestand eingegangen",
  "Recibido / Entrou no estoque": "Erhalten / In Bestand eingegangen",
  "Calculadora": "Rechner",
  "Troca registrada!": "Tausch registriert!",
  "Excluir troca e estornar estoque": "Tausch löschen und Bestand zurücksetzen",
  "Troca excluída e estoque estornado.": "Tausch gelöscht und Bestand zurückgesetzt.",
  "Não foi possível excluir a troca.": "Tausch konnte nicht gelöscht werden.",
  "Excluir a troca de": "Tausch löschen von",
  "Excluir a troca": "Tausch löschen",
  "Registrar Troca": "Tausch registrieren",
  "Especial (0%)": "Spezial (0%)", "Top 10 (5%)": "Top 10 (5%)",
  "Investidor (10%)": "Investor (10%)", "Comum (15%)": "Gewöhnlich (15%)",
  "Não Contribuinte (20%)": "Nicht-Beitragender (20%)",
  "Banco (100%)": "Bank (100%)",
  "⭐ Especial (0%)": "⭐ Spezial (0%)",
  "👑 Top 10 Investidor (5%)": "👑 Top 10 Investor (5%)",
  "💎 Investidor (10%)": "💎 Investor (10%)",
  "👤 Comum (15%)": "👤 Gewöhnlich (15%)",
  "⚠️ Não Contribuinte (20%)": "⚠️ Nicht-Beitragender (20%)",

  // ---- Compras & Vendas ----
  "🛒 Compras e Vendas": "🛒 Käufe & Verkäufe",
  "COMPRA:": "KAUF:", "VENDA:": "VERKAUF:",
  "Entra": "Geht ein", "Sai": "Geht raus", "Paga": "Zahlt", "Recebe": "Erhält",
  "Compras": "Käufe", "Vendas": "Verkäufe",
  "Nenhuma compra ou venda.": "Keine Käufe oder Verkäufe.",
  "Registrar Compra": "Kauf registrieren", "Registrar Venda": "Verkauf registrieren",
  "Compra registrada!": "Kauf registriert!", "Venda registrada!": "Verkauf registriert!",

  // ---- Caixa ----
  "💰 Caixa do Banco": "💰 Bankkasse",
  "Saída por Leilão do Banco (100%)": "Bank-Auktion Ausgang (100%)",
  "Registro Manual": "Manuelle Erfassung",
  "ENTRADA": "EINNAHME", "SAÍDA": "AUSGABE",
  "Entrada": "Einnahme", "Saída": "Ausgabe",
  "Nome do jogador": "Name des Spielers",
  "Registrar Saída": "Ausgabe erfassen", "Registrar Prêmio": "Preis erfassen",
  "Estoque Atual": "Aktueller Bestand", "BAIXO": "NIEDRIG",
  "Resetar": "Zurücksetzen", "Resetar TUDO?": "ALLES zurücksetzen?",
  "📦 ENTRADA": "📦 EINNAHME", "📤 SAÍDA": "📤 AUSGABE",
  "Nenhum registro.": "Keine Einträge.",

  // ---- Leilões ----
  "🔨 Leilões": "🔨 Auktionen", "Como Funciona": "So funktioniert's",
  "Novo Leilão": "Neue Auktion", "Criar Leilão": "Auktion erstellen",
  "Duração": "Dauer", "Fila de Espera": "Warteschlange",
  "EM ESPERA": "WARTEND", "Nenhum leilão ativo.": "Keine aktiven Auktionen.",
  "Dar Lance": "Bieten", "Finalizar Entrega": "Lieferung abschließen",
  "Histórico de Ganhadores": "Gewinnerhistorie",
  "Leilão criado!": "Auktion erstellt!",
  "Lance deve ser > ": "Gebot muss > sein ",
  "Lance de ": "Gebot von ", " registrado!": " registriert!",

  // ---- Sorteios ----
  "Novo Sorteio": "Neue Verlosung", "Nenhum.": "Keine.",
  "Participar": "Teilnehmen", "Sortear": "Ziehen",
  "Encerrado": "Beendet", "ENCERRADO": "BEENDET",
  "Sorteio criado!": "Verlosung erstellt!", "Participando!": "Teilnahme!",
  "Historico de Ganhadores": "Verlosungshistorie",
  "Data do Sorteio": "Verlosungsdatum", "Todos os Participantes": "Alle Teilnehmer",
  "Nenhum": "Keine", "Participar do Sorteio": "An der Verlosung teilnehmen",
  "Participação registrada!": "Teilnahme registriert!",
  "Sorteio finalizado!": "Verlosung abgeschlossen!",

  // ---- Lotérica ----
  "Lotérica Ativa": "Aktive Lotterie", "Vendas abiertas": "Verkauf offen",
  "Sorteio realizado": "Ziehung durchgeführt", "Finalizada": "Abgeschlossen",
  "Configurando": "Konfiguration", "Vendidos": "Verkauft",
  "Arrecadado Total": "Gesamt eingenommen",
  "Premio": "Preis", "Teve Ganhador!": "Wir haben einen Gewinner!",
  "Ninguem acertou - Premio acumulou!": "Niemand richtig - Preis akkumuliert!",
  "Finalizar Lotérica": "Lotterie abschließen",
  "Vender Numero": "Nummer verkaufen", "Nome do Comprador": "Käufername",
  "Vender": "Verkaufen", "Realizar Sorteio": "Ziehung durchführen",
  "Loterica criada!": "Lotterie erstellt!",
  "Nova Lotérica": "Neue Lotterie", "Configurar Lotérica": "Lotterie konfigurieren",
  "Criar Lotérica": "Lotterie erstellen",
  "Nenhuma lotérica ativa. Crie uma nova acima.": "Keine aktive Lotterie. Erstelle eine neue oben.",

  // ---- Empréstimos ----
  "Empréstimos": "Kredite",
  "Regras do Banco": "Bankregeln",
  "Não Contribuinte": "Nicht-Beitragender",
  "Calculadora de Empréstimo": "Kreditrechner",
  "Dias de Atraso": "Überziehungstage", "Total a Devolver": "Gesamt zurückzuzahlen",
  "itens": "Gegenstände", "Novo Empréstimo": "Neuer Kredit",
  "Pendentes": "Ausstehend", "Pagos": "Bezahlt",
  "Nenhum empréstimo pendente.": "Keine ausstehenden Kredite.",
  "Pendente": "Ausstehend", "Pago": "Bezahlt", "Atrasado": "Überfällig",
  "Pagar": "Bezahlen", "Confirmar Pagamento": "Zahlung bestätigen",
  "Empréstimo registrado!": "Kredit registriert!",
  "Pagamento registrado!": "Zahlung registriert!",
  "Empréstimo excluído!": "Kredit gelöscht!",
  "Excluir empréstimo?": "Kredit löschen?",

  // ---- Tabela ----
  "Tabela de Precos": "Preistabelle", "Tabela de Preços": "Preistabelle",
  "Reportar Precos": "Preise melden", "Reportar Preços": "Preise melden",
  "Alta": "Hoch", "Media": "Mittel", "Baixa": "Niedrig",
  "Comum": "Gewöhnlich", "Incomum": "Ungewöhnlich", "Raro": "Selten",
  "Lendario": "Legendär", "Demanda": "Nachfrage", "Raridade": "Seltenheit",
  "Gerenciar Itens": "Gegenstände verwalten", "Reportar": "Melden",
  "Editar": "Bearbeiten", "Restaurar": "Wiederherstellen",
  "Nome do Item *": "Gegenstandname *", "Categoria *": "Kategorie *",
  "Selecionar...": "Auswählen...", "Wiki Link": "Wiki-Link",
  "Adicionar Item": "Gegenstand hinzufügen",

  // ---- Admin ----
  "Login Admin": "Admin-Anmeldung",
  "Verificando...": "Überprüfung...", "Backup": "Sicherung",
  "Senha incorreta!": "Falsches Passwort!",
  "Modo Admin ativado!": "Admin-Modus aktiviert!",
  "Continuar em Português": "Auf Portugiesisch fortfahren",
  "Traduzir o Site": "Seite übersetzen",
  "Selecione seu idioma": "Wählen Sie Ihre Sprache",
  "Traduzir para": "Übersetzen nach",
  "Traduzir site": "Seite übersetzen",

  // ---- Toasts / Messages ----
  "Registro adicionado!": "Eintrag hinzugefügt!",
  "Ordem atualizada!": "Reihenfolge aktualisiert!",
  "Preencha os obrigatórios.": "Pflichtfelder ausfüllen.",
  "Preencha todos os campos.": "Alle Felder ausfüllen.",
  "Preencha nome e valor.": "Name und Wert ausfüllen.",
  "Preencha o item e a quantidade.": "Gegenstand und Menge ausfüllen.",
  "Preencha todos.": "Alles ausfüllen.",
  "Remover?": "Entfernen?",
  "Erro ao verificar senha.": "Fehler bei Passwortprüfung.",
  "Sem spam": "Kein Spam",
  "Respeite todos os participantes": "Respektiere alle Teilnehmer",
  "Sem spam ou flood": "Kein Spam oder Flood",

  // ---- Config Trocas ----
  "Configuração de Tabelas de Troca": "Tausch-Tabellen Konfiguration",
  "Nova Regra": "Neue Regel",
  "Nenhuma regra configurada.": "Keine Regeln konfiguriert.",
  "Como funciona:": "So funktioniert's:",
  "Configuração salva!": "Konfiguration gespeichert!",
};

const RU: Record<string, string> = {
  // ---- Tabs ----
  "Dashboard": "Панель", "Tabela": "Таблица цен", "Empréstimos": "Займы",
  "Trocas": "Обмены", "Doadores": "Дарители", "Leilões": "Аукционы",
  "Sorteios": "Розыгрыши", "Lotérica": "Лотерея", "Investidores": "Инвесторы",
  "Config Trocas": "Настройки обмена",
  "Compras & Vendas": "Покупки и Продажи",
  "Estoque & Caixa": "Склад и Касса",

  // ---- Common ----
  "Carregando...": "Загрузка...", "Carregando dados do banco...": "Загрузка данных банка...",
  "Carregando chat...": "Загрузка чата...", "Cancelar": "Отмена",
  "Entrar": "Войти", "Salvar": "Сохранить", "Fechar": "Закрыть",
  "Criar": "Создать", "Remover": "Удалить", "Registrar": "Зарегистрировать",
  "Buscar...": "Поиск...", "Buscar item...": "Поиск предмета...",
  "Buscar numero ou comprador...": "Поиск номера или покупателя...",
  "Nome": "Имя", "Item": "Предмет", "Quantidade": "Количество",
  "Tipo": "Тип", "Data": "Дата", "Player": "Игрок",
  "Todos": "Все", "Admin": "Админ", "Modo visual": "Режим просмотра",
  "total": "всего", "registros": "записей",
  "Observação": "Примечание", "Opcional": "Необязательно",
  "Dono": "Владелец", "Moeda": "Валюта", "Ganhador": "Победитель",
  "Vencedor": "Победитель", "Participantes": "Участники",
  "Criado": "Создано", "Qtd": "Кол-во", "Inicial": "Начальная",
  "Maior": "Наиб.", "Lances": "Ставки", "Taxa": "Комиссия",
  "Lucro": "Прибыль", "Bruto:": "Брутто:", "Descrição": "Описание",
  "Origem": "Источник", "Ação": "Действие", "Disponível": "Доступно",
  "Disponivel": "Доступно",

  // ---- Dashboard ----
  "Empréstimos Pendentes": "Ожидающие займы", "Empréstimos Pagos": "Оплаченные займы",
  "Investidores Ativos": "Активные инвесторы", "Trocas Realizadas": "Проведённые обмены",
  "Registros no Caixa": "Записи в кассе", "Leilões Ativos": "Активные аукционы",
  "Sorteios Ativos": "Активные розыгрыши", "Top 10 Doadores": "Топ-10 Дарителей",
  "Top 10 Investidores": "Топ-10 Инвесторов", "Top 10 Contribuintes": "Топ-10 Участников",
  "Estoque do Banco": "Склад Банка", "Movimentos do Caixa": "Движения Кассы",
  "Eventos Ativos": "Активные события",
  "Nenhum doador cadastrado.": "Нет зарегистрированных дарителей.",
  "Nenhum investidor cadastrado.": "Нет зарегистрированных инвесторов.",
  "Nenhum item encontrado.": "Предмет не найден.",
  "Estoque vazio.": "Склад пуст.", "Nenhum registro ainda.": "Пока нет записей.",
  "desde": "с", "contribuicoes": "взносы",

  // ---- Chat ----
  "Canais": "Каналы", "Salas Privadas": "Приватные комнаты",
  "Geral": "Общий", "Atendimento": "Поддержка", "Guias": "Гайды",
  "Clãs": "Кланы", "Comércio": "Торговля",
  "Nenhuma mensagem ainda. Seja o primeiro a conversar!": "Пока нет сообщений. Будь первым!",
  "Nenhuma sala criada.": "Нет созданных комнат.",
  "Nome da sala": "Название комнаты", "Senha (opcional)": "Пароль (необязательно)",
  "Senha da sala": "Пароль комнаты", "Sala Privada": "Приватная комната",
  "requer senha": "требует пароль", "Voltar": "Назад",
  "Hoje": "Сегодня", "Ontem": "Вчера", "Membro": "Участник",
  "Regras:": "Правила:", "por": "от",
  "Digite seu nome para entrar no chat.": "Введите имя, чтобы войти в чат.",
  "Seu nome no jogo": "Ваше имя в игре",
  "Nenhuma mensagem ainda.": "Пока нет сообщений.",
  "Sala": "Комната", "Mensagem": "Сообщение",
  "Evento": "Событие", "Sobreviventes": "Выжившие",
  "Deletar sala": "Удалить комнату", "Deletar mensagem?": "Удалить сообщение?",

  // ---- Doadores ----
  "❤️ Doadores": "❤️ Дарители",
  "Ranking": "Рейтинг", "Reordenar": "Переупорядочить",
  "Nova Doação": "Новое пожертвование", "Registrar Doação": "Зарегистрировать",
  "Histórico": "История", "Nenhuma doação.": "Нет пожертвований.",
  "Doação registrada!": "Пожертвование зарегистрировано!",
  "Excluir a doação de": "Удалить пожертвование от",
  "Excluir doação de": "Удалить пожертвование от",

  // ---- Investidores ----
  "💎 Membros Investidores": "💎 Инвесторы-участники",
  "Benefício:": "Преимущество:",
  "em empréstimos e trocas": "по займам и обменам",
  "comum": "обычный",
  "Como obter a tag?": "Как получить тег?",
  "Ajude o banco — doando itens, fazendo trocas ou de qualquer outra forma.": "Помогите банку — жертвуя предметы, совершая обмены или иначе.",
  "Adicionar Investidor": "Добавить инвестора", "Nome do investidor": "Имя инвестора",
  "Adicionar": "Добавить", "Ativos": "Активные",
  "Nenhum investidor.": "Нет инвесторов.",
  "Valor Investido": "Инвестированная сумма", "Data Entrada": "Дата входа",
  "Novo Investidor": "Новый инвестор", "Editar Investidor": "Редактировать инвестора",
  "Status": "Статус", "Ativo": "Активен", "Inativo": "Неактивен",
  "Investidor cadastrado!": "Инвестор зарегистрирован!",
  "Investidor adicionado!": "Инвестор добавлен!",

  // ---- Trocas ----
  "Registro de Trocas": "Реестр обменов", "Nova Troca": "Новый обмен",
  "Selecione": "Выберите", "Nenhuma tabela": "Нет таблицы",
  "Preencha o formulário ao lado.": "Заполните форму рядом.",
  "sem taxa": "без комиссии", "Player Receibe:": "Игрок получает:",
  "Player entregou:": "Игрок отдал:",
  "Sai do estoque do Banco:": "Выходит со склада Банка:",
  "Entra no estoque do Banco:": "Входит на склад Банка:",
  "Entregou": "Отдал", "Recebeu / Entrou no estoque": "Получил / Поступил на склад",
  "Recibido / Entrou no estoque": "Получено / Поступило на склад",
  "Calculadora": "Калькулятор",
  "Troca registrada!": "Обмен зарегистрирован!",
  "Excluir troca e estornar estoque": "Удалить обмен и восстановить склад",
  "Troca excluída e estoque estornado.": "Обмен удалён и склад восстановлен.",
  "Não foi possível excluir a troca.": "Не удалось удалить обмен.",
  "Excluir a troca de": "Удалить обмен от",
  "Excluir a troca": "Удалить обмен",
  "Registrar Troca": "Зарегистрировать обмен",
  "Especial (0%)": "Специальный (0%)", "Top 10 (5%)": "Топ-10 (5%)",
  "Investidor (10%)": "Инвестор (10%)", "Comum (15%)": "Обычный (15%)",
  "Não Contribuinte (20%)": "Не участник (20%)",
  "Banco (100%)": "Банк (100%)",
  "⭐ Especial (0%)": "⭐ Специальный (0%)",
  "👑 Top 10 Investidor (5%)": "👑 Топ-10 Инвестор (5%)",
  "💎 Investidor (10%)": "💎 Инвестор (10%)",
  "👤 Comum (15%)": "👤 Обычный (15%)",
  "⚠️ Não Contribuinte (20%)": "⚠️ Не участник (20%)",

  // ---- Compras & Vendas ----
  "🛒 Compras e Vendas": "🛒 Покупки и Продажи",
  "COMPRA:": "ПОКУПКА:", "VENDA:": "ПРОДАЖА:",
  "Entra": "Входит", "Sai": "Уходит", "Paga": "Платит", "Recebe": "Получает",
  "Compras": "Покупки", "Vendas": "Продажи",
  "Nenhuma compra ou venda.": "Нет покупок или продаж.",
  "Registrar Compra": "Зарегистрировать покупку", "Registrar Venda": "Зарегистрировать продажу",
  "Compra registrada!": "Покупка зарегистрирована!", "Venda registrada!": "Продажа зарегистрирована!",

  // ---- Caixa ----
  "💰 Caixa do Banco": "💰 Касса Банка",
  "Saída por Leilão do Banco (100%)": "Расход на аукцион Банка (100%)",
  "Registro Manual": "Ручная запись",
  "ENTRADA": "ДОХОД", "SAÍDA": "РАСХОД",
  "Entrada": "Доход", "Saída": "Расход",
  "Nome do jogador": "Имя игрока",
  "Registrar Saída": "Зарегистрировать расход", "Registrar Prêmio": "Зарегистрировать приз",
  "Estoque Atual": "Текущий склад", "BAIXO": "НИЗКО",
  "Resetar": "Сбросить", "Resetar TUDO?": "Сбросить ВСЁ?",
  "📦 ENTRADA": "📦 ДОХОД", "📤 SAÍDA": "📤 РАСХОД",
  "Nenhum registro.": "Нет записей.",

  // ---- Leilões ----
  "🔨 Leilões": "🔨 Аукционы", "Como Funciona": "Как это работает",
  "Novo Leilão": "Новый аукцион", "Criar Leilão": "Создать аукцион",
  "Duração": "Длительность", "Fila de Espera": "Очередь ожидания",
  "EM ESPERA": "ОЖИДАНИЕ", "Nenhum leilão ativo.": "Нет активных аукционов.",
  "Dar Lance": "Сделать ставку",
  "Finalizar Entrega": "Завершить доставку",
  "Histórico de Ganhadores": "История Победителей",
  "Leilão criado!": "Аукцион создан!",
  "Lance deve ser > ": "Ставка должна быть > ",
  "Lance de ": "Ставка ", " registrado!": " зарегистрирована!",

  // ---- Sorteios ----
  "Novo Sorteio": "Новый розыгрыш", "Nenhum.": "Нет.",
  "Participar": "Участвовать", "Sortear": "Розыграть",
  "Encerrado": "Завершено", "ENCERRADO": "ЗАВЕРШЕНО",
  "Sorteio criado!": "Розыгрыш создан!", "Participando!": "Участие!",
  "Historico de Ganhadores": "История розыгрышей",
  "Data do Sorteio": "Дата розыгрыша", "Todos os Participantes": "Все участники",
  "Nenhum": "Нет", "Participar do Sorteio": "Участвовать в розыгрыше",
  "Participação registrada!": "Участие зарегистрировано!",
  "Sorteio finalizado!": "Розыгрыш завершён!",

  // ---- Lotérica ----
  "Lotérica Ativa": "Активная лотерея", "Vendas abiertas": "Продажи открыты",
  "Sorteio realizado": "Розыгрыш проведён", "Finalizada": "Завершена",
  "Configurando": "Настройка", "Vendidos": "Продано",
  "Arrecadado Total": "Всего собрано",
  "Premio": "Приз", "Teve Ganhador!": "Есть Победитель!",
  "Ninguem acertou - Premio acumulou!": "Никто не угадал - Приз накопился!",
  "Finalizar Lotérica": "Завершить лотерею",
  "Vender Numero": "Продать номер", "Nome do Comprador": "Имя покупателя",
  "Vender": "Продать", "Realizar Sorteio": "Провести розыгрыш",
  "Loterica criada!": "Лотерея создана!",
  "Nova Lotérica": "Новая лотерея", "Configurar Lotérica": "Настроить лотерею",
  "Criar Lotérica": "Создать лотерею",
  "Nenhuma lotérica ativa. Crie uma nova acima.": "Нет активной лотереи. Создайте новую выше.",

  // ---- Empréstimos ----
  "Empréstimos": "Займы",
  "Regras do Banco": "Правила Банка",
  "Membro Especial": "Специальный участник", "Membro Comum": "Обычный участник",
  "Calculadora de Empréstimo": "Калькулятор займа",
  "Dias de Atraso": "Дней просрочки", "Total a Devolver": "Итого к возврату",
  "itens": "предметы", "Novo Empréstimo": "Новый заём",
  "Pendentes": "Ожидающие", "Pagos": "Оплаченные",
  "Nenhum empréstimo pendente.": "Нет невыданных займов.",
  "Pendente": "Ожидает", "Pago": "Выплачен", "Atrasado": "Просрочен",
  "Pagar": "Оплатить", "Confirmar Pagamento": "Подтвердить оплату",
  "Empréstimo registrado!": "Заём зарегистрирован!",
  "Pagamento registrado!": "Оплата зарегистрирована!",
  "Empréstimo excluído!": "Заём удалён!",
  "Excluir empréstimo?": "Удалить заём?",

  // ---- Tabela ----
  "Tabela de Precos": "Таблица цен", "Tabela de Preços": "Таблица цен",
  "Reportar Precos": "Сообщить цены", "Reportar Preços": "Сообщить цены",
  "Alta": "Высокий", "Media": "Средний", "Baixa": "Низкий",
  "Comum": "Обычный", "Incomum": "Необычный", "Raro": "Редкий",
  "Lendario": "Легендарный", "Demanda": "Спрос", "Raridade": "Редкость",
  "Gerenciar Itens": "Управление предметами", "Reportar": "Сообщить",
  "Editar": "Редактировать", "Restaurar": "Восстановить",
  "Nome do Item *": "Название предмета *", "Categoria *": "Категория *",
  "Selecionar...": "Выбрать...", "Wiki Link": "Ссылка на Wiki",
  "Adicionar Item": "Добавить предмет",

  // ---- Admin ----
  "Login Admin": "Вход Админа",
  "Verificando...": "Проверка...", "Backup": "Бэкап",
  "Senha incorreta!": "Неверный пароль!",
  "Modo Admin ativado!": "Режим Админа включён!",
  "Continuar em Português": "Продолжить на португальском",
  "Traduzir o Site": "Перевести сайт",
  "Selecione seu idioma": "Выберите язык",
  "Traduzir para": "Перевести на",
  "Traduzir site": "Перевести сайт",

  // ---- Toasts / Messages ----
  "Registro adicionado!": "Запись добавлена!",
  "Ordem atualizada!": "Порядок обновлён!",
  "Preencha os obrigatórios.": "Заполните обязательные поля.",
  "Preencha todos os campos.": "Заполните все поля.",
  "Preencha nome e valor.": "Заполните имя и значение.",
  "Preencha o item e a quantidade.": "Заполните предмет и количество.",
  "Preencha todos.": "Заполните всё.",
  "Remover?": "Удалить?",
  "Erro ao verificar senha.": "Ошибка проверки пароля.",
  "Sem spam": "Без спама",
  "Respeite todos os participantes": "Уважайте всех участников",
  "Sem spam ou flood": "Без спама и флуда",

  // ---- Config Trocas ----
  "Configuração de Tabelas de Troca": "Настройка таблиц обмена",
  "Nova Regra": "Новое правило",
  "Nenhuma regra configurada.": "Нет настроенных правил.",
  "Como funciona:": "Как это работает:",
  "Configuração salva!": "Конфигурация сохранена!",
};

const IT: Record<string, string> = {
  // ---- Tabs ----
  "Dashboard": "Cruscotto", "Tabela": "Tabella Prezzi", "Empréstimos": "Prestiti",
  "Trocas": "Scambi", "Doadores": "Donatori", "Leilões": "Aste",
  "Sorteios": "Estrazioni", "Lotérica": "Loteria", "Investidores": "Investitori",
  "Config Trocas": "Config. Scambi", "Compras & Vendas": "Acquisti e Vendite",
  "Estoque & Caixa": "Magazzino e Cassa", "Chat": "Chat",
  // ---- Common ----
  "Carregando...": "Caricamento...", "Carregando dados do banco...": "Caricamento dati banca...",
  "Cancelar": "Annulla", "Entrar": "Entra", "Salvar": "Salva", "Fechar": "Chiudi",
  "Criar": "Crea", "Remover": "Rimuovi", "Registrar": "Registra",
  "Buscar...": "Cerca...", "Buscar item...": "Cerca oggetto...",
  "Nome": "Nome", "Item": "Oggetto", "Quantidade": "Quantità",
  "Tipo": "Tipo", "Data": "Data", "Player": "Giocatore",
  "Todos": "Tutti", "Admin": "Admin", "Modo visual": "Modalità visuale",
  "total": "totale", "registros": "registri",
  "Observação": "Nota", "Opcional": "Opzionale",
  "Dono": "Proprietario", "Moeda": "Valuta", "Ganhador": "Vincitore",
  "Vencedor": "Vincitore", "Participantes": "Partecipanti",
  "Qtd": "Qtà", "Inicial": "Iniziale", "Maior": "Più alto",
  "Lances": "Offerte", "Taxa": "Commissione", "Lucro": "Profitto",
  "Bruto:": "Lordo:", "Descrição": "Descrizione", "Origem": "Origine",
  "Ação": "Azione", "Disponível": "Disponibile", "Disponivel": "Disponibile",
  // ---- Dashboard ----
  "Empréstimos Pendentes": "Prestiti in sospeso", "Empréstimos Pagos": "Prestiti pagati",
  "Investidores Ativos": "Investitori attivi", "Trocas Realizadas": "Scambi effettuati",
  "Registros no Caixa": "Registri in cassa", "Leilões Ativos": "Aste attive",
  "Sorteios Ativos": "Estrazioni attive", "Top 10 Doadores": "Top 10 Donatori",
  "Top 10 Investidores": "Top 10 Investitori", "Top 10 Contribuintes": "Top 10 Contributori",
  "Estoque do Banco": "Magazzino della Banca", "Movimentos do Caixa": "Movimenti di Cassa",
  "Eventos Ativos": "Eventi attivi",
  "Nenhum doador cadastrado.": "Nessun donatore registrato.",
  "Nenhum investidor cadastrado.": "Nessun investitore registrato.",
  "Nenhum contribuinte ainda. Contribua reportando precos na aba Tabela!": "Nessun contributore ancora. Contribuisci segnalando i prezzi nella scheda Tabella!",
  "Nenhum item encontrado.": "Nessun oggetto trovato.",
  "Estoque vazio.": "Magazzino vuoto.", "Nenhum registro ainda.": "Nessun registro ancora.",
  "desde": "dal", "contribuicoes": "contributi",
  "Posto de Trocas": "Posto di Scambio",
  "Sistema de gestao para sobreviventes": "Sistema di gestione per sopravvissuti",
  // ---- Chat ----
  "Canais": "Canali", "Salas Privadas": "Stanze Private",
  "Geral": "Generale", "Atendimento": "Supporto", "Guias": "Guide",
  "Clãs": "Clan", "Comércio": "Commercio",
  "Nenhuma mensagem ainda. Seja o primeiro a conversar!": "Nessun messaggio ancora. Sii il primo!",
  "Nenhuma sala criada.": "Nessuna stanza creata.",
  "Nome da sala": "Nome della stanza", "Senha (opcional)": "Password (opzionale)",
  "Senha da sala": "Password della stanza", "Sala Privada": "Stanza Privata",
  "requer senha": "richiede password", "Voltar": "Indietro",
  "Hoje": "Oggi", "Ontem": "Ieri", "Membro": "Membro",
  "Regras:": "Regole:", "por": "di",
  "Digite seu nome para entrar no chat.": "Inserisci il tuo nome per entrare in chat.",
  "Seu nome no jogo": "Il tuo nome nel gioco",
  "Nenhuma mensagem ainda.": "Nessun messaggio ancora.",
  "Sala": "Stanza", "Mensagem": "Messaggio",
  "Evento": "Evento", "Sobreviventes": "Sopravvissuti",
  "Deletar sala": "Elimina stanza", "Deletar mensagem?": "Eliminare messaggio?",
  // ---- Doadores ----
  "❤️ Doadores": "❤️ Donatori",
  "Ranking": "Classifica", "Reordenar": "Riordina",
  "Nova Doação": "Nuova Donazione", "Registrar Doação": "Registra Donazione",
  "Histórico": "Cronologia", "Nenhuma doação.": "Nessuna donazione.",
  "Doação registrada!": "Donazione registrata!",
  "Excluir a doação de": "Elimina donazione di",
  // ---- Investidores ----
  "💎 Membros Investidores": "💎 Membri Investitori",
  "Benefício:": "Vantaggio:",
  "em empréstimos e trocas": "su prestiti e scambi",
  "comum": "comune",
  "Como obter a tag?": "Come ottenere il tag?",
  "Ajude o banco — doando itens, fazendo trocas ou de qualquer outra forma.": "Aiuta la banca — donando oggetti, facendo scambi o in altro modo.",
  "Adicionar Investidor": "Aggiungi Investitore", "Nome do investidor": "Nome dell'investitore",
  "Adicionar": "Aggiungi", "Ativos": "Attivi",
  "Nenhum investidor.": "Nessun investitore.",
  "Valor Investido": "Valore Investito", "Data Entrada": "Data Ingresso",
  "Novo Investidor": "Nuovo Investitore", "Editar Investidor": "Modifica Investitore",
  "Status": "Stato", "Ativo": "Attivo", "Inativo": "Inattivo",
  "Investidor cadastrado!": "Investitore registrato!",
  "Investidor adicionado!": "Investitore aggiunto!",
  // ---- Trocas ----
  "Registro de Trocas": "Registro Scambi", "Nova Troca": "Nuovo Scambio",
  "Selecione": "Seleziona", "sem taxa": "senza commissione",
  "Player Receibe:": "Giocatore Riceve:", "Player entregou:": "Giocatore ha consegnato:",
  "Sai do estoque do Banco:": "Esce dal magazzino della Banca:",
  "Entra no estoque do Banco:": "Entra nel magazzino della Banca:",
  "Entregou": "Consegnato", "Recebeu / Entrou no estoque": "Ricevuto / Entrato in magazzino",
  "Recibido / Entrou no estoque": "Ricevuto / Entrato in magazzino",
  "Calculadora": "Calcolatrice", "Troca registrada!": "Scambio registrato!",
  "Excluir troca e estornar estoque": "Elimina scambio e ripristina magazzino",
  "Excluir a troca": "Elimina lo scambio",
  "Registrar Troca": "Registra Scambio",
  "Especial (0%)": "Speciale (0%)", "Top 10 (5%)": "Top 10 (5%)",
  "Investidor (10%)": "Investitore (10%)", "Comum (15%)": "Comune (15%)",
  "Não Contribuinte (20%)": "Non Contributore (20%)",
  "Banco (100% — troca interna)": "Banca (100% — scambio interno)",
  "Banco (100%)": "Banca (100%)", "Banco (100%):": "Banca (100%):",
  "⭐ Especial (0%)": "⭐ Speciale (0%)",
  "👑 Top 10 Investidor (5%)": "👑 Top 10 Investitore (5%)",
  "💎 Investidor (10%)": "💎 Investitore (10%)",
  "👤 Comum (15%)": "👤 Comune (15%)",
  "⚠️ Não Contribuinte (20%)": "⚠️ Non Contributore (20%)",
  // ---- Compras & Vendas ----
  "🛒 Compras e Vendas": "🛒 Acquisti e Vendite",
  "COMPRA:": "ACQUISTO:", "VENDA:": "VENDITA:",
  "Entra": "Entra", "Sai": "Esce", "Paga": "Paga", "Recebe": "Riceve",
  "Compras": "Acquisti", "Vendas": "Vendite",
  "Nenhuma compra ou venda.": "Nessun acquisto o vendita.",
  "Registrar Compra": "Registra Acquisto", "Registrar Venda": "Registra Vendita",
  "Compra registrada!": "Acquisto registrato!", "Venda registrada!": "Vendita registrata!",
  // ---- Caixa ----
  "💰 Caixa do Banco": "💰 Cassa della Banca",
  "ENTRADA": "ENTRATA", "SAÍDA": "USCITA",
  "Entrada": "Entrata", "Saída": "Uscita",
  "Registro Manual": "Registrazione Manuale",
  "Nome do jogador": "Nome del giocatore",
  "Estoque Atual": "Magazzino Attuale", "BAIXO": "BASSO",
  "Resetar": "Resetta", "Resetar TUDO?": "Resettare TUTTO?",
  "📦 ENTRADA": "📦 ENTRATA", "📤 SAÍDA": "📤 USCITA",
  "Nenhum registro.": "Nessun registro.",
  // ---- Leilões ----
  "🔨 Leilões": "🔨 Aste", "Como Funciona": "Come Funziona",
  "Novo Leilão": "Nuova Asta", "Criar Leilão": "Crea Asta",
  "Duração": "Durata", "Fila de Espera": "Coda d'attesa",
  "EM ESPERA": "IN ATTESA", "Nenhum leilão ativo.": "Nessun'asta attiva.",
  "Dar Lance": "Fai Offerta", "Finalizar Entrega": "Finalizza Consegna",
  "Histórico de Ganhadores": "Cronologia Vincitori",
  "Leilão criado!": "Asta creata!",
  // ---- Sorteios ----
  "Novo Sorteio": "Nuova Estrazione", "Nenhum.": "Nessuno.",
  "Participar": "Partecipa", "Sortear": "Estrai",
  "Encerrado": "Chiuso", "ENCERRADO": "CHIUSO",
  "Sorteio criado!": "Estrazione creata!", "Participando!": "Partecipazione!",
  "Historico de Ganhadores": "Cronologia Estrazioni",
  "Data do Sorteio": "Data Estrazione", "Todos os Participantes": "Tutti i Partecipanti",
  "Nenhum": "Nessuno", "Sorteio finalizado!": "Estrazione finalizzata!",
  // ---- Lotérica ----
  "Lotérica Ativa": "Loteria Attiva", "Vendas abiertas": "Vendite aperte",
  "Finalizada": "Finalizzata", "Configurando": "Configurazione",
  "Arrecadado Total": "Totale Raccolto",
  "Premio": "Premio", "Teve Ganhador!": "Abbiamo un Vincitore!",
  "Ninguem acertou - Premio acumulou!": "Nessuno ha indovinato - Premio accumulato!",
  "Finalizar Lotérica": "Finalizza Lotteria",
  "Vender Numero": "Vendi Numero", "Vender": "Vendi",
  "Loterica criada!": "Loteria creata!",
  "Nova Lotérica": "Nuova Lotteria", "Configurar Lotérica": "Configura Lotteria",
  "Criar Lotérica": "Crea Lotteria",
  // ---- Empréstimos ----
  "Regras do Banco": "Regole della Banca",
  "Membro Especial": "Membro Speciale", "Membro Comum": "Membro Comune",
  "Não Contribuinte": "Non Contributore",
  "Calculadora de Empréstimo": "Calcolatore Prestito",
  "Dias de Atraso": "Giorni di Ritardo", "Total a Devolver": "Totale da Restituire",
  "itens": "oggetti", "Novo Empréstimo": "Nuovo Prestito",
  "Pendentes": "In sospeso", "Pagos": "Pagati",
  "Pendente": "In sospeso", "Pago": "Pagato", "Atrasado": "In ritardo",
  "Pagar": "Paga", "Confirmar Pagamento": "Conferma Pagamento",
  "Empréstimo registrado!": "Prestito registrato!",
  "Pagamento registrado!": "Pagamento registrato!",
  // ---- Tabela ----
  "Tabela de Precos": "Tabella Prezzi", "Tabela de Preços": "Tabella Prezzi",
  "Alta": "Alta", "Media": "Media", "Baixa": "Bassa",
  "Comum": "Comune", "Incomum": "Non comune", "Raro": "Raro",
  "Lendario": "Leggendario", "Demanda": "Domanda", "Raridade": "Rarità",
  "Gerenciar Itens": "Gestisci Oggetti", "Reportar": "Segnala",
  "Editar": "Modifica", "Restaurar": "Ripristina",
  "Nome do Item *": "Nome Oggetto *", "Categoria *": "Categoria *",
  "Selecionar...": "Seleziona...", "Adicionar Item": "Aggiungi Oggetto",
  // ---- Admin ----
  "Login Admin": "Login Admin", "Verificando...": "Verifica...",
  "Backup": "Backup", "Gerando...": "Generazione...",
  "Senha incorreta!": "Password errata!",
  "Modo Admin ativado!": "Modalità Admin attivata!",
  "Continuar em Português": "Continua in Portoghese",
  "Traduzir o Site": "Traduci il Sito", "Selecione seu idioma": "Seleziona la lingua",
  "Traduzir para": "Traduci in", "Traduzir site": "Traduci sito",
  // ---- Toasts ----
  "Registro adicionado!": "Registro aggiunto!",
  "Ordem atualizada!": "Ordine aggiornato!",
  "Preencha os obrigatórios.": "Compila i campi obbligatori.",
  "Preencha todos os campos.": "Compila tutti i campi.",
  "Preencha todos.": "Compila tutto.", "Remover?": "Rimuovere?",
  "Sem spam": "Niente spam",
  "Respeite todos os participantes": "Rispetta tutti i partecipanti",
  "Sem spam ou flood": "Niente spam o flood",
  // ---- Config ----
  "Configuração de Tabelas de Troca": "Configurazione Tabelle di Scambio",
  "Nova Regra": "Nuova Regola",
  "Nenhuma regra configurada.": "Nessuna regola configurata.",
  "Como funciona:": "Come funziona:",
  "Configuração salva!": "Configurazione salvata!",
};

const ZH_CN: Record<string, string> = {
  // ---- Tabs ----
  "Dashboard": "仪表盘", "Tabela": "价格表", "Empréstimos": "借款",
  "Trocas": "交易", "Doadores": "捐赠者", "Leilões": "拍卖",
  "Sorteios": "抽奖", "Lotérica": "彩票", "Investidores": "投资者",
  "Config Trocas": "交易设置", "Compras & Vendas": "买卖",
  "Estoque & Caixa": "库存与账户", "Chat": "聊天",
  // ---- Common ----
  "Carregando...": "加载中...", "Carregando dados do banco...": "加载银行数据...",
  "Cancelar": "取消", "Entrar": "进入", "Salvar": "保存", "Fechar": "关闭",
  "Criar": "创建", "Remover": "删除", "Registrar": "注册",
  "Buscar...": "搜索...", "Buscar item...": "搜索物品...",
  "Nome": "名称", "Item": "物品", "Quantidade": "数量",
  "Tipo": "类型", "Data": "日期", "Player": "玩家",
  "Todos": "全部", "Admin": "管理员", "Modo visual": "查看模式",
  "total": "合计", "registros": "条记录",
  "Observação": "备注", "Opcional": "可选",
  "Dono": "所有者", "Moeda": "货币", "Ganhador": "获胜者",
  "Vencedor": "获胜者", "Participantes": "参与者",
  "Qtd": "数量", "Inicial": "起始", "Maior": "最高",
  "Lances": "出价", "Taxa": "手续费", "Lucro": "利润",
  "Bruto:": "总额:", "Descrição": "描述", "Origem": "来源",
  "Ação": "操作", "Disponível": "可用", "Disponivel": "可用",
  // ---- Dashboard ----
  "Empréstimos Pendentes": "待还借款", "Empréstimos Pagos": "已还借款",
  "Investidores Ativos": "活跃投资者", "Trocas Realizadas": "已完成交易",
  "Registros no Caixa": "账户记录", "Leilões Ativos": "进行中拍卖",
  "Sorteios Ativos": "进行中抽奖", "Top 10 Doadores": "捐赠榜 Top 10",
  "Top 10 Investidores": "投资者 Top 10", "Top 10 Contribuintes": "贡献者 Top 10",
  "Estoque do Banco": "银行库存", "Movimentos do Caixa": "账户流水",
  "Eventos Ativos": "进行中活动",
  "Nenhum doador cadastrado.": "没有注册的捐赠者。",
  "Nenhum investidor cadastrado.": "没有注册的投资者。",
  "Nenhum contribuinte ainda. Contribua reportando precos na aba Tabela!": "还没有贡献者。在价格表上报告价格来贡献吧！",
  "Nenhum item encontrado.": "未找到物品。",
  "Estoque vazio.": "库存为空。", "Nenhum registro ainda.": "还没有记录。",
  "desde": "自", "contribuicoes": "次贡献",
  "Posto de Trocas": "交易站",
  "Sistema de gestao para sobreviventes": "幸存者管理系统",
  // ---- Chat ----
  "Canais": "频道", "Salas Privadas": "私人房间",
  "Geral": "综合", "Atendimento": "客服", "Guias": "指南",
  "Clãs": "公会", "Comércio": "贸易",
  "Nenhuma mensagem ainda. Seja o primeiro a conversar!": "还没有消息。成为第一个聊天的人吧！",
  "Nenhuma sala criada.": "没有创建房间。",
  "Nome da sala": "房间名称", "Senha (opcional)": "密码（可选）",
  "Senha da sala": "房间密码", "Sala Privada": "私人房间",
  "requer senha": "需要密码", "Voltar": "返回",
  "Hoje": "今天", "Ontem": "昨天", "Membro": "成员",
  "Regras:": "规则：", "por": "由",
  "Digite seu nome para entrar no chat.": "输入您的名字以加入聊天。",
  "Seu nome no jogo": "您的游戏名",
  "Nenhuma mensagem ainda.": "还没有消息。",
  "Sala": "房间", "Mensagem": "消息",
  "Evento": "事件", "Sobreviventes": "幸存者",
  "Deletar sala": "删除房间", "Deletar mensagem?": "删除消息？",
  // ---- Doadores ----
  "❤️ Doadores": "❤️ 捐赠者",
  "Ranking": "排行榜", "Reordenar": "重新排序",
  "Nova Doação": "新捐赠", "Registrar Doação": "注册捐赠",
  "Histórico": "历史", "Nenhuma doação.": "没有捐赠。",
  "Doação registrada!": "捐赠已注册！",
  "Excluir a doação de": "删除捐赠：",
  // ---- Investidores ----
  "💎 Membros Investidores": "💎 投资者成员",
  "Benefício:": "优惠：",
  "em empréstimos e trocas": "借款和交易",
  "comum": "普通",
  "Como obter a tag?": "如何获得标签？",
  "Ajude o banco — doando itens, fazendo trocas ou de qualquer outra forma.": "帮助银行 — 捐赠物品、进行交易或其他方式。",
  "Adicionar Investidor": "添加投资者", "Nome do investidor": "投资者名称",
  "Adicionar": "添加", "Ativos": "活跃",
  "Nenhum investidor.": "没有投资者。",
  "Valor Investido": "投资额", "Data Entrada": "入职日期",
  "Novo Investidor": "新投资者", "Editar Investidor": "编辑投资者",
  "Status": "状态", "Ativo": "活跃", "Inativo": "非活跃",
  "Investidor cadastrado!": "投资者已注册！",
  "Investidor adicionado!": "投资者已添加！",
  // ---- Trocas ----
  "Registro de Trocas": "交易记录", "Nova Troca": "新交易",
  "Selecione": "选择", "sem taxa": "无手续费",
  "Player Receibe:": "玩家收到：", "Player entregou:": "玩家交出：",
  "Sai do estoque do Banco:": "从银行库存出库：",
  "Entra no estoque do Banco:": "入银行库存：",
  "Entregou": "交出", "Recebeu / Entrou no estoque": "收到 / 入库",
  "Recibido / Entrou no estoque": "收到 / 入库",
  "Calculadora": "计算器", "Troca registrada!": "交易已注册！",
  "Excluir troca e estornar estoque": "删除交易并撤销库存",
  "Excluir a troca": "删除交易",
  "Registrar Troca": "注册交易",
  "Especial (0%)": "特殊 (0%)", "Top 10 (5%)": "Top 10 (5%)",
  "Investidor (10%)": "投资者 (10%)", "Comum (15%)": "普通 (15%)",
  "Não Contribuinte (20%)": "非贡献者 (20%)",
  "Banco (100% — troca interna)": "银行 (100% — 内部交易)",
  "Banco (100%)": "银行 (100%)", "Banco (100%):": "银行 (100%):",
  "⭐ Especial (0%)": "⭐ 特殊 (0%)",
  "👑 Top 10 Investidor (5%)": "👑 Top 10 投资者 (5%)",
  "💎 Investidor (10%)": "💎 投资者 (10%)",
  "👤 Comum (15%)": "👤 普通 (15%)",
  "⚠️ Não Contribuinte (20%)": "⚠️ 非贡献者 (20%)",
  // ---- Compras & Vendas ----
  "🛒 Compras e Vendas": "🛒 买卖",
  "COMPRA:": "购买：", "VENDA:": "出售：",
  "Entra": "入库", "Sai": "出库", "Paga": "付款", "Recebe": "收到",
  "Compras": "购买", "Vendas": "出售",
  "Nenhuma compra ou venda.": "没有买卖记录。",
  "Registrar Compra": "注册购买", "Registrar Venda": "注册出售",
  "Compra registrada!": "购买已注册！", "Venda registrada!": "出售已注册！",
  // ---- Caixa ----
  "💰 Caixa do Banco": "💰 银行账户",
  "ENTRADA": "收入", "SAÍDA": "支出",
  "Entrada": "收入", "Saída": "支出",
  "Registro Manual": "手动记录",
  "Nome do jogador": "玩家名称",
  "Estoque Atual": "当前库存", "BAIXO": "低",
  "Resetar": "重置", "Resetar TUDO?": "重置全部？",
  "📦 ENTRADA": "📦 收入", "📤 SAÍDA": "📤 支出",
  "Nenhum registro.": "没有记录。",
  // ---- Leilões ----
  "🔨 Leilões": "🔨 拍卖", "Como Funciona": "如何运作",
  "Novo Leilão": "新拍卖", "Criar Leilão": "创建拍卖",
  "Duração": "持续时间", "Fila de Espera": "等待队列",
  "EM ESPERA": "等待中", "Nenhum leilão ativo.": "没有进行中的拍卖。",
  "Dar Lance": "出价", "Finalizar Entrega": "完成交付",
  "Histórico de Ganhadores": "获胜者历史",
  "Leilão criado!": "拍卖已创建！",
  // ---- Sorteios ----
  "Novo Sorteio": "新抽奖", "Nenhum.": "无。",
  "Participar": "参与", "Sortear": "抽奖",
  "Encerrado": "已结束", "ENCERRADO": "已结束",
  "Sorteio criado!": "抽奖已创建！", "Participando!": "参与中！",
  "Historico de Ganhadores": "抽奖历史",
  "Data do Sorteio": "抽奖日期", "Todos os Participantes": "所有参与者",
  "Nenhum": "无", "Sorteio finalizado!": "抽奖已结束！",
  // ---- Lotérica ----
  "Lotérica Ativa": "进行中彩票", "Vendas abiertas": "销售中",
  "Finalizada": "已结束", "Configurando": "配置中",
  "Arrecadado Total": "募集总额",
  "Premio": "奖品", "Teve Ganhador!": "有获胜者！",
  "Ninguem acertou - Premio acumulou!": "没有人猜中 - 奖品累积！",
  "Finalizar Lotérica": "结束彩票",
  "Vender Numero": "出售号码", "Vender": "出售",
  "Loterica criada!": "彩票已创建！",
  "Nova Lotérica": "新彩票", "Configurar Lotérica": "配置彩票",
  "Criar Lotérica": "创建彩票",
  // ---- Empréstimos ----
  "Regras do Banco": "银行规则",
  "Membro Especial": "特殊成员", "Membro Comum": "普通成员",
  "Não Contribuinte": "非贡献者",
  "Calculadora de Empréstimo": "借款计算器",
  "Dias de Atraso": "逾期天数", "Total a Devolver": "应还总额",
  "itens": "物品", "Novo Empréstimo": "新借款",
  "Pendentes": "待还", "Pagos": "已还",
  "Pendente": "待还", "Pago": "已还", "Atrasado": "逾期",
  "Pagar": "还款", "Confirmar Pagamento": "确认还款",
  "Empréstimo registrado!": "借款已注册！",
  "Pagamento registrado!": "还款已注册！",
  // ---- Tabela ----
  "Tabela de Precos": "价格表", "Tabela de Preços": "价格表",
  "Alta": "高", "Media": "中", "Baixa": "低",
  "Comum": "普通", "Incomum": "不常见", "Raro": "稀有",
  "Lendario": "传奇", "Demanda": "需求", "Raridade": "稀有度",
  "Gerenciar Itens": "管理物品", "Reportar": "报告",
  "Editar": "编辑", "Restaurar": "恢复",
  "Nome do Item *": "物品名称 *", "Categoria *": "分类 *",
  "Selecionar...": "选择...", "Adicionar Item": "添加物品",
  // ---- Admin ----
  "Login Admin": "管理员登录", "Verificando...": "验证中...",
  "Backup": "备份", "Gerando...": "生成中...",
  "Senha incorreta!": "密码错误！",
  "Modo Admin ativado!": "管理员模式已启用！",
  "Continuar em Português": "继续使用葡萄牙语",
  "Traduzir o Site": "翻译网站", "Selecione seu idioma": "选择语言",
  "Traduzir para": "翻译为", "Traduzir site": "翻译网站",
  // ---- Toasts ----
  "Registro adicionado!": "记录已添加！",
  "Ordem atualizada!": "顺序已更新！",
  "Preencha os obrigatórios.": "请填写必填字段。",
  "Preencha todos os campos.": "请填写所有字段。",
  "Preencha todos.": "请全部填写。", "Remover?": "删除？",
  "Sem spam": "禁止垃圾信息",
  "Respeite todos os participantes": "尊重所有参与者",
  "Sem spam ou flood": "禁止垃圾信息和刷屏",
  // ---- Config ----
  "Configuração de Tabelas de Troca": "交易表配置",
  "Nova Regra": "新规则",
  "Nenhuma regra configurada.": "没有配置规则。",
  "Como funciona:": "如何运作：",
  "Configuração salva!": "配置已保存！",
};

const ZH_TW: Record<string, string> = {
  // ---- Tabs ----
  "Dashboard": "儀表盤", "Tabela": "價格表", "Empréstimos": "借款",
  "Trocas": "交易", "Doadores": "捐贈者", "Leilões": "拍賣",
  "Sorteios": "抽獎", "Lotérica": "彩票", "Investidores": "投資者",
  "Config Trocas": "交易設定", "Compras & Vendas": "買賣",
  "Estoque & Caixa": "庫存與賬戶", "Chat": "聊天",
  // ---- Common ----
  "Carregando...": "載入中...", "Carregando dados do banco...": "載入銀行資料...",
  "Cancelar": "取消", "Entrar": "進入", "Salvar": "儲存", "Fechar": "關閉",
  "Criar": "建立", "Remover": "刪除", "Registrar": "註冊",
  "Buscar...": "搜尋...", "Buscar item...": "搜尋物品...",
  "Nome": "名稱", "Item": "物品", "Quantidade": "數量",
  "Tipo": "類型", "Data": "日期", "Player": "玩家",
  "Todos": "全部", "Admin": "管理員", "Modo visual": "檢視模式",
  "total": "合計", "registros": "筆記錄",
  "Observação": "備註", "Opcional": "可選",
  "Dono": "所有者", "Moeda": "貨幣", "Ganhador": "獲勝者",
  "Vencedor": "獲勝者", "Participantes": "參與者",
  "Qtd": "數量", "Inicial": "起始", "Maior": "最高",
  "Lances": "出價", "Taxa": "手續費", "Lucro": "利潤",
  "Bruto:": "總額:", "Descrição": "描述", "Origem": "來源",
  "Ação": "操作", "Disponível": "可用", "Disponivel": "可用",
  // ---- Dashboard ----
  "Empréstimos Pendentes": "待還借款", "Empréstimos Pagos": "已還借款",
  "Investidores Ativos": "活躍投資者", "Trocas Realizadas": "已完成交易",
  "Registros no Caixa": "賬戶記錄", "Leilões Ativos": "進行中拍賣",
  "Sorteios Ativos": "進行中抽獎", "Top 10 Doadores": "捐贈榜 Top 10",
  "Top 10 Investidores": "投資者 Top 10", "Top 10 Contribuintes": "貢獻者 Top 10",
  "Estoque do Banco": "銀行庫存", "Movimentos do Caixa": "賬戶流水",
  "Eventos Ativos": "進行中活動",
  "Nenhum doador cadastrado.": "沒有註冊的捐贈者。",
  "Nenhum investidor cadastrado.": "沒有註冊的投資者。",
  "Nenhum contribuinte ainda. Contribua reportando precos na aba Tabela!": "還沒有貢獻者。在價格表上報告價格來貢獻吧！",
  "Nenhum item encontrado.": "未找到物品。",
  "Estoque vazio.": "庫存為空。", "Nenhum registro ainda.": "還沒有記錄。",
  "desde": "自", "contribuicoes": "次貢獻",
  "Posto de Trocas": "交易站",
  "Sistema de gestao para sobreviventes": "倖存者管理系統",
  // ---- Chat ----
  "Canais": "頻道", "Salas Privadas": "私人房間",
  "Geral": "綜合", "Atendimento": "客服", "Guias": "指南",
  "Clãs": "公會", "Comércio": "貿易",
  "Nenhuma mensagem ainda. Seja o primeiro a conversar!": "還沒有訊息。成為第一個聊天的人吧！",
  "Nenhuma sala criada.": "沒有建立房間。",
  "Nome da sala": "房間名稱", "Senha (opcional)": "密碼（可選）",
  "Senha da sala": "房間密碼", "Sala Privada": "私人房間",
  "requer senha": "需要密碼", "Voltar": "返回",
  "Hoje": "今天", "Ontem": "昨天", "Membro": "成員",
  "Regras:": "規則：", "por": "由",
  "Digite seu nome para entrar no chat.": "輸入您的名字以加入聊天。",
  "Seu nome no jogo": "您的遊戲名",
  "Nenhuma mensagem ainda.": "還沒有訊息。",
  "Sala": "房間", "Mensagem": "訊息",
  "Evento": "事件", "Sobreviventes": "倖存者",
  "Deletar sala": "刪除房間", "Deletar mensagem?": "刪除訊息？",
  // ---- Doadores ----
  "❤️ Doadores": "❤️ 捐贈者",
  "Ranking": "排行榜", "Reordenar": "重新排序",
  "Nova Doação": "新捐贈", "Registrar Doação": "註冊捐贈",
  "Histórico": "歷史", "Nenhuma doação.": "沒有捐贈。",
  "Doação registrada!": "捐贈已註冊！",
  "Excluir a doação de": "刪除捐贈：",
  // ---- Investidores ----
  "💎 Membros Investidores": "💎 投資者成員",
  "Benefício:": "優惠：",
  "em empréstimos e trocas": "借款和交易",
  "comum": "普通",
  "Como obter a tag?": "如何獲得標籤？",
  "Ajude o banco — doando itens, fazendo trocas ou de qualquer outra forma.": "幫助銀行 — 捐贈物品、進行交易或其他方式。",
  "Adicionar Investidor": "添加投資者", "Nome do investidor": "投資者名稱",
  "Adicionar": "添加", "Ativos": "活躍",
  "Nenhum investidor.": "沒有投資者。",
  "Valor Investido": "投資額", "Data Entrada": "入職日期",
  "Novo Investidor": "新投資者", "Editar Investidor": "編輯投資者",
  "Status": "狀態", "Ativo": "活躍", "Inativo": "非活躍",
  "Investidor cadastrado!": "投資者已註冊！",
  "Investidor adicionado!": "投資者已添加！",
  // ---- Trocas ----
  "Registro de Trocas": "交易記錄", "Nova Troca": "新交易",
  "Selecione": "選擇", "sem taxa": "無手續費",
  "Player Receibe:": "玩家收到：", "Player entregou:": "玩家交出：",
  "Sai do estoque do Banco:": "從銀行庫存出庫：",
  "Entra no estoque do Banco:": "入銀行庫存：",
  "Entregou": "交出", "Recebeu / Entrou no estoque": "收到 / 入庫",
  "Recibido / Entrou no estoque": "收到 / 入庫",
  "Calculadora": "計算器", "Troca registrada!": "交易已註冊！",
  "Excluir troca e estornar estoque": "刪除交易並撤銷庫存",
  "Excluir a troca": "刪除交易",
  "Registrar Troca": "註冊交易",
  "Especial (0%)": "特殊 (0%)", "Top 10 (5%)": "Top 10 (5%)",
  "Investidor (10%)": "投資者 (10%)", "Comum (15%)": "普通 (15%)",
  "Não Contribuinte (20%)": "非貢獻者 (20%)",
  "Banco (100%)": "銀行 (100%)", "Banco (100%):": "銀行 (100%):",
  "⭐ Especial (0%)": "⭐ 特殊 (0%)",
  "👑 Top 10 Investidor (5%)": "👑 Top 10 投資者 (5%)",
  "💎 Investidor (10%)": "💎 投資者 (10%)",
  "👤 Comum (15%)": "👤 普通 (15%)",
  "⚠️ Não Contribuinte (20%)": "⚠️ 非貢獻者 (20%)",
  // ---- Compras & Vendas ----
  "🛒 Compras e Vendas": "🛒 買賣",
  "COMPRA:": "購買：", "VENDA:": "出售：",
  "Entra": "入庫", "Sai": "出庫", "Paga": "付款", "Recebe": "收到",
  "Compras": "購買", "Vendas": "出售",
  "Nenhuma compra ou venda.": "沒有買賣記錄。",
  "Registrar Compra": "註冊購買", "Registrar Venda": "註冊出售",
  // ---- Caixa ----
  "💰 Caixa do Banco": "💰 銀行賬戶",
  "ENTRADA": "收入", "SAÍDA": "支出",
  "Entrada": "收入", "Saída": "支出",
  "Registro Manual": "手動記錄",
  "Nome do jogador": "玩家名稱",
  "Estoque Atual": "當前庫存", "BAIXO": "低",
  "Resetar": "重置", "Resetar TUDO?": "重置全部？",
  "📦 ENTRADA": "📦 收入", "📤 SAÍDA": "📤 支出",
  "Nenhum registro.": "沒有記錄。",
  // ---- Leilões ----
  "🔨 Leilões": "🔨 拍賣", "Como Funciona": "如何運作",
  "Novo Leilão": "新拍賣", "Criar Leilão": "建立拍賣",
  "Duração": "持續時間", "Fila de Espera": "等待佇列",
  "EM ESPERA": "等待中", "Nenhum leilão ativo.": "沒有進行中的拍賣。",
  "Dar Lance": "出價", "Finalizar Entrega": "完成交付",
  "Histórico de Ganhadores": "獲勝者歷史",
  "Leilão criado!": "拍賣已建立！",
  // ---- Sorteios ----
  "Novo Sorteio": "新抽獎", "Nenhum.": "無。",
  "Participar": "參與", "Sortear": "抽獎",
  "Encerrado": "已結束", "ENCERRADO": "已結束",
  "Sorteio criado!": "抽獎已建立！", "Participando!": "參與中！",
  "Sorteio finalizado!": "抽獎已結束！",
  // ---- Lotérica ----
  "Lotérica Ativa": "進行中彩票", "Vendas abiertas": "銷售中",
  "Finalizada": "已結束", "Configurando": "配置中",
  "Arrecadado Total": "募集總額",
  "Premio": "獎品", "Teve Ganhador!": "有獲勝者！",
  "Ninguem acertou - Premio acumulou!": "沒有人猜中 - 獎品累積！",
  "Finalizar Lotérica": "結束彩票",
  "Vender Numero": "出售號碼", "Vender": "出售",
  "Loterica criada!": "彩票已建立！",
  "Nova Lotérica": "新彩票", "Configurar Lotérica": "配置彩票",
  "Criar Lotérica": "建立彩票",
  // ---- Empréstimos ----
  "Regras do Banco": "銀行規則",
  "Membro Especial": "特殊成員", "Membro Comum": "普通成員",
  "Não Contribuinte": "非貢獻者",
  "Calculadora de Empréstimo": "借款計算器",
  "Dias de Atraso": "逾期天數", "Total a Devolver": "應還總額",
  "itens": "物品", "Novo Empréstimo": "新借款",
  "Pendentes": "待還", "Pagos": "已還",
  "Pendente": "待還", "Pago": "已還", "Atrasado": "逾期",
  "Pagar": "還款", "Confirmar Pagamento": "確認還款",
  "Empréstimo registrado!": "借款已註冊！",
  // ---- Tabela ----
  "Tabela de Precos": "價格表", "Tabela de Preços": "價格表",
  "Alta": "高", "Media": "中", "Baixa": "低",
  "Comum": "普通", "Incomum": "不常見", "Raro": "稀有",
  "Lendario": "傳奇", "Demanda": "需求", "Raridade": "稀有度",
  "Gerenciar Itens": "管理物品", "Reportar": "報告",
  "Editar": "編輯", "Restaurar": "恢復",
  "Nome do Item *": "物品名稱 *", "Categoria *": "分類 *",
  "Selecionar...": "選擇...", "Adicionar Item": "添加物品",
  // ---- Admin ----
  "Login Admin": "管理員登入", "Verificando...": "驗證中...",
  "Backup": "備份", "Gerando...": "產生中...",
  "Senha incorreta!": "密碼錯誤！",
  "Modo Admin ativado!": "管理員模式已啟用！",
  "Continuar em Português": "繼續使用葡萄牙語",
  "Traduzir o Site": "翻譯網站", "Selecione seu idioma": "選擇語言",
  "Traduzir para": "翻譯為", "Traduzir site": "翻譯網站",
  // ---- Toasts ----
  "Registro adicionado!": "記錄已添加！",
  "Ordem atualizada!": "順序已更新！",
  "Preencha os obrigatórios.": "請填寫必填欄位。",
  "Preencha todos os campos.": "請填寫所有欄位。",
  "Preencha todos.": "請全部填寫。", "Remover?": "刪除？",
  "Sem spam": "禁止垃圾資訊",
  "Respeite todos os participantes": "尊重所有參與者",
  "Sem spam ou flood": "禁止垃圾資訊和刷屏",
  // ---- Config ----
  "Configuração de Tabelas de Troca": "交易表配置",
  "Nova Regra": "新規則",
  "Nenhuma regra configurada.": "沒有配置規則。",
  "Como funciona:": "如何運作：",
  "Configuração salva!": "配置已儲存！",
};

const KO: Record<string, string> = {
  // ---- Tabs ----
  "Dashboard": "대시보드", "Tabela": "가격표", "Empréstimos": "대출",
  "Trocas": "교환", "Doadores": "후원자", "Leilões": "경매",
  "Sorteios": "추첨", "Lotérica": "복권", "Investidores": "투자자",
  "Config Trocas": "교환 설정", "Compras & Vendas": "매매",
  "Estoque & Caixa": "재고 & 계좌", "Chat": "채팅",
  // ---- Common ----
  "Carregando...": "로딩 중...", "Carregando dados do banco...": "은행 데이터 로딩 중...",
  "Cancelar": "취소", "Entrar": "입장", "Salvar": "저장", "Fechar": "닫기",
  "Criar": "만들기", "Remover": "삭제", "Registrar": "등록",
  "Buscar...": "검색...", "Buscar item...": "아이템 검색...",
  "Nome": "이름", "Item": "아이템", "Quantidade": "수량",
  "Tipo": "유형", "Data": "날짜", "Player": "플레이어",
  "Todos": "전체", "Admin": "관리자", "Modo visual": "보기 모드",
  "total": "합계", "registros": "기록",
  "Observação": "비고", "Opcional": "선택",
  "Dono": "소유자", "Moeda": "통화", "Ganhador": "승리자",
  "Vencedor": "승리자", "Participantes": "참가자",
  "Qtd": "수량", "Inicial": "초기", "Maior": "최고",
  "Lances": "입찰", "Taxa": "수수료", "Lucro": "이익",
  "Bruto:": "총액:", "Descrição": "설명", "Origem": "출처",
  "Ação": "작업", "Disponível": "사용 가능", "Disponivel": "사용 가능",
  // ---- Dashboard ----
  "Empréstimos Pendentes": "대기 중 대출", "Empréstimos Pagos": "상환 완료 대출",
  "Investidores Ativos": "활동 투자자", "Trocas Realizadas": "완료된 교환",
  "Registros no Caixa": "계좌 기록", "Leilões Ativos": "활동 경매",
  "Sorteios Ativos": "활동 추첨", "Top 10 Doadores": "후원 랭킹 Top 10",
  "Top 10 Investidores": "투자자 Top 10", "Top 10 Contribuintes": "기여자 Top 10",
  "Estoque do Banco": "은행 재고", "Movimentos do Caixa": "계좌 이동",
  "Eventos Ativos": "활동 이벤트",
  "Nenhum doador cadastrado.": "등록된 후원자가 없습니다.",
  "Nenhum investidor cadastrado.": "등록된 투자자가 없습니다.",
  "Nenhum contribuinte ainda. Contribua reportando precos na aba Tabela!": "아직 기여자가 없습니다. 가격표 탭에서 가격을 보고해주세요!",
  "Nenhum item encontrado.": "아이템을 찾지 못했습니다.",
  "Estoque vazio.": "재고가 비어 있습니다.", "Nenhum registro ainda.": "아직 기록이 없습니다.",
  "desde": "부터", "contribuicoes": "회 기여",
  "Posto de Trocas": "교환 스테이션",
  "Sistema de gestao para sobreviventes": "생존자 관리 시스템",
  // ---- Chat ----
  "Canais": "채널", "Salas Privadas": "개인 방",
  "Geral": "일반", "Atendimento": "지원", "Guias": "가이드",
  "Clãs": "클랜", "Comércio": "거래",
  "Nenhuma mensagem ainda. Seja o primeiro a conversar!": "아직 메시지가 없습니다. 첫 번째 대화를 시작해보세요!",
  "Nenhuma sala criada.": "만들어진 방이 없습니다.",
  "Nome da sala": "방 이름", "Senha (opcional)": "비밀번호 (선택)",
  "Senha da sala": "방 비밀번호", "Sala Privada": "개인 방",
  "requer senha": "비밀번호 필요", "Voltar": "뒤로",
  "Hoje": "오늘", "Ontem": "어제", "Membro": "멤버",
  "Regras:": "규칙:", "por": "의해",
  "Digite seu nome para entrar no chat.": "채팅 입장을 위해 이름을 입력하세요.",
  "Seu nome no jogo": "게임 내 이름",
  "Nenhuma mensagem ainda.": "아직 메시지가 없습니다.",
  "Sala": "방", "Mensagem": "메시지",
  "Evento": "이벤트", "Sobreviventes": "생존자",
  "Deletar sala": "방 삭제", "Deletar mensagem?": "메시지 삭제?",
  // ---- Doadores ----
  "❤️ Doadores": "❤️ 후원자",
  "Ranking": "랭킹", "Reordenar": "재정렬",
  "Nova Doação": "새 후원", "Registrar Doação": "후원 등록",
  "Histórico": "역사", "Nenhuma doação.": "후원이 없습니다.",
  "Doação registrada!": "후원이 등록되었습니다!",
  "Excluir a doação de": "후원 삭제:",
  // ---- Investidores ----
  "💎 Membros Investidores": "💎 투자자 멤버",
  "Benefício:": "혜택:",
  "em empréstimos e trocas": "대출 및 교환",
  "comum": "일반",
  "Como obter a tag?": "태그를 어떻게 받나요?",
  "Ajude o banco — doando itens, fazendo trocas ou de qualquer outra forma.": "은행 도움 — 아이템 후원, 교환 또는 다른 방법으로.",
  "Adicionar Investidor": "투자자 추가", "Nome do investidor": "투자자 이름",
  "Adicionar": "추가", "Ativos": "활동",
  "Nenhum investidor.": "투자자가 없습니다.",
  "Valor Investido": "투자 금액", "Data Entrada": "입장 날짜",
  "Novo Investidor": "새 투자자", "Editar Investidor": "투자자 편집",
  "Status": "상태", "Ativo": "활동", "Inativo": "비활동",
  "Investidor cadastrado!": "투자자가 등록되었습니다!",
  "Investidor adicionado!": "투자자가 추가되었습니다!",
  // ---- Trocas ----
  "Registro de Trocas": "교환 기록", "Nova Troca": "새 교환",
  "Selecione": "선택", "sem taxa": "수수료 없음",
  "Player Receibe:": "플레이어가 받는 것:", "Player entregou:": "플레이어가 제출한 것:",
  "Sai do estoque do Banco:": "은행 재고 출고:", "Entra no estoque do Banco:": "은행 재고 입고:",
  "Calculadora": "계산기", "Troca registrada!": "교환 등록!",
  "Excluir a troca": "교환 삭제", "Registrar Troca": "교환 등록",
  "Especial (0%)": "특별 (0%)", "Top 10 (5%)": "Top 10 (5%)",
  "Investidor (10%)": "투자자 (10%)", "Comum (15%)": "일반 (15%)",
  "Não Contribuinte (20%)": "비기여자 (20%)",
  "Banco (100%)": "은행 (100%)", "Banco (100%):": "은행 (100%):",
  "⭐ Especial (0%)": "⭐ 특별 (0%)",
  "👑 Top 10 Investidor (5%)": "👑 Top 10 투자자 (5%)",
  "💎 Investidor (10%)": "💎 투자자 (10%)",
  "👤 Comum (15%)": "👤 일반 (15%)",
  "⚠️ Não Contribuinte (20%)": "⚠️ 비기여자 (20%)",
  // ---- Compras & Vendas ----
  "🛒 Compras e Vendas": "🛒 매매",
  "COMPRA:": "구매:", "VENDA:": "판매:",
  "Entra": "입고", "Sai": "출고", "Paga": "결제", "Recebe": "받는 것",
  "Compras": "구매", "Vendas": "판매",
  "Nenhuma compra ou venda.": "매매 기록이 없습니다.",
  // ---- Caixa ----
  "💰 Caixa do Banco": "💰 은행 계좌",
  "ENTRADA": "수입", "SAÍDA": "지출",
  "Entrada": "수입", "Saída": "지출",
  "Registro Manual": "수동 기록",
  "Nome do jogador": "플레이어 이름",
  "Estoque Atual": "현재 재고", "BAIXO": "낮음",
  "Resetar": "리셋", "Resetar TUDO?": "전체 리셋?",
  "📦 ENTRADA": "📦 수입", "📤 SAÍDA": "📤 지출",
  "Nenhum registro.": "기록이 없습니다.",
  // ---- Leilões ----
  "🔨 Leilões": "🔨 경매", "Como Funciona": "작동 방법",
  "Novo Leilão": "새 경매", "Dar Lance": "입찰",
  "Duração": "지속 시간", "Fila de Espera": "대기 줄",
  "EM ESPERA": "대기 중", "Nenhum leilão ativo.": "활동 경매가 없습니다.",
  "Finalizar Entrega": "날품 완료", "Histórico de Ganhadores": "승리자 역사",
  // ---- Sorteios ----
  "Novo Sorteio": "새 추첨", "Nenhum.": "없음.",
  "Participar": "참가", "Sortear": "추첨",
  "Encerrado": "종료", "ENCERRADO": "종료",
  "Sorteio criado!": "추첨 생성!", "Participando!": "참가 중!",
  "Sorteio finalizado!": "추첨 완료!",
  // ---- Lotérica ----
  "Lotérica Ativa": "활동 복권", "Vendas abiertas": "판매 중",
  "Finalizada": "종료", "Configurando": "설정 중",
  "Arrecadado Total": "모두 모집",
  "Premio": "상품", "Teve Ganhador!": "승리자가 있습니다!",
  "Ninguem acertou - Premio acumulou!": "맞힌 사람 없음 - 상품 적립!",
  "Finalizar Lotérica": "복권 종료",
  "Vender Numero": "번호 판매", "Vender": "판매",
  "Loterica criada!": "복권 생성!",
  "Nova Lotérica": "새 복권", "Criar Lotérica": "복권 생성",
  // ---- Empréstimos ----
  "Regras do Banco": "은행 규칙",
  "Membro Especial": "특별 멤버", "Membro Comum": "일반 멤버",
  "Não Contribuinte": "비기여자",
  "Calculadora de Empréstimo": "대출 계산기",
  "Dias de Atraso": "연체 일수", "Total a Devolver": "필 갚 금액",
  "itens": "아이템", "Novo Empréstimo": "새 대출",
  "Pendentes": "대기 중", "Pagos": "상환",
  "Pendente": "대기", "Pago": "상환", "Atrasado": "연체",
  "Pagar": "결제", "Confirmar Pagamento": "결제 확인",
  // ---- Tabela ----
  "Tabela de Precos": "가격표", "Alta": "높음", "Media": "중간", "Baixa": "낮음",
  "Comum": "일반", "Incomum": "희귀", "Raro": "레어",
  "Lendario": "전설", "Demanda": "수요", "Raridade": "희귀도",
  "Gerenciar Itens": "아이템 관리", "Reportar": "보고",
  "Editar": "편집", "Restaurar": "복구",
  "Nome do Item *": "아이템 이름 *", "Categoria *": "분류 *",
  "Selecionar...": "선택...", "Adicionar Item": "아이템 추가",
  // ---- Admin ----
  "Login Admin": "관리자 로그인", "Verificando...": "확인 중...",
  "Backup": "백업", "Senha incorreta!": "비밀번호 오류!",
  "Modo Admin ativado!": "관리자 모드 활성화!",
  "Continuar em Português": "포르투갈어 계속",
  "Traduzir o Site": "사이트 번역", "Selecione seu idioma": "언어 선택",
  "Traduzir para": "번역", "Traduzir site": "사이트 번역",
  // ---- Toasts ----
  "Registro adicionado!": "기록 추가!",
  "Preencha os obrigatórios.": "필수 필드를 입력하세요.",
  "Preencha todos os campos.": "모든 필드를 입력하세요.",
  "Preencha todos.": "모두 입력", "Remover?": "삭제?",
  "Sem spam": "스팸 금지",
  "Respeite todos os participantes": "모든 참가자를 존중하세요",
  "Sem spam ou flood": "스팸 및 플러드 금지",
  // ---- Config ----
  "Configuração de Tabelas de Troca": "교환 표 설정",
  "Nova Regra": "새 규칙",
  "Como funciona:": "작동 방법:",
  "Configuração salva!": "설정 저장!",
};

const JA: Record<string, string> = {
  // ---- Tabs ----
  "Dashboard": "ダッシュボード", "Tabela": "価格テーブル", "Empréstimos": "ローン",
  "Trocas": "取引", "Doadores": "ドナー", "Leilões": "オークション",
  "Sorteios": "抽選", "Lotérica": "宝くじ", "Investidores": "投資家",
  "Config Trocas": "取引設定", "Compras & Vendas": "売買",
  "Estoque & Caixa": "在庫 & 現金", "Chat": "チャット",
  // ---- Common ----
  "Carregando...": "読み込み中...", "Carregando dados do banco...": "銀行データ読み込み中...",
  "Cancelar": "キャンセル", "Entrar": "入場", "Salvar": "保存", "Fechar": "閉じる",
  "Criar": "作成", "Remover": "削除", "Registrar": "登録",
  "Buscar...": "検索...", "Buscar item...": "アイテム検索...",
  "Nome": "名前", "Item": "アイテム", "Quantidade": "数量",
  "Tipo": "タイプ", "Data": "日付", "Player": "プレイヤー",
  "Todos": "全て", "Admin": "管理者", "Modo visual": "表示モード",
  "total": "合計", "registros": "レコード",
  "Observação": "備考", "Opcional": "任意",
  "Dono": "所有者", "Moeda": "通貨", "Ganhador": "当選者",
  "Vencedor": "当選者", "Participantes": "参加者",
  "Qtd": "数量", "Inicial": "初期", "Maior": "最高",
  "Lances": "入札", "Taxa": "手数料", "Lucro": "利益",
  "Bruto:": "総額:", "Descrição": "説明", "Origem": "出典",
  "Ação": "アクション", "Disponível": "使用可能", "Disponivel": "使用可能",
  // ---- Dashboard ----
  "Empréstimos Pendentes": "保留中のローン", "Empréstimos Pagos": "返済済みローン",
  "Investidores Ativos": "アクティブ投資家", "Trocas Realizadas": "完了した取引",
  "Registros no Caixa": "現金レコード", "Leilões Ativos": "アクティブオークション",
  "Sorteios Ativos": "アクティブ抽選", "Top 10 Doadores": "ドナーランキング Top 10",
  "Top 10 Investidores": "投資家 Top 10", "Top 10 Contribuintes": "貢献者 Top 10",
  "Estoque do Banco": "銀行在庫", "Movimentos do Caixa": "現金動き",
  "Eventos Ativos": "アクティブイベント",
  "Nenhum doador cadastrado.": "登録されたドナーはいません。",
  "Nenhum investidor cadastrado.": "登録された投資家はいません。",
  "Nenhum contribuinte ainda. Contribua reportando precos na aba Tabela!": "まだ貢献者がいません。価格テーブルで価格を報告して貢献してください!",
  "Nenhum item encontrado.": "アイテムが見つかりません。",
  "Estoque vazio.": "在庫が空です。", "Nenhum registro ainda.": "まだレコードがありません。",
  "desde": "以来", "contribuicoes": "回貢献",
  "Posto de Trocas": "取引ステーション",
  "Sistema de gestao para sobreviventes": "生存者管理システム",
  // ---- Chat ----
  "Canais": "チャンネル", "Salas Privadas": "プライベート部屋",
  "Geral": "一般", "Atendimento": "サポート", "Guias": "ガイド",
  "Clãs": "クラン", "Comércio": "取引",
  "Nenhuma mensagem ainda. Seja o primeiro a conversar!": "まだメッセージがありません。最初の会話を始めましょう!",
  "Nenhuma sala criada.": "部屋は作成されていません。",
  "Nome da sala": "部屋名", "Senha (opcional)": "パスワード（任意）",
  "Senha da sala": "部屋パスワード", "Sala Privada": "プライベート部屋",
  "requer senha": "パスワード必要", "Voltar": "戻る",
  "Hoje": "今日", "Ontem": "昨日", "Membro": "メンバー",
  "Regras:": "ルール:", "por": "による",
  "Digite seu nome para entrar no chat.": "チャットに入場するには名前を入力してください。",
  "Seu nome no jogo": "ゲーム内の名前",
  "Nenhuma mensagem ainda.": "まだメッセージがありません。",
  "Sala": "部屋", "Mensagem": "メッセージ",
  "Evento": "イベント", "Sobreviventes": "生存者",
  "Deletar sala": "部屋削除", "Deletar mensagem?": "メッセージを削除しますか?",
  // ---- Doadores ----
  "❤️ Doadores": "❤️ ドナー",
  "Ranking": "ランキング", "Reordenar": "並び替え",
  "Nova Doação": "新しいドナー", "Registrar Doação": "ドナー登録",
  "Histórico": "履歴", "Nenhuma doação.": "ドナーがありません。",
  "Doação registrada!": "ドナーが登録されました。",
  "Excluir a doação de": "ドナー削除:",
  // ---- Investidores ----
  "💎 Membros Investidores": "💎 投資家メンバー",
  "Benefício:": "特典:",
  "em empréstimos e trocas": "ローンと取引",
  "comum": "一般",
  "Como obter a tag?": "タグの取得方法は?",
  "Ajude o banco — doando itens, fazendo trocas ou de qualquer outra forma.": "銀行を助けてください — アイテム寄付、取引または他の方法で。",
  "Adicionar Investidor": "投資家追加", "Nome do investidor": "投資家名",
  "Adicionar": "追加", "Ativos": "アクティブ",
  "Nenhum investidor.": "投資家がいません。",
  "Valor Investido": "投資額", "Data Entrada": "入場日",
  "Novo Investidor": "新しい投資家", "Editar Investidor": "投資家編集",
  "Status": "ステータス", "Ativo": "アクティブ", "Inativo": "非アクティブ",
  "Investidor cadastrado!": "投資家が登録されました。",
  "Investidor adicionado!": "投資家が追加されました。",
  // ---- Trocas ----
  "Registro de Trocas": "取引レコード", "Nova Troca": "新しい取引",
  "Selecione": "選択", "sem taxa": "手数料なし",
  "Player Receibe:": "プレイヤー受取:", "Player entregou:": "プレイヤー提出:",
  "Sai do estoque do Banco:": "銀行在庫から出庫:", "Entra no estoque do Banco:": "銀行在庫に入庫:",
  "Calculadora": "計算モード", "Troca registrada!": "取引が登録されました。",
  "Excluir a troca": "取引削除", "Registrar Troca": "取引登録",
  "Especial (0%)": "特別 (0%)", "Top 10 (5%)": "Top 10 (5%)",
  "Investidor (10%)": "投資家 (10%)", "Comum (15%)": "一般 (15%)",
  "Não Contribuinte (20%)": "非貢献者 (20%)",
  "Banco (100%)": "銀行 (100%)", "Banco (100%):": "銀行 (100%):",
  "⭐ Especial (0%)": "⭐ 特別 (0%)",
  "👑 Top 10 Investidor (5%)": "👑 Top 10 投資家 (5%)",
  "💎 Investidor (10%)": "💎 投資家 (10%)",
  "👤 Comum (15%)": "👤 一般 (15%)",
  "⚠️ Não Contribuinte (20%)": "⚠️ 非貢献者 (20%)",
  // ---- Compras & Vendas ----
  "🛒 Compras e Vendas": "🛒 売買",
  "COMPRA:": "購入:", "VENDA:": "売却:",
  "Entra": "入庫", "Sai": "出庫", "Paga": "支払い", "Recebe": "受取",
  "Compras": "購入", "Vendas": "売却",
  "Nenhuma compra ou venda.": "売買レコードがありません。",
  // ---- Caixa ----
  "💰 Caixa do Banco": "💰 銀行現金",
  "ENTRADA": "収入", "SAÍDA": "支出",
  "Entrada": "収入", "Saída": "支出",
  "Registro Manual": "手動レコード",
  "Nome do jogador": "プレイヤー名",
  "Estoque Atual": "現在の在庫", "BAIXO": "低い",
  "Resetar": "リセット", "Resetar TUDO?": "全てリセットしますか?",
  "📦 ENTRADA": "📦 収入", "📤 SAÍDA": "📤 支出",
  "Nenhum registro.": "レコードがありません。",
  // ---- Leilões ----
  "🔨 Leilões": "🔨 オークション", "Como Funciona": "使い方",
  "Novo Leilão": "新しいオークション", "Dar Lance": "入札",
  "Duração": "期間", "Fila de Espera": "待機列",
  "EM ESPERA": "待機中", "Nenhum leilão ativo.": "アクティブオークションがありません。",
  "Finalizar Entrega": "引き渡し完了", "Histórico de Ganhadores": "当選者履歴",
  // ---- Sorteios ----
  "Novo Sorteio": "新しい抽選", "Nenhum.": "なし。",
  "Participar": "参加", "Sortear": "抽選",
  "Encerrado": "終了", "ENCERRADO": "終了",
  "Sorteio criado!": "抽選が作成されました。", "Participando!": "参加中。",
  "Sorteio finalizado!": "抽選が終了しました。",
  // ---- Lotérica ----
  "Lotérica Ativa": "アクティブ宝くじ", "Vendas abiertas": "販売中",
  "Finalizada": "終了", "Configurando": "設定中",
  "Arrecadado Total": "集めた総額",
  "Premio": "賞品", "Teve Ganhador!": "当選者がいます。",
  "Ninguem acertou - Premio acumulou!": "当たった人はいません - 賞品累計。",
  "Finalizar Lotérica": "宝くじ終了",
  "Vender Numero": "番号販売", "Vender": "販売",
  "Loterica criada!": "宝くじが作成されました。",
  "Nova Lotérica": "新しい宝くじ", "Criar Lotérica": "宝くじ作成",
  // ---- Empréstimos ----
  "Regras do Banco": "銀行ルール",
  "Membro Especial": "特別メンバー", "Membro Comum": "一般メンバー",
  "Não Contribuinte": "非貢献者",
  "Calculadora de Empréstimo": "ローン計算機",
  "Dias de Atraso": "延滞日数", "Total a Devolver": "返済総額",
  "itens": "アイテム", "Novo Empréstimo": "新しいローン",
  "Pendentes": "保留", "Pagos": "返済済み",
  "Pendente": "保留", "Pago": "返済済み", "Atrasado": "延滞",
  "Pagar": "支払い", "Confirmar Pagamento": "支払い確認",
  // ---- Tabela ----
  "Tabela de Precos": "価格テーブル", "Alta": "高い", "Media": "中", "Baixa": "低い",
  "Comum": "一般", "Incomum": "レア", "Raro": "レア",
  "Lendario": "伝説", "Demanda": "需要", "Raridade": "レア度",
  "Gerenciar Itens": "アイテム管理", "Reportar": "報告",
  "Editar": "編集", "Restaurar": "復元",
  "Nome do Item *": "アイテム名 *", "Categoria *": "カテゴリ *",
  "Selecionar...": "選択...", "Adicionar Item": "アイテム追加",
  // ---- Admin ----
  "Login Admin": "管理者ログイン", "Verificando...": "確認中...",
  "Backup": "バックアップ", "Senha incorreta!": "パスワードエラー。",
  "Modo Admin ativado!": "管理者モード有効化。",
  "Continuar em Português": "ポルトガル語継続",
  "Traduzir o Site": "サイト翻訳", "Selecione seu idioma": "言語選択",
  "Traduzir para": "翻訳", "Traduzir site": "サイト翻訳",
  // ---- Toasts ----
  "Registro adicionado!": "レコード追加。",
  "Preencha os obrigatórios.": "必須フィールドを入力してください。",
  "Preencha todos os campos.": "すべてのフィールドを入力してください。",
  "Preencha todos.": "すべて入力", "Remover?": "削除しますか?",
  "Sem spam": "スパム禁止",
  "Respeite todos os participantes": "すべての参加者を尊重してください",
  "Sem spam ou flood": "スパム・フラッド禁止",
  // ---- Config ----
  "Configuração de Tabelas de Troca": "取引テーブル設定",
  "Nova Regra": "新しいルール",
  "Como funciona:": "使い方:",
  "Configuração salva!": "設定保存。",
};
const ID: Record<string, string> = {
  // ---- Tabs ----
  "Dashboard": "Dashboard", "Tabela": "Tabel Harga", "Empréstimos": "Pinjaman",
  "Trocas": "Pertukaran", "Doadores": "Donatur", "Leilões": "Lelang",
  "Sorteios": "Undian", "Lotérica": "Loteri", "Investidores": "Investor",
  "Config Trocas": "Pengaturan Pertukaran", "Compras & Vendas": "Beli & Jual",
  "Estoque & Caixa": "Stok & Kas", "Chat": "Obrolan",
  // ---- Common ----
  "Carregando...": "Memuat...", "Carregando dados do banco...": "Memuat data bank...",
  "Cancelar": "Batal", "Entrar": "Masuk", "Salvar": "Simpan", "Fechar": "Tutup",
  "Criar": "Buat", "Remover": "Hapus", "Registrar": "Daftar",
  "Buscar...": "Cari...", "Buscar item...": "Cari item...",
  "Nome": "Nama", "Item": "Item", "Quantidade": "Jumlah",
  "Tipo": "Tipe", "Data": "Tanggal", "Player": "Pemain",
  "Todos": "Semua", "Admin": "Admin", "Modo visual": "Mode tampilan",
  "total": "total", "registros": "catatan",
  "Observação": "Catatan", "Opcional": "Opsional",
  "Dono": "Pemilik", "Moeda": "Mata Uang", "Ganhador": "Pemenang",
  "Vencedor": "Pemenang", "Participantes": "Peserta",
  "Qtd": "Jml", "Inicial": "Awal", "Maior": "Tertinggi",
  "Lances": "Tawaran", "Taxa": "Biaya", "Lucro": "Keuntungan",
  "Bruto:": "Kotor:", "Descrição": "Deskripsi", "Origem": "Asal",
  "Ação": "Aksi", "Disponível": "Tersedia", "Disponivel": "Tersedia",
  // ---- Dashboard ----
  "Empréstimos Pendentes": "Pinjaman Tertunda", "Empréstimos Pagos": "Pinjaman Dibayar",
  "Investidores Ativos": "Investor Aktif", "Trocas Realizadas": "Pertukaran Selesai",
  "Registros no Caixa": "Catatan Kas", "Leilões Ativos": "Lelang Aktif",
  "Sorteios Ativos": "Undian Aktif", "Top 10 Doadores": "Top 10 Donatur",
  "Top 10 Investidores": "Top 10 Investor", "Top 10 Contribuintes": "Top 10 Kontributor",
  "Estoque do Banco": "Stok Bank", "Movimentos do Caixa": "Pergerakan Kas",
  "Eventos Ativos": "Acara Aktif",
  "Nenhum doador cadastrado.": "Tidak ada donatur terdaftar.",
  "Nenhum investidor cadastrado.": "Tidak ada investor terdaftar.",
  "Nenhum contribuinte ainda. Contribua reportando precos na aba Tabela!": "Belum ada kontributor. Laporkan harga di tab Tabel untuk berkontribusi!",
  "Nenhum item encontrado.": "Item tidak ditemukan.",
  "Estoque vazio.": "Stok kosong.", "Nenhum registro ainda.": "Belum ada catatan.",
  "desde": "sejak", "contribuicoes": "kontribusi",
  "Posto de Trocas": "Pos Pertukaran",
  "Sistema de gestao para sobreviventes": "Sistem manajemen untuk penyintas",
  // ---- Chat ----
  "Canais": "Kanal", "Salas Privadas": "Ruang Pribadi",
  "Geral": "Umum", "Atendimento": "Dukungan", "Guias": "Panduan",
  "Clãs": "Klan", "Comércio": "Perdagangan",
  "Nenhuma mensagem ainda. Seja o primeiro a conversar!": "Belum ada pesan. Jadilah yang pertama!",
  "Nenhuma sala criada.": "Tidak ada ruang dibuat.",
  "Nome da sala": "Nama ruang", "Senha (opcional)": "Kata sandi (opsional)",
  "Senha da sala": "Kata sandi ruang", "Sala Privada": "Ruang Pribadi",
  "requer senha": "memerlukan kata sandi", "Voltar": "Kembali",
  "Hoje": "Hari ini", "Ontem": "Kemarin", "Membro": "Anggota",
  "Regras:": "Aturan:", "por": "oleh",
  "Digite seu nome para entrar no chat.": "Ketik nama Anda untuk masuk obrolan.",
  "Seu nome no jogo": "Nama Anda di game",
  "Nenhuma mensagem ainda.": "Belum ada pesan.",
  "Sala": "Ruang", "Mensagem": "Pesan",
  "Evento": "Acara", "Sobreviventes": "Penyintas",
  "Deletar sala": "Hapus ruang", "Deletar mensagem?": "Hapus pesan?",
  // ---- Doadores ----
  "❤️ Doadores": "❤️ Donatur",
  "Ranking": "Peringkat", "Reordenar": "Urutkan ulang",
  "Nova Doação": "Donasi Baru", "Registrar Doação": "Daftar Donasi",
  "Histórico": "Riwayat", "Nenhuma doação.": "Tidak ada donasi.",
  "Doação registrada!": "Donasi terdaftar!",
  "Excluir a doação de": "Hapus donasi:",
  // ---- Investidores ----
  "💎 Membros Investidores": "💎 Anggota Investor",
  "Benefício:": "Keuntungan:",
  "em empréstimos e trocas": "pada pinjaman dan pertukaran",
  "comum": "umum",
  "Como obter a tag?": "Cara mendapat tag?",
  "Ajude o banco — doando itens, fazendo trocas ou de qualquer outra forma.": "Bantu bank — dengan menyumbangkan item, bertukar atau cara lain.",
  "Adicionar Investidor": "Tambah Investor", "Nome do investidor": "Nama investor",
  "Adicionar": "Tambah", "Ativos": "Aktif",
  "Nenhum investidor.": "Tidak ada investor.",
  "Valor Investido": "Nilai Investasi", "Data Entrada": "Tanggal Masuk",
  "Novo Investidor": "Investor Baru", "Editar Investidor": "Edit Investor",
  "Status": "Status", "Ativo": "Aktif", "Inativo": "Tidak Aktif",
  "Investidor cadastrado!": "Investor terdaftar!",
  "Investidor adicionado!": "Investor ditambahkan!",
  // ---- Trocas ----
  "Registro de Trocas": "Catatan Pertukaran", "Nova Troca": "Pertukaran Baru",
  "Selecione": "Pilih", "sem taxa": "tanpa biaya",
  "Player Receibe:": "Pemain Menerima:", "Player entregou:": "Pemain Menyerahkan:",
  "Sai do estoque do Banco:": "Keluar dari stok Bank:", "Entra no estoque do Banco:": "Masuk ke stok Bank:",
  "Calculadora": "Kalkulator", "Troca registrada!": "Pertukaran terdaftar!",
  "Excluir a troca": "Hapus pertukaran", "Registrar Troca": "Daftar Pertukaran",
  "Especial (0%)": "Spesial (0%)", "Top 10 (5%)": "Top 10 (5%)",
  "Investidor (10%)": "Investor (10%)", "Comum (15%)": "Umum (15%)",
  "Não Contribuinte (20%)": "Non-Kontributor (20%)",
  "Banco (100%)": "Bank (100%)", "Banco (100%):": "Bank (100%):",
  "⭐ Especial (0%)": "⭐ Spesial (0%)",
  "👑 Top 10 Investidor (5%)": "👑 Top 10 Investor (5%)",
  "💎 Investidor (10%)": "💎 Investor (10%)",
  "👤 Comum (15%)": "👤 Umum (15%)",
  "⚠️ Não Contribuinte (20%)": "⚠️ Non-Kontributor (20%)",
  // ---- Compras & Vendas ----
  "🛒 Compras e Vendas": "🛒 Beli & Jual",
  "COMPRA:": "BELI:", "VENDA:": "JUAL:",
  "Entra": "Masuk", "Sai": "Keluar", "Paga": "Bayar", "Recebe": "Terima",
  "Compras": "Pembelian", "Vendas": "Penjualan",
  "Nenhuma compra ou venda.": "Tidak ada pembelian atau penjualan.",
  // ---- Caixa ----
  "💰 Caixa do Banco": "💰 Kas Bank",
  "ENTRADA": "MASUK", "SAÍDA": "KELUAR",
  "Entrada": "Masuk", "Saída": "Keluar",
  "Registro Manual": "Catatan Manual",
  "Nome do jogador": "Nama pemain",
  "Estoque Atual": "Stok Saat Ini", "BAIXO": "RENDAH",
  "Resetar": "Reset", "Resetar TUDO?": "Reset SEMUA?",
  "📦 ENTRADA": "📦 MASUK", "📤 SAÍDA": "📤 KELUAR",
  "Nenhum registro.": "Tidak ada catatan.",
  // ---- Leilões ----
  "🔨 Leilões": "🔨 Lelang", "Como Funciona": "Cara Kerja",
  "Novo Leilão": "Lelang Baru", "Dar Lance": "Pasang Tawaran",
  "Duração": "Durasi", "Fila de Espera": "Antrian",
  "EM ESPERA": "MENUNGGU", "Nenhum leilão ativo.": "Tidak ada lelang aktif.",
  "Finalizar Entrega": "Selesaikan Pengiriman", "Histórico de Ganhadores": "Riwayat Pemenang",
  // ---- Sorteios ----
  "Novo Sorteio": "Undian Baru", "Nenhum.": "Tidak ada.",
  "Participar": "Ikut Serta", "Sortear": "Undi",
  "Encerrado": "Ditutup", "ENCERRADO": "DITUTUP",
  "Sorteio criado!": "Undian dibuat!", "Participando!": "Berpartisipasi!",
  "Sorteio finalizado!": "Undian selesai!",
  // ---- Lotérica ----
  "Lotérica Ativa": "Loteri Aktif", "Vendas abiertas": "Penjualan Dibuka",
  "Finalizada": "Selesai", "Configurando": "Konfigurasi",
  "Arrecadado Total": "Total Terkumpul",
  "Premio": "Hadiah", "Teve Ganhador!": "Ada Pemenang!",
  "Ninguem acertou - Premio acumulou!": "Tidak ada yang benar - Hadiah terakumulasi!",
  "Finalizar Lotérica": "Selesaikan Loteri",
  "Vender Numero": "Jual Nomor", "Vender": "Jual",
  "Loterica criada!": "Loteri dibuat!",
  "Nova Lotérica": "Loteri Baru", "Criar Lotérica": "Buat Loteri",
  // ---- Empréstimos ----
  "Regras do Banco": "Aturan Bank",
  "Membro Especial": "Anggota Spesial", "Membro Comum": "Anggota Umum",
  "Não Contribuinte": "Non-Kontributor",
  "Calculadora de Empréstimo": "Kalkulator Pinjaman",
  "Dias de Atraso": "Hari Terlambat", "Total a Devolver": "Total Dikembalikan",
  "itens": "item", "Novo Empréstimo": "Pinjaman Baru",
  "Pendentes": "Tertunda", "Pagos": "Dibayar",
  "Pendente": "Tertunda", "Pago": "Dibayar", "Atrasado": "Terlambat",
  "Pagar": "Bayar", "Confirmar Pagamento": "Konfirmasi Pembayaran",
  // ---- Tabela ----
  "Tabela de Precos": "Tabel Harga", "Alta": "Tinggi", "Media": "Sedang", "Baixa": "Rendah",
  "Comum": "Umum", "Incomum": "Tidak Umum", "Raro": "Langka",
  "Lendario": "Legendaris", "Demanda": "Permintaan", "Raridade": "Kelangkaan",
  "Gerenciar Itens": "Kelola Item", "Reportar": "Laporkan",
  "Editar": "Edit", "Restaurar": "Pulihkan",
  "Nome do Item *": "Nama Item *", "Categoria *": "Kategori *",
  "Selecionar...": "Pilih...", "Adicionar Item": "Tambah Item",
  // ---- Admin ----
  "Login Admin": "Login Admin", "Verificando...": "Memverifikasi...",
  "Backup": "Backup", "Senha incorreta!": "Kata sandi salah!",
  "Modo Admin ativado!": "Mode Admin diaktifkan!",
  "Continuar em Português": "Lanjutkan dalam Portugis",
  "Traduzir o Site": "Terjemahkan Situs", "Selecione seu idioma": "Pilih bahasa",
  "Traduzir para": "Terjemahkan ke", "Traduzir site": "Terjemahkan situs",
  // ---- Toasts ----
  "Registro adicionado!": "Catatan ditambahkan!",
  "Preencha os obrigatórios.": "Isi bidang wajib.",
  "Preencha todos os campos.": "Isi semua bidang.",
  "Preencha todos.": "Isi semua.", "Remover?": "Hapus?",
  "Sem spam": "Tanpa spam",
  "Respeite todos os participantes": "Hormati semua peserta",
  "Sem spam ou flood": "Tanpa spam atau flood",
  // ---- Config ----
  "Configuração de Tabelas de Troca": "Konfigurasi Tabel Pertukaran",
  "Nova Regra": "Aturan Baru",
  "Como funciona:": "Cara kerja:",
  "Configuração salva!": "Konfigurasi tersimpan!",
};

const TR: Record<string, string> = {
  // ---- Tabs ----
  "Dashboard": "Kontrol Paneli", "Tabela": "Fiyat Tablosu", "Empréstimos": "Kredi",
  "Trocas": "Takas", "Doadores": "Bağışçılar", "Leilões": "Müzayede",
  "Sorteios": "Çekiliş", "Lotérica": "Piyango", "Investidores": "Yatırımcılar",
  "Config Trocas": "Takas Ayarları", "Compras & Vendas": "Alım & Satım",
  "Estoque & Caixa": "Stok & Kasa", "Chat": "Sohbet",
  // ---- Common ----
  "Carregando...": "Yükleniyor...", "Carregando dados do banco...": "Banka verileri yükleniyor...",
  "Cancelar": "İptal", "Entrar": "Gir", "Salvar": "Kaydet", "Fechar": "Kapat",
  "Criar": "Oluştur", "Remover": "Kaldır", "Registrar": "Kaydet",
  "Buscar...": "Ara...", "Buscar item...": "Eşya ara...",
  "Nome": "İsim", "Item": "Eşya", "Quantidade": "Miktar",
  "Tipo": "Tür", "Data": "Tarih", "Player": "Oyuncu",
  "Todos": "Tümü", "Admin": "Admin", "Modo visual": "Görünüm modu",
  "total": "toplam", "registros": "kayıt",
  "Observação": "Not", "Opcional": "İsteğe bağlı",
  "Dono": "Sahip", "Moeda": "Para Birimi", "Ganhador": "Kazanan",
  "Vencedor": "Kazanan", "Participantes": "Katılımcılar",
  "Qtd": "Miktar", "Inicial": "Başlangıç", "Maior": "En yüksek",
  "Lances": "Teklifler", "Taxa": "Komisyon", "Lucro": "Kâr",
  "Bruto:": "Bürüt:", "Descrição": "Açıklama", "Origem": "Kaynak",
  "Ação": "Eylem", "Disponível": "Mevcut", "Disponivel": "Mevcut",
  // ---- Dashboard ----
  "Empréstimos Pendentes": "Bekleyen Krediler", "Empréstimos Pagos": "Ödenen Krediler",
  "Investidores Ativos": "Aktif Yatırımcılar", "Trocas Realizadas": "Yapılan Takaslar",
  "Registros no Caixa": "Kasa Kayıtları", "Leilões Ativos": "Aktif Müzayedeler",
  "Sorteios Ativos": "Aktif Çekilişler", "Top 10 Doadores": "Top 10 Bağışçı",
  "Top 10 Investidores": "Top 10 Yatırımcı", "Top 10 Contribuintes": "Top 10 Katkıda Bulunanlar",
  "Estoque do Banco": "Banka Stoku", "Movimentos do Caixa": "Kasa Hareketleri",
  "Eventos Ativos": "Aktif Etkinlikler",
  "Nenhum doador cadastrado.": "Kayıtlı bağışçı yok.",
  "Nenhum investidor cadastrado.": "Kayıtlı yatırımcı yok.",
  "Nenhum contribuinte ainda. Contribua reportando precos na aba Tabela!": "Henüz katkıda bulunan yok. Fiyat tablosunda fiyat raporlayarak katkıda bulunun!",
  "Nenhum item encontrado.": "Eşya bulunamadı.",
  "Estoque vazio.": "Stok boş.", "Nenhum registro ainda.": "Henüz kayıt yok.",
  "desde": "tarafından", "contribuicoes": "katkı",
  "Posto de Trocas": "Takas İstasyonu",
  "Sistema de gestao para sobreviventes": "Hayatta kalanlar için yönetim sistemi",
  // ---- Chat ----
  "Canais": "Kanallar", "Salas Privadas": "Özel Odalar",
  "Geral": "Genel", "Atendimento": "Destek", "Guias": "Rehberler",
  "Clãs": "Klanlar", "Comércio": "Ticaret",
  "Nenhuma mensagem ainda. Seja o primeiro a conversar!": "Henüz mesaj yok. İlk konuşan siz olun!",
  "Nenhuma sala criada.": "Oda oluşturulmadı.",
  "Nome da sala": "Oda adı", "Senha (opcional)": "Şifre (isteğe bağlı)",
  "Senha da sala": "Oda şifresi", "Sala Privada": "Özel Oda",
  "requer senha": "şifre gerekiyor", "Voltar": "Geri",
  "Hoje": "Bugün", "Ontem": "Dün", "Membro": "Üye",
  "Regras:": "Kurallar:", "por": "tarafından",
  "Digite seu nome para entrar no chat.": "Sohbete girmek için adınızı girin.",
  "Seu nome no jogo": "Oyundaki adınız",
  "Nenhuma mensagem ainda.": "Henüz mesaj yok.",
  "Sala": "Oda", "Mensagem": "Mesaj",
  "Evento": "Etkinlik", "Sobreviventes": "Hayatta kalanlar",
  "Deletar sala": "Odayı sil", "Deletar mensagem?": "Mesajı sil?",
  // ---- Doadores ----
  "❤️ Doadores": "❤️ Bağışçılar",
  "Ranking": "Sıralama", "Reordenar": "Yeniden sırala",
  "Nova Doação": "Yeni Bağış", "Registrar Doação": "Bağışı Kaydet",
  "Histórico": "Geçmiş", "Nenhuma doação.": "Bağış yok.",
  "Doação registrada!": "Bağış kaydedildi!",
  "Excluir a doação de": "Bağışı sil:",
  // ---- Investidores ----
  "💎 Membros Investidores": "💎 Yatırımcı Üyeler",
  "Benefício:": "Avantaj:",
  "em empréstimos e trocas": "kredilerde ve takaslarda",
  "comum": "normal",
  "Como obter a tag?": "Tagı nasıl alabilirim?",
  "Ajude o banco — doando itens, fazendo trocas ou de qualquer outra forma.": "Bankaya yardım edin — eşya bağışlayarak, takas yaparak veya başka yollarla.",
  "Adicionar Investidor": "Yatırımcı Ekle", "Nome do investidor": "Yatırımcı adı",
  "Adicionar": "Ekle", "Ativos": "Aktif",
  "Nenhum investidor.": "Yatırımcı yok.",
  "Valor Investido": "Yatırım Tutarı", "Data Entrada": "Giriş Tarihi",
  "Novo Investidor": "Yeni Yatırımcı", "Editar Investidor": "Yatırımcıyı Düzenle",
  "Status": "Durum", "Ativo": "Aktif", "Inativo": "Pasif",
  "Investidor cadastrado!": "Yatırımcı kaydedildi!",
  "Investidor adicionado!": "Yatırımcı eklendi!",
  // ---- Trocas ----
  "Registro de Trocas": "Takas Kayıtları", "Nova Troca": "Yeni Takas",
  "Selecione": "Seçin", "sem taxa": "komisyonsuz",
  "Player Receibe:": "Oyuncu Alır:", "Player entregou:": "Oyuncu Teslim Etti:",
  "Sai do estoque do Banco:": "Banka stokundan çıktı:", "Entra no estoque do Banco:": "Banka stokuna girdi:",
  "Calculadora": "Hesap Makinesi", "Troca registrada!": "Takas kaydedildi!",
  "Excluir a troca": "Takası sil", "Registrar Troca": "Takası Kaydet",
  "Especial (0%)": "Özel (0%)", "Top 10 (5%)": "Top 10 (5%)",
  "Investidor (10%)": "Yatırımcı (10%)", "Comum (15%)": "Normal (15%)",
  "Não Contribuinte (20%)": "Katkıda Bulunmayan (20%)",
  "Banco (100%)": "Banka (100%)", "Banco (100%):": "Banka (100%):",
  "⭐ Especial (0%)": "⭐ Özel (0%)",
  "👑 Top 10 Investidor (5%)": "👑 Top 10 Yatırımcı (5%)",
  "💎 Investidor (10%)": "💎 Yatırımcı (10%)",
  "👤 Comum (15%)": "👤 Normal (15%)",
  "⚠️ Não Contribuinte (20%)": "⚠️ Katkıda Bulunmayan (20%)",
  // ---- Compras & Vendas ----
  "🛒 Compras e Vendas": "🛒 Alım & Satım",
  "COMPRA:": "ALIM:", "VENDA:": "SATIŞ:",
  "Entra": "Girer", "Sai": "Çıkar", "Paga": "Öder", "Recebe": "Alır",
  "Compras": "Alımlar", "Vendas": "Satışlar",
  "Nenhuma compra ou venda.": "Alım veya satış yok.",
  // ---- Caixa ----
  "💰 Caixa do Banco": "💰 Banka Kasası",
  "ENTRADA": "GİRİŞ", "SAÍDA": "ÇIKIŞ",
  "Entrada": "Giriş", "Saída": "Çıkış",
  "Registro Manual": "Manuel Kayıt",
  "Nome do jogador": "Oyuncu adı",
  "Estoque Atual": "Mevcut Stok", "BAIXO": "DÜŞÜK",
  "Resetar": "Sıfırla", "Resetar TUDO?": "TÜMÜNÜ sıfırla?",
  "📦 ENTRADA": "📦 GİRİŞ", "📤 SAÍDA": "📤 ÇIKIŞ",
  "Nenhum registro.": "Kayıt yok.",
  // ---- Leilões ----
  "🔨 Leilões": "🔨 Müzayede", "Como Funciona": "Nasıl Çalışır",
  "Novo Leilão": "Yeni Müzayede", "Dar Lance": "Teklif Ver",
  "Duração": "Süre", "Fila de Espera": "Bekleme Kuyruğu",
  "EM ESPERA": "BEKLİYORDE", "Nenhum leilão ativo.": "Aktif müzayede yok.",
  "Finalizar Entrega": "Teslimatı Tamamla", "Histórico de Ganhadores": "Kazananlar Geçmişi",
  // ---- Sorteios ----
  "Novo Sorteio": "Yeni Çekiliş", "Nenhum.": "Yok.",
  "Participar": "Katıl", "Sortear": "Çekiliş Yap",
  "Encerrado": "Kapalı", "ENCERRADO": "KAPALI",
  "Sorteio criado!": "Çekiliş oluşturuldu!", "Participando!": "Katılımda!",
  "Sorteio finalizado!": "Çekiliş tamamlandı!",
  // ---- Lotérica ----
  "Lotérica Ativa": "Aktif Piyango", "Vendas abiertas": "Satışlar açık",
  "Finalizada": "Tamamlandı", "Configurando": "Yapılandırma",
  "Arrecadado Total": "Toplam Toplanan",
  "Premio": "Ödül", "Teve Ganhador!": "Kazanan var!",
  "Ninguem acertou - Premio acumulou!": "Kimse tutamadı - Ödül birikleşti!",
  "Finalizar Lotérica": "Piyangoyu Tamamla",
  "Vender Numero": "Numara Sat", "Vender": "Sat",
  "Loterica criada!": "Piyango oluşturuldu!",
  "Nova Lotérica": "Yeni Piyango", "Criar Lotérica": "Piyango Oluştur",
  // ---- Empréstimos ----
  "Regras do Banco": "Banka Kuralları",
  "Membro Especial": "Özel Üye", "Membro Comum": "Normal Üye",
  "Não Contribuinte": "Katkıda Bulunmayan",
  "Calculadora de Empréstimo": "Kredi Hesaplayıcı",
  "Dias de Atraso": "Gecikme Günleri", "Total a Devolver": "Geri Ödenecek Tutar",
  "itens": "eşyalar", "Novo Empréstimo": "Yeni Kredi",
  "Pendentes": "Bekleyen", "Pagos": "Ödenen",
  "Pendente": "Bekleyen", "Pago": "Ödenen", "Atrasado": "Gecikmiş",
  "Pagar": "Öde", "Confirmar Pagamento": "Ödemeyi Onayla",
  // ---- Tabela ----
  "Tabela de Precos": "Fiyat Tablosu", "Alta": "Yüksek", "Media": "Orta", "Baixa": "Düşük",
  "Comum": "Normal", "Incomum": "Yaygın Olmayan", "Raro": "Nadir",
  "Lendario": "Efsanevi", "Demanda": "Talep", "Raridade": "Nadirlik",
  "Gerenciar Itens": "Eşyaları Yönet", "Reportar": "Raporla",
  "Editar": "Düzenle", "Restaurar": "Geri Yükle",
  "Nome do Item *": "Eşya Adı *", "Categoria *": "Kategori *",
  "Selecionar...": "Seçin...", "Adicionar Item": "Eşya Ekle",
  // ---- Admin ----
  "Login Admin": "Admin Girişi", "Verificando...": "Doğrulanıyor...",
  "Backup": "Yedek", "Senha incorreta!": "Yanlış şifre!",
  "Modo Admin ativado!": "Admin modu etkinleştirildi!",
  "Continuar em Português": "Portekizce Devam Et",
  "Traduzir o Site": "Siteyi Çevir", "Selecione seu idioma": "Dil seçin",
  "Traduzir para": "Şuna çevir", "Traduzir site": "Siteyi çevir",
  // ---- Toasts ----
  "Registro adicionado!": "Kayıt eklendi!",
  "Preencha os obrigatórios.": "Zorunlu alanları doldurun.",
  "Preencha todos os campos.": "Tüm alanları doldurun.",
  "Preencha todos.": "Hepsini doldurun.", "Remover?": "Kaldır?",
  "Sem spam": "Spam yok",
  "Respeite todos os participantes": "Tüm katılımcılara saygı gösterin",
  "Sem spam ou flood": "Spam veya flood yok",
  // ---- Config ----
  "Configuração de Tabelas de Troca": "Takas Tablosu Yapılandırması",
  "Nova Regra": "Yeni Kural",
  "Como funciona:": "Nasıl çalışır:",
  "Configuração salva!": "Yapılandırma kaydedildi!",
};

const dictionaries: Record<string, Record<string, string>> = { en: EN, es: ES, fr: FR, de: DE, ru: RU, it: IT, "zh-cn": ZH_CN, "zh-tw": ZH_TW, ko: KO, ja: JA, id: ID, tr: TR };

/* ============================================================
   TRANSLATION ENGINE
   ============================================================ */
const originalText = new WeakMap<Text, string>();
let observer: MutationObserver | null = null;
let currentLang = "pt";
let apiDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const apiCache = new Map<string, string>();
let isTranslating = false;

/* ---- Dynamic item-name translation (loaded from _pt_index.json) ---- */
let itemPtToEn: Record<string, string> | undefined;
let itemLoaded = false;
async function loadItemIndex() {
  if (itemLoaded) return;
  itemLoaded = true;
  try {
    const res = await fetch("/items/_pt_index.json");
    if (!res.ok) return;
    const data: Array<{ pt: string; file: string }> = await res.json();
    itemPtToEn = {};
    for (const item of data) {
      // Convert snake_case file name to Title Case English
      const en = item.file
        .split("_")
        .map((w, i) => {
          // Keep leading number groups together (e.g. "7_62x25mm" → "7 62x25mm")
          if (i === 0 && /^\d/.test(w)) return w.replace(/(\d+)([a-z])/, "$1 $2").replace(/\b\w/g, c => c.toUpperCase());
          return w.charAt(0).toUpperCase() + w.slice(1);
        })
        .join(" ");
      itemPtToEn[item.pt] = en;
      const lower = item.pt.toLowerCase();
      if (lower !== item.pt) itemPtToEn[lower] = en;
      const stripped = stripAccents(lower);
      if (stripped !== lower) itemPtToEn[stripped] = en;
      // Also store the title-cased version
      const title = item.pt.replace(/\b\w/g, c => c.toUpperCase());
      if (title !== item.pt) itemPtToEn[title] = en;
    }
  } catch { /* silent */ }
}
// Eagerly load item index
loadItemIndex().then(() => { if (currentLang !== "pt") translatePage(currentLang); });

/** Pre-built case-insensitive EN map (lazy) */
let _enLower: Record<string, string> | undefined;
function getEnLower(): Record<string, string> {
  if (!_enLower) {
    _enLower = {};
    for (const [k, v] of Object.entries(EN)) {
      const lk = k.toLowerCase();
      if (!_enLower[lk]) _enLower[lk] = v;
      // Also index accent-stripped variant so "aco" matches "aço" → "Steel"
      const sk = stripAccents(lk);
      if (sk !== lk && !_enLower[sk]) _enLower[sk] = v;
    }
  }
  return _enLower;
}

/** Check if text looks like a player name (should never be translated) */
function looksLikeName(text: string): boolean {
  const t = text.trim();
  if (t.length < 2 || t.length > 30) return false;
  if (t === "Admin" || t === "Membro") return false; // real UI words
  // Contains underscore (e.g. SINGLE_PLAYER)
  if (/_/.test(t)) return true;
  // All uppercase 3+ chars (e.g. ADMIN)
  if (/^[A-Z0-9]{3,}$/.test(t)) return true;
  // Mixed case without spaces – camelCase or PascalCase nicks (e.g. MPBRGAMER, RedFoot)
  if (!/\s/.test(t) && /[a-z]/.test(t) && /[A-Z]/.test(t) && !/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ][a-záéíóúâêîôûãõç]+/.test(t)) return true;
  // Digits mixed with letters (e.g. Player123)
  if (/\d/.test(t) && /[a-zA-Z]/.test(t) && t.length <= 20) return true;
  // Parenthesized server tags (e.g. "(NES) FERNAL30")
  if (/^\([A-Z]+\)/.test(t)) return true;
  return false;
}

/** Strip diacritics */
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

/** Collect all text content that is protected by data-no-translate / translate=no */
function collectProtectedTexts(): Set<string> {
  const set = new Set<string>();
  document.querySelectorAll('[data-no-translate], [translate="no"]').forEach(el => {
    // Use TreeWalker to collect ALL text nodes within protected elements (not just direct children)
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const t = node.textContent?.trim();
      if (t && t.length > 0) set.add(t);
    }
  });
  return set;
}

function lookup(text: string, langCode: string, dictionary: Record<string, string> | undefined): string | undefined {
  const norm = stripAccents(text);
  const lower = text.toLowerCase();
  const el = getEnLower();
  // Check dynamic item index first (covers 300+ game items)
  if (itemPtToEn) {
    const itemEn = itemPtToEn[text] || itemPtToEn[lower] || itemPtToEn[norm];
    if (itemEn) return itemEn;
  }
  if (langCode === "en") {
    return EN[text] || EN[norm] || el[lower] || apiCache.get(text) || apiCache.get(norm);
  }
  return dictionary?.[text] || EN[text] || el[lower] || dictionary?.[norm] || EN[norm] || apiCache.get(text) || apiCache.get(norm);
}

function translatePage(langCode: string) {
  if (isTranslating) return;
  isTranslating = true;

  // Disconnect observer during translation to prevent infinite loop
  if (observer) observer.disconnect();

  try {
    currentLang = langCode;
    const dictionary = dictionaries[langCode];
    document.documentElement.lang = langCode === "pt" ? "pt-BR" : langCode;

    // Collect all protected texts from data-no-translate / translate=no elements
    const protectedTexts = collectProtectedTexts();

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
    let n: Node | null;
    while ((n = walker.nextNode())) nodes.push(n as Text);

    const untranslated: string[] = [];

    for (const textNode of nodes) {
      if (hasNoTranslateAncestor(textNode)) continue;
      if (!originalText.has(textNode)) originalText.set(textNode, textNode.nodeValue || "");
      const source = originalText.get(textNode) || "";
      const trimmed = source.trim();
      if (!trimmed) continue;

      // Skip protected texts (double safety for player names)
      if (protectedTexts.has(trimmed)) continue;
      // Skip texts that look like player names
      if (looksLikeName(trimmed)) continue;

      if (langCode === "pt") {
        if (textNode.nodeValue !== source) textNode.nodeValue = source;
        continue;
      }

      const translated = lookup(trimmed, langCode, dictionary);
      if (translated) {
        const nextValue = source === trimmed ? translated : source.replace(trimmed, translated);
        if (textNode.nodeValue !== nextValue) textNode.nodeValue = nextValue;
      } else if (trimmed.length > 2 && !/^\d+[\,\d]*$/.test(trimmed) && !/^[#\-+°×→←↑↓]*$/.test(trimmed) && !looksLikeName(trimmed)) {
        untranslated.push(trimmed);
      }
    }

    if (langCode !== "pt") {
      document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach((el) => {
        const htmlEl = el as HTMLInputElement;
        const ph = htmlEl.placeholder;
        if (!ph) return;
        if (protectedTexts.has(ph)) return;
        const tr = lookup(ph, langCode, dictionary);
        if (tr) htmlEl.placeholder = tr;
      });
      document.querySelectorAll("[title]").forEach((el) => {
        const htmlEl = el as HTMLElement;
        const t = htmlEl.getAttribute("title");
        if (!t) return;
        if (protectedTexts.has(t)) return;
        const tr = lookup(t, langCode, dictionary);
        if (tr) htmlEl.setAttribute("title", tr);
      });
    }

    // Filter out protected texts and name-like texts from API queue
    const filtered = untranslated.filter(t => !protectedTexts.has(t) && !looksLikeName(t));
    if (filtered.length > 0 && langCode !== "pt") {
      queueApiTranslation(filtered, langCode);
    }
  } finally {
    isTranslating = false;
    // Reconnect observer after translation
    if (observer && currentLang !== "pt") {
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    }
  }
}

function queueApiTranslation(texts: string[], langCode: string) {
  if (apiDebounceTimer) clearTimeout(apiDebounceTimer);
  apiDebounceTimer = setTimeout(async () => {
    const unique = [...new Set(texts)].slice(0, 30);
    const toFetch = unique.filter((t) => !apiCache.has(t) && !apiCache.has(stripAccents(t)) && !looksLikeName(t));
    if (toFetch.length === 0) return;
    try {
      const langMap: Record<string, string> = {
      en: "en", es: "es", fr: "fr", de: "de", ru: "ru",
      it: "it", "zh-cn": "zh", "zh-tw": "zh-TW", ko: "ko", ja: "ja", id: "id", tr: "tr",
    };
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
      if (Object.keys(translations).length > 0) {
        translatePage(langCode);
      }
    } catch {
      // Silently fail
    }
  }, 400);
}

function setLanguage(code: string) {
  currentLang = code;
  localStorage.setItem("dayr-language", code);
  if (code === "pt") {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let n: Node | null;
    while ((n = walker.nextNode())) {
      const textNode = n as Text;
      const orig = originalText.get(textNode);
      if (orig !== undefined && textNode.nodeValue !== orig) textNode.nodeValue = orig;
    }
    document.documentElement.lang = "pt-BR";
    if (observer) { observer.disconnect(); observer = null; }
    apiCache.clear();
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
/* ============================================================
   EXPORTED HELPERS
   ============================================================ */
export function getDateLocale(): string {
  const lang = typeof window !== "undefined" ? (localStorage.getItem("dayr-language") || "pt") : "pt";
  const map: Record<string, string> = {
    pt: "pt-BR", en: "en-US", es: "es-ES", fr: "fr-FR", de: "de-DE", ru: "ru-RU",
    it: "it-IT", "zh-cn": "zh-CN", "zh-tw": "zh-TW", ko: "ko-KR", ja: "ja-JP", id: "id-ID", tr: "tr-TR",
  };
  return map[lang] || "pt-BR";
}

export function setTranslationLanguage(code: string) {
  setLanguage(code);
}

/* ============================================================
   REACT COMPONENTS
   ============================================================ */
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
  const choose = (code: string) => {
    setLanguage(code);
    setShowPopup(false);
    localStorage.setItem("translation-popup-dismissed", "1");
  };
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
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-border hover:border-primary/40 text-left"
                >
                  <span>{lang.flag}</span>
                  <span className="text-xs font-medium">{lang.label}</span>
                </button>
              ))}
            </div>
            <div className="px-5 py-3 border-t border-border flex justify-end">
              <button
                onClick={() => setShowPopup(false)}
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
  return <TranslateFloatButton onChoose={setLanguage} />;
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
