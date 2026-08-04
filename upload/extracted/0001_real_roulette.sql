CREATE TABLE `lances` (
	`id` varchar(36) NOT NULL,
	`leilaoId` varchar(36) NOT NULL,
	`jogador` varchar(255) NOT NULL,
	`valor` double NOT NULL,
	`data` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lances_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `leiloes` (
	`id` varchar(36) NOT NULL,
	`donoItem` varchar(255) NOT NULL,
	`nomeItem` varchar(255) NOT NULL,
	`imagemUrl` text,
	`valorInicial` double NOT NULL,
	`moedaAceita` varchar(255) NOT NULL,
	`status` enum('ativo','finalizado') NOT NULL DEFAULT 'ativo',
	`dataCriacao` timestamp NOT NULL DEFAULT (now()),
	`dataExpiracao` timestamp NOT NULL,
	`dataUltimoLance` timestamp,
	`vencedor` varchar(255),
	`valorVencedor` double,
	CONSTRAINT `leiloes_id` PRIMARY KEY(`id`)
);
