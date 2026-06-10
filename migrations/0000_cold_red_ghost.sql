CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`key` varchar(255) NOT NULL,
	`permissions` json NOT NULL,
	`created_by` int NOT NULL,
	`last_used` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`is_active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `api_keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `api_keys_key_unique` UNIQUE(`key`)
);
--> statement-breakpoint
CREATE TABLE `balances` (
	`user_id` int NOT NULL,
	`usd` int NOT NULL DEFAULT 0,
	`sar` int NOT NULL DEFAULT 0,
	`points` int NOT NULL DEFAULT 0,
	CONSTRAINT `balances_user_id` PRIMARY KEY(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question` text NOT NULL,
	`answer` text NOT NULL,
	`category` varchar(255) NOT NULL,
	`order` int NOT NULL,
	CONSTRAINT `faqs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `news` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`author` varchar(255) NOT NULL,
	`image_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `news_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `oauth_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`provider` enum('discord','google') NOT NULL,
	`provider_id` varchar(255) NOT NULL,
	`email` varchar(255),
	`username` varchar(255),
	`avatar_url` text,
	`access_token` text,
	`refresh_token` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `oauth_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pending_orders` (
	`order_id` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	`amount` varchar(255) NOT NULL,
	`currency` varchar(255) NOT NULL,
	`status` enum('pending','completed','cancelled') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `pending_orders_order_id` PRIMARY KEY(`order_id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`price` int NOT NULL,
	`image_url` text,
	`category` varchar(255) NOT NULL,
	`in_stock` boolean NOT NULL DEFAULT true,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` varchar(255) NOT NULL,
	CONSTRAINT `rules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`server_name` varchar(255) NOT NULL DEFAULT 'RIXEL ROLEPLAY',
	`server_name_ar` varchar(255) NOT NULL DEFAULT 'ريكسل للحياة الواقعية',
	`server_ip` varchar(255) NOT NULL DEFAULT '109.176.229.142:22003',
	`discord_link` varchar(255) NOT NULL DEFAULT '',
	`forum_link` varchar(255) NOT NULL DEFAULT '',
	`hero_title` varchar(255) NOT NULL DEFAULT 'RIXEL ROLEPLAY',
	`hero_subtitle` varchar(1000) NOT NULL DEFAULT 'انضم إلى سيرفرنا واستمتع بأفضل تجربة لعب حياة واقعية',
	`footer_text` varchar(1000) NOT NULL DEFAULT 'أفضل تجربة لعب حياة واقعية في MTA',
	CONSTRAINT `settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `staff` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(255) NOT NULL,
	`role` varchar(255) NOT NULL,
	`avatar_url` text,
	`order` int NOT NULL,
	CONSTRAINT `staff_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ticket_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticket_id` int NOT NULL,
	`user_id` int NOT NULL,
	`is_admin` boolean NOT NULL DEFAULT false,
	`message` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ticket_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tickets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`username` varchar(255) NOT NULL,
	`department` enum('technical','billing','general','report') NOT NULL,
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`status` enum('open','in_progress','closed') NOT NULL DEFAULT 'open',
	`admin_response` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `tickets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`type` enum('deposit','withdrawal','purchase','refund','bonus','transfer') NOT NULL,
	`amount` int NOT NULL,
	`currency` enum('usd','sar','points') NOT NULL,
	`description` text NOT NULL,
	`reference` varchar(255),
	`status` enum('pending','completed','failed','cancelled') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`username` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` text NOT NULL,
	`role` enum('owner','admin','moderator','user') NOT NULL DEFAULT 'user',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
