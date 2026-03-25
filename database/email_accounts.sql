-- Email Accounts Table
CREATE TABLE IF NOT EXISTS `email_accounts` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `organization_id` bigint unsigned DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `imap_host` varchar(255) NOT NULL,
  `imap_port` int DEFAULT 993,
  `imap_encryption` varchar(10) DEFAULT 'ssl',
  `username` varchar(255) NOT NULL,
  `password` text NOT NULL,
  `smtp_host` varchar(255) DEFAULT NULL,
  `smtp_port` int DEFAULT 587,
  `smtp_encryption` varchar(10) DEFAULT 'tls',
  `is_active` tinyint(1) DEFAULT 1,
  `is_default` tinyint(1) DEFAULT 0,
  `auto_create_sqr` tinyint(1) DEFAULT 1,
  `last_sync_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `email_accounts_organization_id_index` (`organization_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add columns to sqrs table for email tracking
ALTER TABLE `sqrs` ADD COLUMN `email_message_id` varchar(255) NULL AFTER `resolution_notes`;
ALTER TABLE `sqrs` ADD COLUMN `from_email` varchar(255) NULL AFTER `email_message_id`;
ALTER TABLE `sqrs` ADD INDEX `sqrs_email_message_id_index` (`email_message_id`);
ALTER TABLE `sqrs` ADD INDEX `sqrs_from_email_index` (`from_email`);