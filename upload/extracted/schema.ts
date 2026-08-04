import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, double } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// Empréstimos
export const emprestimos = mysqlTable("emprestimos", {
  id: varchar("id", { length: 36 }).primaryKey(),
  player: varchar("player", { length: 255 }).notNull(),
  item: varchar("item", { length: 255 }).notNull(),
  quantidade: int("quantidade").notNull(),
  dataEmprestimo: timestamp("dataEmprestimo").notNull(),
  tipoMembro: mysqlEnum("tipoMembro", ["comum", "investidor"]).notNull(),
  status: mysqlEnum("status", ["pendente", "pago"]).default("pendente").notNull(),
  dataPagamento: timestamp("dataPagamento"),
  itemPagamento: varchar("itemPagamento", { length: 255 }),
  quantidadePaga: int("quantidadePaga"),
});

// Investidores
export const investidores = mysqlTable("investidores", {
  id: varchar("id", { length: 36 }).primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  dataEntrada: timestamp("dataEntrada").defaultNow().notNull(),
  status: mysqlEnum("status", ["ativo", "inativo"]).default("ativo").notNull(),
  observacao: text("observacao"),
  ordem: int("ordem").default(0),
});

// Tabelas de Troca (Configuração)
export const tabelasTroca = mysqlTable("tabelasTroca", {
  id: varchar("id", { length: 36 }).primaryKey(),
  itemBase: varchar("itemBase", { length: 255 }).notNull(),
  quantidadeBase: int("quantidadeBase").notNull(),
  itemResultado: varchar("itemResultado", { length: 255 }).notNull(),
  quantidadeResultado: int("quantidadeResultado").notNull(),
  categoria: varchar("categoria", { length: 100 }),
});

// Registro de Trocas Realizadas
export const trocasRegistro = mysqlTable("trocasRegistro", {
  id: varchar("id", { length: 36 }).primaryKey(),
  player: varchar("player", { length: 255 }).notNull(),
  itemEnviado: varchar("itemEnviado", { length: 255 }).notNull(),
  quantidadeEnviada: int("quantidadeEnviada").notNull(),
  itemRecebido: varchar("itemRecebido", { length: 255 }).notNull(),
  quantidadeRecebida: int("quantidadeRecebida").notNull(),
  tipoMembro: mysqlEnum("tipoMembro", ["comum", "investidor"]).notNull(),
  taxaAplicada: int("taxaAplicada").notNull(),
  lucroBanco: int("lucroBanco").notNull(),
  data: timestamp("data").defaultNow().notNull(),
});

// Compras e Vendas
export const comprasVendas = mysqlTable("comprasVendas", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tipo: mysqlEnum("tipo", ["compra", "venda"]).notNull(),
  player: varchar("player", { length: 255 }).notNull(),
  item: varchar("item", { length: 255 }).notNull(),
  quantidade: int("quantidade").notNull(),
  itemPagamento: varchar("itemPagamento", { length: 255 }),
  valor: double("valor").notNull(),
  data: timestamp("data").defaultNow().notNull(),
  observacao: text("observacao"),
});

// Caixa do Banco
export const caixa = mysqlTable("caixa", {
  id: varchar("id", { length: 36 }).primaryKey(),
  tipo: mysqlEnum("tipo", ["entrada", "saida"]).notNull(),
  descricao: text("descricao").notNull(),
  item: varchar("item", { length: 255 }).notNull(),
  quantidade: int("quantidade").notNull(),
  valor: double("valor"),
  data: timestamp("data").defaultNow().notNull(),
  origem: varchar("origem", { length: 255 }).notNull(),
});

// Doadores
export const doadores = mysqlTable("doadores", {
  id: varchar("id", { length: 36 }).primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  item: varchar("item", { length: 255 }).notNull(),
  quantidade: int("quantidade").notNull(),
  data: timestamp("data").defaultNow().notNull(),
  ordem: int("ordem").default(0),
});

// Leilões
export const leiloes = mysqlTable("leiloes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  donoItem: varchar("donoItem", { length: 255 }).notNull(),
  nomeItem: varchar("nomeItem", { length: 255 }).notNull(),
  imagemUrl: text("imagemUrl"),
  valorInicial: double("valorInicial").notNull(),
  moedaAceita: varchar("moedaAceita", { length: 255 }).notNull(),
  taxaCasa: int("taxaCasa").default(15),
  status: mysqlEnum("status", ["ativo", "espera", "finalizado"]).default("ativo").notNull(),
  dataCriacao: timestamp("dataCriacao").defaultNow().notNull(),
  dataExpiracao: timestamp("dataExpiracao").notNull(),
  dataUltimoLance: timestamp("dataUltimoLance"),
  vencedor: varchar("vencedor", { length: 255 }),
  valorVencedor: double("valorVencedor"),
  tipoMembroVencedor: varchar("tipoMembroVencedor", { length: 20 }),
  tipoOrigem: mysqlEnum("tipoOrigem", ["comum", "investidor", "banco"]).default("comum").notNull(),
});

// Lances dos Leilões
export const lances = mysqlTable("lances", {
  id: varchar("id", { length: 36 }).primaryKey(),
  leilaoId: varchar("leilaoId", { length: 36 }).notNull(),
  jogador: varchar("jogador", { length: 255 }).notNull(),
  valor: double("valor").notNull(),
  data: timestamp("data").defaultNow().notNull(),
});

// Sorteios
export const sorteios = mysqlTable("sorteios", {
  id: varchar("id", { length: 36 }).primaryKey(),
  nomeItem: varchar("nomeItem", { length: 255 }).notNull(),
  quantidade: int("quantidade").notNull(),
  duracaoMinutos: int("duracaoMinutos").notNull(),
  status: mysqlEnum("status", ["ativo", "finalizado"]).default("ativo").notNull(),
  dataCriacao: timestamp("dataCriacao").defaultNow().notNull(),
  dataFim: timestamp("dataFim"),
  ganhador: varchar("ganhador", { length: 255 }),
});

// Participantes de Sorteio
export const participantesSorteio = mysqlTable("participantesSorteio", {
  id: varchar("id", { length: 36 }).primaryKey(),
  sorteioId: varchar("sorteioId", { length: 36 }).notNull(),
  jogador: varchar("jogador", { length: 255 }).notNull(),
  data: timestamp("data").defaultNow().notNull(),
});

// Lotérica
export const loterica = mysqlTable("loterica", {
  id: varchar("id", { length: 36 }).primaryKey(),
  status: mysqlEnum("status", ["configurando", "vendas_abertas", "sorteio_realizado"]).default("configurando").notNull(),
  valorNumero: double("valorNumero").notNull(),
  moedaAceita: varchar("moedaAceita", { length: 255 }).notNull(),
  premioMinimo: double("premioMinimo").default(0),
  duracaoMinutos: int("duracaoMinutos").default(60),
  dataCriacao: timestamp("dataCriacao").defaultNow().notNull(),
  dataFimVendas: timestamp("dataFimVendas"),
  dataSorteio: timestamp("dataSorteio"),
  numeroSorteado: int("numeroSorteado"),
  ganhador: varchar("ganhador", { length: 255 }),
  valorPremio: double("valorPremio").default(0),
  arrecadadoTotal: double("arrecadadoTotal").default(0),
});

// Números da Lotérica
export const numerosLoterica = mysqlTable("numerosLoterica", {
  id: varchar("id", { length: 36 }).primaryKey(),
  lotericaId: varchar("lotericaId", { length: 36 }).notNull(),
  numero: int("numero").notNull(),
  comprador: varchar("comprador", { length: 255 }),
  dataCompra: timestamp("dataCompra"),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Emprestimo = typeof emprestimos.$inferSelect;
export type Investidor = typeof investidores.$inferSelect;
export type TabelaTroca = typeof tabelasTroca.$inferSelect;
export type TrocaRegistro = typeof trocasRegistro.$inferSelect;
export type CompraVenda = typeof comprasVendas.$inferSelect;
export type CaixaRegistro = typeof caixa.$inferSelect;
export type Doador = typeof doadores.$inferSelect;
export type Leilao = typeof leiloes.$inferSelect;
export type Lance = typeof lances.$inferSelect;
export type Sorteio = typeof sorteios.$inferSelect;
export type ParticipanteSorteio = typeof participantesSorteio.$inferSelect;
export type Loterica = typeof loterica.$inferSelect;
export type NumeroLoterica = typeof numerosLoterica.$inferSelect;
