CREATE TABLE `feedback` (
  `id` int AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `category` enum('bug_report','feature_request','report_is_wrong','missing_my_city','other') NOT NULL,
  `message` text NOT NULL,
  `email` varchar(320),
  `page` varchar(512),
  `createdAt` timestamp NOT NULL DEFAULT (now())
);
