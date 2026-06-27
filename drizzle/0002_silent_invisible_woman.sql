CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`stripeCustomerId` varchar(64),
	`stripeSubscriptionId` varchar(64),
	`plan` enum('free','premium_monthly','premium_lifetime') NOT NULL DEFAULT 'free',
	`status` enum('active','canceled','past_due','trialing') NOT NULL DEFAULT 'active',
	`currentPeriodEnd` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `leads` ADD `serviceModel` varchar(64);--> statement-breakpoint
ALTER TABLE `leads` ADD `cuisineConcept` varchar(256);--> statement-breakpoint
ALTER TABLE `leads` ADD `priceTier` varchar(8);--> statement-breakpoint
ALTER TABLE `leads` ADD `conceptFitScore` int;--> statement-breakpoint
ALTER TABLE `leads` ADD `conceptRecommendation` varchar(16);