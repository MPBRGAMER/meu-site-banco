CREATE TABLE `caixa` (
	`id` varchar(36) NOT NULL,
	`tipo` enum('entrada','saida') NOT NULL,
	`descricao` text NOT NULL,
	`item` varchar(255) NOT NULL,
	`quantidade` int NOT NULL,
	`valor` double,
	`data` timestamp NOT NULL DEFAULT (now()),
	`origem` varchar(255) NOT NULL,
	CONSTRAINT `caixa_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `comprasVendas` (
	`id` varchar(36) NOT NULL,
	`tipo` enum('compra','venda') NOT NULL,
	`player` varchar(255) NOT NULL,
	`item` varchar(255) NOT NULL,
	`quantidade` int NOT NULL,
	`itemPagamento` varchar(255),
	`valor` double NOT NULL,
	`data` timestamp NOT NULL DEFAULT (now()),
	`observacao` text,
	CONSTRAINT `comprasVendas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `doadores` (
	`id` varchar(36) NOT NULL,
	`nome` varchar(255) NOT NULL,
	`item` varchar(255) NOT NULL,
	`quantidade` int NOT NULL,
	`data` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `doadores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `emprestimos` (
	`id` varchar(36) NOT NULL,
	`player` varchar(255) NOT NULL,
	`item` varchar(255) NOT NULL,
	`quantidade` int NOT NULL,
	`dataEmprestimo` timestamp NOT NULL,
	`tipoMembro` enum('comum','investidor') NOT NULL,
	`status` enum('pendente','pago') NOT NULL DEFAULT 'pendente',
	`dataPagamento` timestamp,
	`itemPagamento` varchar(255),
	`quantidadePaga` int,
	CONSTRAINT `emprestimos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `investidores` (
	`id` varchar(36) NOT NULL,
	`nome` varchar(255) NOT NULL,
	`dataEntrada` timestamp NOT NULL DEFAULT (now()),
	`status` enum('ativo','inativo') NOT NULL DEFAULT 'ativo',
	`observacao` text,
	CONSTRAINT `investidores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tabelasTroca` (
	`id` varchar(36) NOT NULL,
	`itemBase` varchar(255) NOT NULL,
	`quantidadeBase` int NOT NULL,
	`itemResultado` varchar(255) NOT NULL,
	`quantidadeResultado` int NOT NULL,
	`categoria` varchar(100),
	CONSTRAINT `tabelasTroca_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `trocasRegistro` (
	`id` varchar(36) NOT NULL,
	`player` varchar(255) NOT NULL,
	`itemEnviado` varchar(255) NOT NULL,
	`quantidadeEnviada` int NOT NULL,
	`itemRecebido` varchar(255) NOT NULL,
	`quantidadeRecebida` int NOT NULL,
	`tipoMembro` enum('comum','investidor') NOT NULL,
	`taxaAplicada` int NOT NULL,
	`lucroBanco` int NOT NULL,
	`data` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `trocasRegistro_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
