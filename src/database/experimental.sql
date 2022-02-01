/*
SQLyog Ultimate
MySQL - 8.0.27-0ubuntu0.20.04.1 : Database - experimental
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`experimental` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;

USE `experimental`;

/*Table structure for table `ex__auth_access_tokens` */

DROP TABLE IF EXISTS `ex__auth_access_tokens`;

CREATE TABLE `ex__auth_access_tokens` (
  `token_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `refresh_token_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `revoked` int DEFAULT '0',
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`token_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `ex__auth_refresh_tokens` */

DROP TABLE IF EXISTS `ex__auth_refresh_tokens`;

CREATE TABLE `ex__auth_refresh_tokens` (
  `refresh_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `refresh_token` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `revoked` int DEFAULT '0',
  `expires_at` datetime NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`refresh_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `ex__room_files` */

DROP TABLE IF EXISTS `ex__room_files`;

CREATE TABLE `ex__room_files` (
  `file_id` int unsigned NOT NULL AUTO_INCREMENT,
  `file_room_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_message_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_path` text COLLATE utf8mb4_unicode_ci,
  `file_mime_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `file_created_at` timestamp NULL DEFAULT NULL,
  `file_deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`file_id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `ex__room_members` */

DROP TABLE IF EXISTS `ex__room_members`;

CREATE TABLE `ex__room_members` (
  `member_room_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `member_user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `member_role` int NOT NULL,
  `member_created_at` timestamp NULL DEFAULT NULL,
  `member_updated_at` timestamp NULL DEFAULT NULL,
  `member_deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`member_room_id`,`member_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `ex__room_message_recipients` */

DROP TABLE IF EXISTS `ex__room_message_recipients`;

CREATE TABLE `ex__room_message_recipients` (
  `recipient_room_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_message_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `recipient_type` int unsigned DEFAULT '0',
  `recipient_created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `recipient_updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`recipient_room_id`,`recipient_message_id`,`recipient_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `ex__room_messages` */

DROP TABLE IF EXISTS `ex__room_messages`;

CREATE TABLE `ex__room_messages` (
  `message_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message_room_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message_user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `message_reply_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message_content` text COLLATE utf8mb4_unicode_ci,
  `message_type` int DEFAULT '0',
  `message_created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `message_updated_at` timestamp NULL DEFAULT NULL,
  `message_deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`message_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `ex__rooms` */

DROP TABLE IF EXISTS `ex__rooms`;

CREATE TABLE `ex__rooms` (
  `room_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_type` int DEFAULT '3',
  `room_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `room_last_message_id` varchar(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `room_image` text COLLATE utf8mb4_unicode_ci,
  `room_created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `room_updated_at` timestamp NULL DEFAULT NULL,
  `room_deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`room_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `ex__user_bans` */

DROP TABLE IF EXISTS `ex__user_bans`;

CREATE TABLE `ex__user_bans` (
  `ban_id` int unsigned NOT NULL AUTO_INCREMENT,
  `ban_user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ban_admin_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ban_reason` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `ban_type` int DEFAULT '0',
  `ban_started` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ban_status` int DEFAULT '1',
  `ban_length` timestamp NOT NULL,
  PRIMARY KEY (`ban_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Table structure for table `ex__users` */

DROP TABLE IF EXISTS `ex__users`;

CREATE TABLE `ex__users` (
  `user_id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_role` int DEFAULT '0',
  `user_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_status` int DEFAULT '0',
  `user_language_id` int DEFAULT '1',
  `user_username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_image` text COLLATE utf8mb4_unicode_ci,
  `user_created_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6),
  `user_updated_at` timestamp(6) NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `user_deleted_at` timestamp(6) NULL DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `UNIQUE1` (`user_id`),
  UNIQUE KEY `USERNAME` (`user_username`),
  UNIQUE KEY `EMAIL` (`user_email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*!50106 set global event_scheduler = 1*/;

/* Event structure for event `AUTO_LOGOUT` */

/*!50106 DROP EVENT IF EXISTS `AUTO_LOGOUT`*/;

DELIMITER $$

/*!50106 CREATE EVENT `AUTO_LOGOUT` ON SCHEDULE EVERY 3 MINUTE STARTS '2021-11-18 00:18:05' ON COMPLETION NOT PRESERVE ENABLE DO BEGIN
    UPDATE ex__auth_access_tokens SET revoked = 1 WHERE expires_at <= CURRENT_TIMESTAMP; 
    UPDATE ex__auth_refresh_tokens SET revoked = 1 WHERE expires_at <= CURRENT_TIMESTAMP; 
END */$$
DELIMITER ;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
