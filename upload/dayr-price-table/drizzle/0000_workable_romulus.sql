CREATE TABLE `item_prices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itemId` varchar(64) NOT NULL,
	`itemName` varchar(255) NOT NULL,
	`steelPrice` int NOT NULL,
	`cementPrice` int NOT NULL,
	`rarity` enum('common','uncommon','rare') NOT NULL DEFAULT 'common',
	`demand` enum('low','medium','high','very_high') NOT NULL DEFAULT 'medium',
	`notes` text,
	`category` varchar(64) NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `item_prices_id` PRIMARY KEY(`id`),
	CONSTRAINT `item_prices_itemId_unique` UNIQUE(`itemId`)
);
--> statement-breakpoint
CREATE TABLE `price_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`itemId` varchar(64) NOT NULL,
	`playerNickname` varchar(64) NOT NULL,
	`steelPrice` int NOT NULL,
	`cementPrice` int NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `price_reports_id` PRIMARY KEY(`id`)
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
