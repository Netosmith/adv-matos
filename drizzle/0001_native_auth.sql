CREATE TABLE `workspaces` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`data_owner` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`workspace_id` text NOT NULL,
	`username` text NOT NULL,
	`display_name` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`password_hash` text NOT NULL,
	`password_salt` text NOT NULL,
	`password_iterations` integer DEFAULT 150000 NOT NULL,
	`role` text DEFAULT 'USUARIO' NOT NULL,
	`active` integer DEFAULT 1 NOT NULL,
	`failed_attempts` integer DEFAULT 0 NOT NULL,
	`locked_until` text,
	`must_change_password` integer DEFAULT 0 NOT NULL,
	`created` text NOT NULL,
	`updated` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);
--> statement-breakpoint
CREATE INDEX `users_workspace` ON `users` (`workspace_id`);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `sessions_user` ON `sessions` (`user_id`);
--> statement-breakpoint
CREATE INDEX `sessions_expires` ON `sessions` (`expires`);
--> statement-breakpoint
INSERT INTO `workspaces` (`id`,`name`,`data_owner`) VALUES (
	'matos-office',
	'Matos Advocacia',
	COALESCE((SELECT `owner` FROM `settings` LIMIT 1),(SELECT `owner` FROM `records` LIMIT 1),(SELECT `owner` FROM `files` LIMIT 1),(SELECT `owner` FROM `activity` LIMIT 1),'matos-office')
);
--> statement-breakpoint
INSERT INTO `users` (`id`,`workspace_id`,`username`,`display_name`,`email`,`password_hash`,`password_salt`,`password_iterations`,`role`,`active`,`failed_attempts`,`locked_until`,`must_change_password`,`created`,`updated`) VALUES (
	'usr_matos_admin',
	'matos-office',
	'admin',
	'Administrador',
	'',
	'/HPTQONGOQQe/+sRvLpxxMkUKWHDqxdDLyHX8BG0yt8=',
	'YRwwwynU8equZ+NlM8WCjA==',
	150000,
	'ADMINISTRADOR',
	1,
	0,
	NULL,
	1,
	CURRENT_TIMESTAMP,
	CURRENT_TIMESTAMP
);
