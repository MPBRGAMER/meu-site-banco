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
  "Observação": "Note",
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
  "Histórico": "History",
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
  "Registrar": "Register",
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
  "Ganhador": "Winner",
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
  "Sorteios": "Raffles",
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
  "ganhador": "winner",
  "comes out!": "comes out!",

  // ---- Empréstimos ----
  "Empréstimos": "Loans",
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
  "Quantidade:": "Quantity:",
  "Especial (0%)": "Special (0%)",
  "Top 10 Investidor (5%)": "Top 10 Investor (5%)",
  "Investidor (10%)": "Investor (10%)",
  "Comum (15%)": "Common (15%)",
  "Não Contribuinte (20%)": "Non-Contributor (20%)",

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
  "Adicionar": "Add",
  "Removidos": "Removed",
  "Adicione novos itens a tabela. Eles serao salvos no banco de dados como override.": "Add new items to the table. They will be saved to the database as overrides.",
  "Nome do Item *": "Item Name *",
  "Categoria *": "Category *",
  "Selecionar...": "Select...",
  "Imagem do item": "Item image",
  "Wiki Link": "Wiki Link",
  "Preco Aco": "Steel Price",
  "Preco Cimento": "Cement Price",
  "Raridade": "Rarity",
  "Demanda": "Demand",
  "Notas": "Notes",
  "Escolher imagem": "Choose image",
  "Adicionar Item": "Add Item",
  "Editar": "Edit",
  "Restaurar": "Restore",
  "Itens marcados para remocao nesta sessao.": "Items marked for removal in this session.",
  "Nenhum item removido.": "No items removed.",
  "Confirmar Remocao de": "Confirm Removal of",
  "itens": "items",
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
  "Banco (100% — troca interna)": "Bank (100% — internal trade)",
  "Item que sai do estoque do Banco": "Item leaving Bank stock",
  "Item que ele entrega": "Item he hands in",
  "Quantidade (em base)": "Quantity (in base)",
  "Preencha o formulário ao lado.": "Fill the form on the side.",
  "Sai do estoque do Banco:": "Leaves Bank stock:",
  "Player entregou:": "Player handed in:",
  "O item recebido entra no estoque do Banco; não há taxa nem lucro.": "The received item enters Bank stock; no fee or profit.",
  "Entra no estoque do Banco:": "Enters Bank stock:",
  "Player Recebe:": "Player Receives:",
  "Banco": "Bank",
  "Entrou:": "Entered:",
  "Recebeu:": "Received:",
  "Excluir troca e estornar estoque": "Exclude trade and reverse stock",
  "Troca excluída e estoque estornado.": "Trade excluded and stock reversed.",
  "Não foi possível excluir a troca.": "Could not exclude the trade.",
  "Entregou": "Handed in",

  // ---- EmprestimosTab additional ----
  "Preencha o item e a quantidade.": "Fill item and quantity.",
  "Preencha todos os campos.": "Fill all fields.",
  "Calculadora": "Calculator",
  "Membro Especial": "Special Member",
  "sem acréscimo": "no surcharge",
  "Top 10 Investidor": "Top 10 Investor",
  "de acréscimo": "surcharge",
  "Investidor": "Investor",
  "Membro Comum": "Common Member",
  "Não Contribuinte": "Non-Contributor",
  "Novo Empréstimo": "New Loan",
  "Pendentes": "Pending",
  "Pagos": "Paid",
  "Nenhum empréstimo pendente.": "No pending loans.",
  "Pendente": "Pending",
  "Pago": "Paid",
  "Atrasado": "Overdue",
  "Pagar": "Pay",
  "Item:": "Item:",
  "Valor a cobrar:": "Amount to charge:",
  "Vencimento:": "Due date:",
  "Empréstimo atrasado - Juros já incluídos": "Overdue loan - Interest already included",
  "Item do Pagamento": "Payment Item",
  "Confirmar Pagamento": "Confirm Payment",

  // ---- DoadoresTab additional ----
  "Preencha nome, item e quantidade.": "Fill name, item and quantity.",
  "Doação excluída e estoque estornado.": "Donation deleted and stock reversed.",
  "Não foi possível excluir a doação.": "Could not delete the donation.",
  "Registre doações. Toda doação entra no estoque automaticamente.": "Register donations. Every donation goes into stock automatically.",
  "Reordenar Doadores": "Reorder Donors",

  // ---- InvestidoresTab additional ----
  "Membros Investidores": "Investor Members",
  "Benefício:": "Benefit:",
  "em empréstimos e trocas": "on loans and trades",
  "comum": "common",
  "Como obter a tag?": "How to get the tag?",
  "Ajude o banco — doando itens, fazendo trocas ou de qualquer outra forma.": "Help the bank — by donating items, making trades or any other way.",
  "Adicionar Investidor": "Add Investor",
  "Nome do investidor": "Investor name",
  "Reordenar Investidores": "Reorder Investors",
  "Desde": "Since",
  "Ativos": "Active",
  "Nenhum investidor.": "No investors.",

  // ---- CaixaTab additional ----
  "Preencha os obrigatórios.": "Fill required fields.",
  "Nenhum registro.": "No records.",

  // ---- LeiloesTab additional ----
  "Preencha nome e valor.": "Fill name and value.",
  "Preencha os campos obrigatórios.": "Fill required fields.",
  "Moeda:": "Currency:",
  "Valor (mín:": "Value (min:",
  "Disputa final!": "Final dispute!",
  "Dono:": "Owner:",
  "Auto-preenchido": "Auto-filled",
  "Valor": "Value",
  "Excluir a troca de": "Exclude trade from",
  "O movimento registrado no estoque será estornado.": "The stock movement will be reversed.",

  // ---- LotericaTab additional ----
  "Preencha valor e moeda.": "Fill value and currency.",
  "Ja existe loterica ativa. Finalize a atual.": "There's already an active lottery. Finalize the current one.",
  "Lotérica criada!": "Lottery created!",
  "Numero e nome obrigatorios.": "Number and name required.",
  "Numero entre 1 e 1000.": "Number between 1 and 1000.",
  "Sem loterica ativa.": "No active lottery.",
  "Numero": "Number",
  "Numero (1-1000)": "Number (1-1000)",
  "Numero sorteado:": "Drawn number:",
  "Configurando": "Configuring",
  "Sorteio criado!": "Raffle created!",
  "Preencha todos.": "Fill all.",
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
  "1 minuto (teste)": "1 minute (test)",
  "1 hora": "1 hour",
  "6 horas": "6 hours",
  "12 horas": "12 hours",
  "24 horas": "24 hours",
  "48 horas": "48 hours",
  "Dar Lance": "Place Bid",
  "Seu Nome": "Your Name",
  "O tempo de disputa acabou.": "Dispute time has ended.",
  "Nenhum leilão ativo.": "No active auctions.",
  "Remover?": "Remove?",
  "Histórico de Ganhadores": "Winners History",
  "Doadores": "Donors",
  "Nenhum.": "None.",
  "Historico de Ganhadores": "Winners History",
  "Data do Sorteio": "Raffle Date",
  "Todos os Participantes": "All Participants",
  "Nenhum": "None",
  "Admin cria sorteio com": "Admin creates raffle with",
  "item e duracao": "item and duration",
  "Qualquer membro participa com seu nome.": "Any member participates with their name.",
  "Timer acaba": "Timer ends",
  "sorteado": "drawn",
  "Novo Sorteio": "New Raffle",
  "Duracao (min)": "Duration (min)",
  "Seu nome": "Your name",
  "Acumulou": "Accumulated",
  "Arrecadado": "Raised",
  "Premio Final": "Final Prize",
  "Data Sorteio": "Draw Date",
  "1000 numeros": "1000 numbers",
  "preco fixo por numero.": "fixed price per number.",
  "das vendas vai pro banco": "of sales goes to the bank",
  "vai pro premio": "goes to the prize",
  "Premio =": "Prize =",
  "maior entre 80% das vendas e o minimo": "max of 80% of sales and the minimum",
  "Se ninguem acertar, o premio": "If nobody gets it right, the prize",
  "vira o novo minimo": "becomes the new minimum",
  "da proxima.": "of the next one.",
  "So reseta quando sair um": "Only resets when a",
  "ganhador": "winner",
  "comes out!": "comes out!",
  "Configurar Lotérica": "Configure Lottery",
  "Criar Lotérica": "Create Lottery",
  "Valor/Numero": "Value/Number",
  "Premio Minimo": "Minimum Prize",
  "Duracao Vendas (min)": "Sales Duration (min)",
  "Vendas abertas": "Sales open",
  "Sorteio realizado": "Draw performed",
  "Finalizada": "Finalized",
  "Min. acumulado": "Min. accumulated",
  "Credita ao finalizar": "Credits on finalization",
  "Calculo do Premio": "Prize Calculation",
  "80% arrecadado": "80% raised",
  "Minimo original": "Original minimum",
  "Min. efetivo": "Effective minimum",
  "Premio = maior entre 80% do arrecadado e o minimo efetivo": "Prize = max of 80% raised and effective minimum",
  "que veio do acumulado.": "that came from accumulated.",
  "creditado no estoque.": "credited to stock.",
  "Vender Numero": "Sell Number",
  "Nome do Comprador": "Buyer Name",
  "Realizar Sorteio": "Perform Draw",
  "As vendas encerraram. Sorteie para definir o ganhador.": "Sales have ended. Draw to determine the winner.",
  "Nenhum numero vendido! Nao e possivel sortear.": "No numbers sold! Cannot draw.",
  "Nenhum numero.": "No numbers.",
  "Nenhuma lotérica ativa. Crie uma nova acima.": "No active lottery. Create a new one above.",
  "Nenhuma lotérica ativa no momento.": "No active lottery at the moment.",
  "Historico de Sorteios": "Draw History",

  // ---- ChatTab additional ----
  "Chat": "Chat - Trading Post",
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
  "Categoria *": "Category *",
  "Categoria": "Category",
  "Prévia do novo item": "New item preview",
  "Prévia do item": "Item preview",
  "Observacoes sobre o item...": "Notes about the item...",
  "Salvando...": "Saving...",
  "Aco": "Steel",
  "item": "item",
  "itens": "items",
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
  "Ex: Katana": "Ex: Katana",
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
  "Acumulou": "Accumulated",
  "Banco": "Bank",
  "1º": "1st",
  "2º": "2nd",
  "3º": "3rd",
  "Desde": "Since",
  "Nenhuma compra ou venda.": "No purchases or sales.",
  "Nenhum registro.": "No records.",
  "Disponivel": "Available",

  // ---- Common game items (for inventory & cash flow) ----
  "Aço": "Steel",
  "Cimento": "Cement",
  "Moeda": "Currency",
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
  "Duração": "Duration",
  "Quantidade": "Quantity",
  "Qualidade": "Quality",
  "Possível": "Possible",
  "Impossível": "Impossible",
  "Disponível": "Available",
  "Indisponível": "Unavailable",
  "Necessário": "Necessary",
  "Obrigatório": "Mandatory",
  "Opcional": "Optional",
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
  "Histórico": "History",
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
  "Criado": "Created",
  "Finalizado": "Finalized",
  "Iniciado": "Started",
  "Encerrado": "Closed",
  "Cancelado": "Cancelled",

  // ---- Tabela tab (Reportar/Guia) ----
  "Tabela de Preços": "Price Table",
  "Tabela de Precos": "Price Table",
  "Reportar Preços": "Report Prices",
  "Reportar Precos": "Report Prices",
  "Guia da Tabela de Preços": "Price Table Guide",
  "Guia da Tabela de Precos": "Price Table Guide",
  "Gerenciar Itens": "Manage Items",
  "Viu um preço diferente no jogo?": "See a different price in-game?",
  "Seus reports aparecem na Tendência.": "Your reports appear in Trends.",
  "Qtd Aço": "Steel Qty",
  "Valor Aço ($)": "Steel Value ($)",
  "Qtd Cimento": "Cement Qty",
  "Valor Cimento ($)": "Cement Value ($)",
  "Níveis de Demanda": "Demand Levels",
  "Fonte dos Dados": "Data Source",
  "Ultimos Reports da Comunidade": "Latest Community Reports",
  "Últimos Reports da Comunidade": "Latest Community Reports",
  "Ver no Wiki:": "View on Wiki:",
  "Tendência": "Trend",
  "Tendencia": "Trend",
  "Reportar": "Report",
  "reportado!": "reported!",
  "reportou": "reported",
  "Enviando...": "Sending...",
  "Erro ao reportar.": "Error reporting.",
  "Nenhum report ainda.": "No reports yet.",
  "Reportar Preco": "Report Price",

  // ---- Trocas tab history ----
  "Registro de Trocas": "Trade Register",
  "Entrou:": "Entered:",
  "Recebeu:": "Received:",
  "Excluir troca e estornar estoque": "Exclude trade and reverse stock",
  "Troca excluída e estoque estornado.": "Trade excluded and stock reversed.",
  "Não foi possível excluir a troca.": "Could not exclude the trade.",

  // ---- Leilão tab ----
  "• O leilão conta o tempo escolhido (1h a 48h).": "• The auction counts the chosen time (1h to 48h).",
  "• Qualquer pessoa pode dar lance durante o tempo.": "• Anyone can bid during the time.",
  "• Após o tempo acabar, cada novo lance adiciona": "• After time runs out, each new bid adds",
  "• Quando o tempo de disputa acaba, o leilão vai para": "• When dispute time runs out, the auction goes to",
  "• O admin finaliza após entregar o item e receber o pagamento.": "• Admin finalizes after delivering the item and receiving payment.",
  "Ex: Água Tóxica": "Ex: Toxic Water",
  "Valor Inicial (total do lote)": "Initial Value (total lot)",
  "Origem / Taxa": "Origin / Fee",
  "Imagem (preenche sozinho pelo nome do item)": "Image (auto-filled by item name)",
  "O tempo de disputa acabou.": "Dispute time has ended.",
  "Disputa final!": "Final dispute!",
  "Dono:": "Owner:",
  "Vencedor": "Winner",
  "Preencha nome e valor.": "Fill name and value.",

  // ---- Lotérica tab ----
  "Configurar Lotérica": "Configure Lottery",
  "Criar Lotérica": "Create Lottery",
  "Valor/Numero": "Value/Number",
  "Prêmio Mínimo": "Minimum Prize",
  "Premio Minimo": "Minimum Prize",
  "Duração Vendas (min)": "Sales Duration (min)",
  "1000 números": "1000 numbers",
  "1000 numeros": "1000 numbers",
  "preço fixo por número.": "fixed price per number.",
  "das vendas vai pro banco": "of sales goes to the bank",
  "vai pro prêmio": "goes to the prize",
  "Se ninguém acertar, o prêmio": "If nobody gets it right, the prize",
  "Só reseta quando sair um": "Only resets when a",
  "- Ganhador:": "- Winner:",
  "- Prêmio:": "- Prize:",
  "- Não foi vendido -": "- Not sold -",
  "Acumulou": "Accumulated",
};

/* ============================================================
   LANGUAGE-SPECIFIC OVERRIDES
   ============================================================ */
const ES: Record<string, string> = {
  "Dashboard": "Panel", "Tabela": "Tabla de precios", "Empréstimos": "Préstamos",
  "Trocas": "Intercambios", "Doadores": "Donantes", "Leilões": "Subastas",
  "Sorteios": "Sorteos", "Lotérica": "Lotería", "Investidores": "Inversores",
  "Config Trocas": "Config. Intercambios", "Compras & Vendas": "Compras y Ventas",
  "Estoque & Caixa": "Stock y Caja", "Buscar item...": "Buscar artículo...",
  "Carregando dados do banco...": "Cargando datos del banco...",
  "Cancelar": "Cancelar", "Entrar": "Entrar", "Salvar": "Guardar",
  "Fechar": "Cerrar", "Criar": "Crear", "Remover": "Eliminar",
  "Registrar": "Registrar", "Buscar...": "Buscar...",
  "Nome": "Nombre", "Quantidade": "Cantidad", "Tipo": "Tipo",
  "Data": "Fecha", "Descrição": "Descripción", "Origem": "Origen",
  "Todos": "Todos", "Admin": "Admin", "Modo visual": "Modo visual",
  "total": "total", "registros": "registros",
  "Dono": "Dueño", "Ganhador": "Ganador", "Vencedor": "Ganador",
  "Participantes": "Participantes", "Qtd": "Cant", "Inicial": "Inicial",
  "Maior": "Mayor", "Lances": "Pujas", "Taxa": "Comisión",
  "Lucro": "Ganancia", "Bruto:": "Bruto:",
  "Empréstimos Pendentes": "Préstamos Pendientes",
  "Empréstimos Pagos": "Préstamos Pagados",
  "Investidores Ativos": "Inversores Activos",
  "Trocas Realizadas": "Intercambios Realizados",
  "Registros no Caixa": "Registros en Caja",
  "Leilões Ativos": "Subastas Activas",
  "Sorteios Ativos": "Sorteos Activos",
  "Top 10 Doadores": "Top 10 Donantes",
  "Top 10 Investidores": "Top 10 Inversores",
  "Top 10 Contribuintes": "Top 10 Contribuyentes",
  "Estoque do Banco": "Stock del Banco",
  "Movimentos do Caixa": "Movimientos de Caja",
  "Eventos Ativos": "Eventos Activos",
  "Nenhum doador cadastrado.": "Ningún donante registrado.",
  "Nenhum investidor cadastrado.": "Ningún inversor registrado.",
  "Estoque vazio.": "Stock vacío.",
  "Nenhum registro ainda.": "Ningún registro aún.",
  "desde": "desde",
  "contribuicoes": "contribuciones",
  "Canais": "Canales", "Salas Privadas": "Salas Privadas",
  "Geral": "General", "Atendimento": "Soporte", "Guias": "Guías",
  "Clãs": "Clanes", "Comércio": "Comercio",
  "Nenhuma mensagem ainda. Seja o primeiro a conversar!": "¡Aún no hay mensajes. ¡Sé el primero en chatear!",
  "Nenhuma sala criada.": "Ninguna sala creada.",
  "Hoje": "Hoy", "Ontem": "Ayer", "Membro": "Miembro",
  "Regras:": "Reglas:", "por": "por",
  "❤️ Doadores": "❤️ Donantes",
  "Ranking": "Ranking", "Reordenar": "Reordenar",
  "Nova Doação": "Nueva Donación", "Registrar Doação": "Registrar Donación",
  "Histórico": "Historial",
  "Nenhuma doação.": "Ninguna donación.",
  "💎 Membros Investidores": "💎 Miembros Inversores",
  "Benefício:": "Beneficio:",
  "Como obter a tag?": "¿Cómo obtener la etiqueta?",
  "Adicionar Investidor": "Añadir Inversor",
  "Adicionar": "Añadir",
  "Ativos": "Activos",
  "Nenhum investidor.": "Ningún inversor.",
  "Registro de Trocas": "Registro de Intercambios",
  "Nova Troca": "Nuevo Intercambio",
  "Registrar Troca": "Registrar Intercambio",
  "Calculadora": "Calculadora",
  "Como Funciona": "Cómo Funciona",
  "🛒 Compras e Vendas": "🛒 Compras y Ventas",
  "Compras": "Compras", "Vendas": "Ventas",
  "Entra": "Entra", "Sai": "Sale", "Paga": "Paga", "Recebe": "Recibe",
  "Nenhuma compra ou venda.": "Ninguna compra o venta.",
  "💰 Caixa do Banco": "💰 Caja del Banco",
  "Registro Manual": "Registro Manual",
  "ENTRADA": "INGRESO", "SAÍDA": "GASTO",
  "Entrada": "Ingreso", "Saída": "Gasto",
  "Estoque Atual": "Stock Actual",
  "BAIXO": "BAJO",
  "Resetar": "Resetear", "Resetar TUDO?": "¿Resetear TODO?",
  "🔨 Leilões": "🔨 Subastas",
  "Novo Leilão": "Nueva Subasta", "Criar Leilão": "Crear Subasta",
  "Duração": "Duración", "Fila de Espera": "Fila de Espera",
  "EM ESPERA": "EN ESPERA",
  "Nenhum leilão ativo.": "Ninguna subasta activa.",
  "Dar Lance": "Ofertar",
  "Finalizar Entrega": "Finalizar Entrega",
  "Histórico de Ganhadores": "Historial de Ganadores",
  "Sorteios": "Sorteos",
  "Novo Sorteio": "Nuevo Sorteo",
  "Nenhum.": "Ninguno.",
  "Participar": "Participar", "Sortear": "Sortear",
  "Encerrado": "Cerrado", "ENCERRADO": "CERRADO",
  "Lotérica Ativa": "Lotería Activa",
  "Vendas abertas": "Ventas abiertas",
  "Sorteio realizado": "Sorteo realizado",
  "Finalizada": "Finalizada",
  "Vendidos": "Vendidos", "Disponiveis": "Disponibles",
  "Arrecadado Total": "Total Recaudado",
  "Premio": "Premio", "Teve Ganhador!": "¡Hay Ganador!",
  "Ninguem acertou - Premio acumulou!": "Nadie acertó - ¡Premio acumulado!",
  "Finalizar Lotérica": "Finalizar Lotería",
  "Vender Numero": "Vender Número",
  "Nome do Comprador": "Nombre del Comprador",
  "Vender": "Vender",
  "Realizar Sorteio": "Realizar Sorteo",
  "Empréstimos": "Préstamos",
  "Regras do Banco": "Reglas del Banco",
  "Membro Especial": "Miembro Especial",
  "Membro Comum": "Miembro Común",
  "Não Contribuinte": "No Contribuyente",
  "Calculadora de Empréstimo": "Calculadora de Préstamo",
  "Dias de Atraso": "Días de Atraso",
  "Total a Devolver": "Total a Devolver",
  "itens": "ítems",
  "Novo Empréstimo": "Nuevo Préstamo",
  "Pendentes": "Pendientes", "Pagos": "Pagados",
  "Nenhum empréstimo pendente.": "Ningún préstamo pendiente.",
  "Pendente": "Pendiente", "Pago": "Pagado", "Atrasado": "Atrasado",
  "Pagar": "Pagar", "Confirmar Pagamento": "Confirmar Pago",
  "Alta": "Alta", "Media": "Media", "Baixa": "Baja",
  "Comum": "Común", "Incomum": "Poco común", "Raro": "Raro", "Lendario": "Legendario",
  "Login Admin": "Login Admin",
  "Verificando...": "Verificando...",
  "Backup": "Backup", "Gerando...": "Generando...",
  "Senha incorreta!": "¡Contraseña incorrecta!",
  "Continuar em Português": "Continuar en Portugués",
  "Traduzir o Site": "Traducir el Sitio",
  "Selecione seu idioma": "Seleccione su idioma",
  "Traduzir para": "Traducir a",
  "Nova Lotérica": "Nueva Lotería",
  "Configurar Lotérica": "Configurar Lotería",
  "Criar Lotérica": "Crear Lotería",
  "Historico de Sorteios": "Historial de Sorteos",
  "Observação": "Observación",
  "Opcional": "Opcional",
  "Disponível": "Disponible",
  "Disponivel": "Disponible",
};

const FR: Record<string, string> = {
  "Dashboard": "Tableau de bord", "Tabela": "Table des prix", "Empréstimos": "Prêts",
  "Trocas": "Échanges", "Doadores": "Donateurs", "Leilões": "Enchères",
  "Sorteios": "Tirages", "Lotérica": "Loterie", "Investidores": "Investisseurs",
  "Config Trocas": "Config. Échanges", "Compras & Vendas": "Achats & Ventes",
  "Estoque & Caixa": "Stock & Caisse",
  "Buscar item...": "Rechercher un objet...", "Cancelar": "Annuler",
  "Entrar": "Entrer", "Salvar": "Enregistrer", "Fechar": "Fermer",
  "Criar": "Créer", "Remover": "Supprimer", "Registrar": "Enregistrer",
  "Buscar...": "Rechercher...", "Nome": "Nom", "Quantidade": "Quantité",
  "Data": "Date", "Descrição": "Description", "Origem": "Origine",
  "Todos": "Tous", "Admin": "Admin", "Modo visual": "Mode visual",
  "total": "total", "Dono": "Propriétaire", "Ganhador": "Gagnant",
  "Vencedor": "Gagnant", "Participantes": "Participants",
  "Qtd": "Qté", "Inicial": "Initial", "Maior": "Plus haut",
  "Lances": "Enchères", "Taxa": "Commission", "Lucro": "Profit",
  "Bruto:": "Brut:",
  "Top 10 Doadores": "Top 10 Donateurs",
  "Top 10 Investidores": "Top 10 Investisseurs",
  "Top 10 Contribuintes": "Top 10 Contributeurs",
  "Estoque do Banco": "Stock de la Banque",
  "Movimentos do Caixa": "Mouvements de Caisse",
  "Estoque vazio.": "Stock vide.",
  "Nenhum registro ainda.": "Aucun enregistrement.",
  "Geral": "Général", "Atendimento": "Support", "Guias": "Guides",
  "Clãs": "Clans", "Comércio": "Commerce",
  "Hoje": "Aujourd'hui", "Ontem": "Hier",
  "Regras:": "Règles:", "por": "par",
  "Ranking": "Classement", "Histórico": "Historique",
  "Como Funciona": "Comment ça marche",
  "Nenhum leilão ativo.": "Aucune enchère active.",
  "Dar Lance": "Enchérir", "Finalizar Entrega": "Finaliser la Livraison",
  "Histórico de Ganhadores": "Historique des Gagnants",
  "Participar": "Participer", "Sortear": "Tirer",
  "Encerrado": "Terminé", "ENCERRADO": "TERMINÉ",
  "Vendidos": "Vendus", "Disponiveis": "Disponibles",
  "Arrecadado Total": "Total Collecté",
  "Premio": "Prix", "Teve Ganhador!": "Nous avons un Gagnant !",
  "Nenhum empréstimo pendente.": "Aucun prêt en attente.",
  "Pendente": "En attente", "Pago": "Payé", "Atrasado": "En retard",
  "Pagar": "Payer", "Confirmar Pagamento": "Confirmer le Paiement",
  "Alta": "Haute", "Media": "Moyenne", "Baixa": "Basse",
  "Comum": "Commun", "Incomum": "Peu commun", "Raro": "Rare",
  "Lendario": "Légendaire",
  "Login Admin": "Connexion Admin",
  "Verificando...": "Vérification...", "Backup": "Sauvegarde",
  "Senha incorreta!": "Mot de passe incorrect !",
  "Continuar em Português": "Continuer en Portugais",
  "Traduzir o Site": "Traduire le Site",
  "Selecione seu idioma": "Sélectionnez votre langue",
  "Traduzir para": "Traduire en",
  "Observação": "Remarque",
  "Disponível": "Disponible",
  "Disponivel": "Disponible",
};

const DE: Record<string, string> = {
  "Dashboard": "Übersicht", "Tabela": "Preistabelle", "Empréstimos": "Kredite",
  "Trocas": "Tausch", "Doadores": "Spender", "Leilões": "Auktionen",
  "Sorteios": "Verlosungen", "Lotérica": "Lotterie", "Investidores": "Investoren",
  "Config Trocas": "Tausch-Einstellungen",
  "Compras & Vendas": "Käufe & Verkäufe",
  "Estoque & Caixa": "Bestand & Kasse",
  "Buscar item...": "Gegenstand suchen...", "Cancelar": "Abbrechen",
  "Entrar": "Anmelden", "Salvar": "Speichern", "Fechar": "Schließen",
  "Criar": "Erstellen", "Remover": "Entfernen", "Registrar": "Registrieren",
  "Buscar...": "Suchen...", "Nome": "Name", "Quantidade": "Menge",
  "Data": "Datum", "Descrição": "Beschreibung", "Origem": "Quelle",
  "Todos": "Alle", "Admin": "Admin", "Modo visual": "Ansichtsmodus",
  "total": "gesamt", "Dono": "Besitzer", "Ganhador": "Gewinner",
  "Vencedor": "Gewinner", "Participantes": "Teilnehmer",
  "Qtd": "Menge", "Inicial": "Start", "Maior": "Höchstes",
  "Lances": "Gebote", "Taxa": "Gebühr", "Lucro": "Gewinn",
  "Bruto:": "Brutto:",
  "Top 10 Doadores": "Top 10 Spender",
  "Top 10 Investidores": "Top 10 Investoren",
  "Top 10 Contribuintes": "Top 10 Beitragende",
  "Estoque do Banco": "Bankbestand",
  "Movimentos do Caixa": "Kassenbewegungen",
  "Estoque vazio.": "Bestand leer.",
  "Nenhum registro ainda.": "Noch keine Einträge.",
  "Geral": "Allgemein", "Atendimento": "Support", "Guias": "Anleitungen",
  "Clãs": "Clans", "Comércio": "Handel",
  "Hoje": "Heute", "Ontem": "Gestern",
  "Regras:": "Regeln:", "por": "von",
  "Ranking": "Rangliste", "Histórico": "Verlauf",
  "Como Funciona": "So funktioniert's",
  "Nenhum leilão ativo.": "Keine aktiven Auktionen.",
  "Dar Lance": "Bieten", "Finalizar Entrega": "Lieferung abschließen",
  "Histórico de Ganhadores": "Gewinnerhistorie",
  "Participar": "Teilnehmen", "Sortear": "Ziehen",
  "Encerrado": "Beendet", "ENCERRADO": "BEENDET",
  "Vendidos": "Verkauft", "Disponiveis": "Verfügbar",
  "Arrecadado Total": "Gesamt eingenommen",
  "Premio": "Preis", "Teve Ganhador!": "Wir haben einen Gewinner!",
  "Nenhum empréstimo pendente.": "Keine ausstehenden Kredite.",
  "Pendente": "Ausstehend", "Pago": "Bezahlt", "Atrasado": "Überfällig",
  "Pagar": "Bezahlen", "Confirmar Pagamento": "Zahlung bestätigen",
  "Alta": "Hoch", "Media": "Mittel", "Baixa": "Niedrig",
  "Comum": "Gewöhnlich", "Incomum": "Ungewöhnlich", "Raro": "Selten",
  "Lendario": "Legendär",
  "Login Admin": "Admin-Anmeldung",
  "Verificando...": "Überprüfung...", "Backup": "Sicherung",
  "Senha incorreta!": "Falsches Passwort!",
  "Continuar em Português": "Auf Portugiesisch fortfahren",
  "Traduzir o Site": "Seite übersetzen",
  "Selecione seu idioma": "Wählen Sie Ihre Sprache",
  "Traduzir para": "Übersetzen nach",
  "Observação": "Bemerkung",
  "Disponível": "Verfügbar",
  "Disponivel": "Verfügbar",
};

const RU: Record<string, string> = {
  "Dashboard": "Панель", "Tabela": "Таблица цен", "Empréstimos": "Займы",
  "Trocas": "Обмены", "Doadores": "Дарители", "Leilões": "Аукционы",
  "Sorteios": "Розыгрыши", "Lotérica": "Лотерея", "Investidores": "Инвесторы",
  "Config Trocas": "Настройки обмена",
  "Compras & Vendas": "Покупки и Продажи",
  "Estoque & Caixa": "Склад и Касса",
  "Buscar item...": "Поиск предмета...", "Cancelar": "Отмена",
  "Entrar": "Войти", "Salvar": "Сохранить", "Fechar": "Закрыть",
  "Criar": "Создать", "Remover": "Удалить", "Registrar": "Зарегистрировать",
  "Buscar...": "Поиск...", "Nome": "Имя", "Quantidade": "Количество",
  "Data": "Дата", "Descrição": "Описание", "Origem": "Источник",
  "Todos": "Все", "Admin": "Админ", "Modo visual": "Режим просмотра",
  "total": "всего", "Dono": "Владелец", "Ganhador": "Победитель",
  "Vencedor": "Победитель", "Participantes": "Участники",
  "Qtd": "Кол-во", "Inicial": "Начальная", "Maior": "Наиб.",
  "Lances": "Ставки", "Taxa": "Комиссия", "Lucro": "Прибыль",
  "Bruto:": "Брутто:",
  "Top 10 Doadores": "Топ-10 Дарителей",
  "Top 10 Investidores": "Топ-10 Инвесторов",
  "Top 10 Contribuintes": "Топ-10 Участников",
  "Estoque do Banco": "Склад Банка",
  "Movimentos do Caixa": "Движения Кассы",
  "Estoque vazio.": "Склад пуст.",
  "Nenhum registro ainda.": "Пока нет записей.",
  "Geral": "Общий", "Atendimento": "Поддержка", "Guias": "Гайды",
  "Clãs": "Кланы", "Comércio": "Торговля",
  "Hoje": "Сегодня", "Ontem": "Вчера",
  "Regras:": "Правила:", "por": "от",
  "Ranking": "Рейтинг", "Histórico": "История",
  "Como Funciona": "Как это работает",
  "Nenhum leilão ativo.": "Нет активных аукционов.",
  "Dar Lance": "Сделать ставку",
  "Finalizar Entrega": "Завершить доставку",
  "Histórico de Ganhadores": "История Победителей",
  "Participar": "Участвовать", "Sortear": "Розыграть",
  "Encerrado": "Завершено", "ENCERRADO": "ЗАВЕРШЕНО",
  "Vendidos": "Продано", "Disponiveis": "Доступно",
  "Arrecadado Total": "Всего собрано",
  "Premio": "Приз", "Teve Ganhador!": "Есть Победитель!",
  "Nenhum empréstimo pendente.": "Нет невыданных займов.",
  "Pendente": "Ожидает", "Pago": "Выплачен", "Atrasado": "Просрочен",
  "Pagar": "Оплатить", "Confirmar Pagamento": "Подтвердить оплату",
  "Alta": "Высокий", "Media": "Средний", "Baixa": "Низкий",
  "Comum": "Обычный", "Incomum": "Необычный", "Raro": "Редкий",
  "Lendario": "Легендарный",
  "Login Admin": "Вход Админа",
  "Verificando...": "Проверка...", "Backup": "Бэкап",
  "Senha incorreta!": "Неверный пароль!",
  "Continuar em Português": "Продолжить на португальском",
  "Traduzir o Site": "Перевести сайт",
  "Selecione seu idioma": "Выберите язык",
  "Traduzir para": "Перевести на",
  "Observação": "Примечание",
  "Disponível": "Доступно",
  "Disponivel": "Доступно",
};

const dictionaries: Record<string, Record<string, string>> = { en: EN, es: ES, fr: FR, de: DE, ru: RU };

/* ============================================================
   TRANSLATION ENGINE
   ============================================================ */
const originalText = new WeakMap<Text, string>();
let observer: MutationObserver | null = null;
let currentLang = "pt";
let apiDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const apiCache = new Map<string, string>();
let isTranslating = false;

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
    let n: Node | null;
    while ((n = walker.nextNode())) nodes.push(n as Text);

    const untranslated: string[] = [];

    for (const textNode of nodes) {
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
