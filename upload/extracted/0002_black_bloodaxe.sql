CREATE TABLE `loterica` (
	`id` varchar(36) NOT NULL,
	`status` enum('configurando','vendas_abertas','sorteio_realizado') NOT NULL DEFAULT 'configurando',
	`valorNumero` double NOT NULL,
	`moedaAceita` varchar(255) NOT NULL,
	`premioMinimo` double DEFAULT 0,
	`duracaoMinutos` int DEFAULT 60,
	`dataCriacao` timestamp NOT NULL DEFAULT (now()),
	`dataFimVendas` timestamp,
	`dataSorteio` timestamp,
	`numeroSorteado` int,
	`ganhador` varchar(255),
	`valorPremio` double DEFAULT 0,
	`arrecadadoTotal` double DEFAULT 0,
	CONSTRAINT `loterica_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `numerosLoterica` (
	`id` varchar(36) NOT NULL,
	`lotericaId` varchar(36) NOT NULL,
	`numero` int NOT NULL,
	`comprador` varchar(255),
	`dataCompra` timestamp,
	CONSTRAINT `numerosLoterica_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `participantesSorteio` (
	`id` varchar(36) NOT NULL,
	`sorteioId` varchar(36) NOT NULL,
	`jogador` varchar(255) NOT NULL,
	`data` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `participantesSorteio_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sorteios` (
	`id` varchar(36) NOT NULL,
	`nomeItem` varchar(255) NOT NULL,
	`quantidade` int NOT NULL,
	`duracaoMinutos` int NOT NULL,
	`status` enum('ativo','finalizado') NOT NULL DEFAULT 'ativo',
	`dataCriacao` timestamp NOT NULL DEFAULT (now()),
	`dataFim` timestamp,
	`ganhador` varchar(255),
	CONSTRAINT `sorteios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `leiloes` MODIFY COLUMN `status` enum('ativo','espera','finalizado') NOT NULL DEFAULT 'ativo';--> statement-breakpoint
ALTER TABLE `doadores` ADD `ordem` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `investidores` ADD `ordem` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `leiloes` ADD `taxaCasa` int DEFAULT 15;--> statement-breakpoint
ALTER TABLE `leiloes` ADD `tipoMembroVencedor` varchar(20);