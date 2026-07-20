-- ========================================================
-- Infinity Minds Therapy Center - XAMPP MySQL Database Schema
-- Database: ima_therapy_center
-- ========================================================

CREATE DATABASE IF NOT EXISTS `ima_therapy_center` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ima_therapy_center`;

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `roles` (`id`, `name`) VALUES
(1, 'super_admin'),
(2, 'admin'),
(3, 'principal'),
(4, 'trainer'),
(5, 'parent');

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `branch_id` INT NOT NULL DEFAULT 1,
  `role_id` INT NOT NULL,
  `role` ENUM('super_admin', 'admin', 'principal', 'trainer', 'parent') NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `phone` VARCHAR(30) NOT NULL,
  `status` ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  `username` VARCHAR(50) UNIQUE,
  `password` VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `users` (`id`, `branch_id`, `role_id`, `role`, `name`, `email`, `phone`, `status`, `username`, `password`) VALUES
(1, 1, 1, 'super_admin', 'Super Admin', 'superadmin@infinityminds.lk', '0771234567', 'active', 'superadmin', 'superpassword'),
(2, 1, 2, 'admin', 'Center Admin', 'admin@infinityminds.lk', '0777654321', 'active', 'admin', 'adminpassword'),
(3, 1, 3, 'principal', 'Lead Principal', 'principal@infinityminds.lk', '0711122334', 'active', 'principal', 'principalpassword'),
(4, 1, 4, 'trainer', 'Dinuka Fernando', 'dinuka@infinityminds.lk', '0755566778', 'active', 'trainer', 'trainerpassword'),
(5, 1, 5, 'parent', 'Sunil Wijesinghe', 'parent@infinityminds.lk', '0776789012', 'active', 'parent', 'parentpassword');

-- 3. THERAPY TYPES TABLE
CREATE TABLE IF NOT EXISTS `therapy_types` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `branch_id` INT NOT NULL DEFAULT 1,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `color_tag` VARCHAR(20) NOT NULL DEFAULT '#8B5CF6'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `therapy_types` (`id`, `branch_id`, `name`, `description`, `color_tag`) VALUES
(1, 1, 'Speech Therapy', 'Articulation, voice, and language development.', '#8B5CF6'),
(2, 1, 'Occupational Therapy', 'Fine motor skills, sensory processing, everyday activities.', '#10B981'),
(3, 1, 'ABA Therapy', 'Applied Behavior Analysis for autism and behavior modulation.', '#F59E0B');

-- 4. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `branch_id` INT NOT NULL DEFAULT 1,
  `therapy_type_id` INT NOT NULL,
  `full_name` VARCHAR(100) NOT NULL,
  `dob` DATE NOT NULL,
  `gender` ENUM('male', 'female', 'other') NOT NULL,
  `enrollment_date` DATE NOT NULL,
  `status` ENUM('active', 'inactive', 'graduated') NOT NULL DEFAULT 'active',
  `father_name` VARCHAR(100) DEFAULT '',
  `father_phone` VARCHAR(30) DEFAULT '',
  `mother_name` VARCHAR(100) DEFAULT '',
  `mother_phone` VARCHAR(30) DEFAULT '',
  `emergency_contact_name` VARCHAR(100) DEFAULT '',
  `emergency_contact_phone` VARCHAR(30) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `students` (`id`, `branch_id`, `therapy_type_id`, `full_name`, `dob`, `gender`, `enrollment_date`, `status`, `father_name`, `father_phone`, `mother_name`, `mother_phone`, `emergency_contact_name`, `emergency_contact_phone`) VALUES
(1, 1, 1, 'Ethan Wijesinghe', '2019-04-12', 'male', '2025-01-15', 'active', 'Sunil Wijesinghe', '0776789012', 'Malkanthi Wijesinghe', '0776789013', 'Sunil Wijesinghe', '0776789012'),
(2, 1, 2, 'Kavinya Perera', '2020-08-22', 'female', '2025-02-01', 'active', 'Nimal Perera', '0712345678', 'Kamani Perera', '0712345679', 'Nimal Perera', '0712345678');

-- 5. PARENT CHILD LINKS TABLE
CREATE TABLE IF NOT EXISTS `parent_child_links` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `parent_user_id` INT NOT NULL,
  `child_id` INT NOT NULL,
  `relationship` VARCHAR(50) NOT NULL,
  UNIQUE KEY `parent_child_unique` (`parent_user_id`, `child_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `parent_child_links` (`id`, `parent_user_id`, `child_id`, `relationship`) VALUES
(1, 5, 1, 'Father');

-- 6. SESSIONS TABLE
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `branch_id` INT NOT NULL DEFAULT 1,
  `child_id` INT NOT NULL,
  `trainer_id` INT NOT NULL,
  `therapy_type_id` INT NOT NULL,
  `session_date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `is_recurring` TINYINT(1) DEFAULT 0,
  `recurrence_rule` VARCHAR(50) DEFAULT 'NONE',
  `status` ENUM('scheduled', 'completed', 'cancelled', 'replaced') NOT NULL DEFAULT 'scheduled'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `sessions` (`id`, `branch_id`, `child_id`, `trainer_id`, `therapy_type_id`, `session_date`, `start_time`, `end_time`, `is_recurring`, `recurrence_rule`, `status`) VALUES
(1, 1, 1, 4, 1, '2026-07-09', '09:00:00', '10:00:00', 0, 'NONE', 'completed'),
(2, 1, 2, 4, 2, '2026-07-09', '10:30:00', '11:30:00', 0, 'NONE', 'scheduled'),
(3, 1, 1, 4, 1, '2026-07-10', '09:00:00', '10:00:00', 0, 'NONE', 'scheduled');

-- 7. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS `attendance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `session_id` INT NOT NULL,
  `check_in_time` DATETIME DEFAULT NULL,
  `check_out_time` DATETIME DEFAULT NULL,
  `marked_by_trainer_id` INT NOT NULL,
  `marked_via` VARCHAR(50) DEFAULT 'web_manual',
  `notes` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `attendance` (`id`, `session_id`, `check_in_time`, `check_out_time`, `marked_by_trainer_id`, `marked_via`, `notes`) VALUES
(1, 1, '2026-07-09 08:58:00', '2026-07-09 10:02:00', 4, 'web_manual', 'Ethan arrived on time and engaged well during the speech exercises.');

-- 8. PROGRESS REPORTS TABLE
CREATE TABLE IF NOT EXISTS `progress_reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `child_id` INT NOT NULL,
  `trainer_id` INT NOT NULL,
  `session_id` INT DEFAULT NULL,
  `report_date` DATE NOT NULL,
  `notes` TEXT NOT NULL,
  `visible_to_parent` TINYINT(1) DEFAULT 1,
  `principal_comment` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `progress_reports` (`id`, `child_id`, `trainer_id`, `session_id`, `report_date`, `notes`, `visible_to_parent`, `principal_comment`) VALUES
(1, 1, 4, 1, '2026-07-01', 'Ethan successfully identified 8/10 picture cards today. We practiced sentence structure.', 1, 'Great milestone progress.'),
(2, 1, 1, NULL, '2026-07-10', 'Ethan was very focused during session.', 1, NULL);

-- 9. BEHAVIOR REPORTS TABLE
CREATE TABLE IF NOT EXISTS `behavior_reports` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `child_id` INT NOT NULL,
  `trainer_id` INT NOT NULL,
  `report_date` DATE NOT NULL,
  `nature_of_incident` TEXT NOT NULL,
  `triggers_causes` TEXT,
  `actions_taken` TEXT,
  `follow_up_observations` TEXT,
  `status` ENUM('pending_review', 'authorized', 'rejected') NOT NULL DEFAULT 'pending_review',
  `visibility` ENUM('private', 'public') NOT NULL DEFAULT 'public',
  `principal_comment` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `behavior_reports` (`id`, `child_id`, `trainer_id`, `report_date`, `nature_of_incident`, `triggers_causes`, `actions_taken`, `follow_up_observations`, `status`, `visibility`, `principal_comment`) VALUES
(1, 1, 4, '2026-07-08', 'Mild sensory overload during group audio activity.', 'Loud music transition', 'Provided noise-canceling headphones and guided to quiet corner.', 'Calmed down within 5 minutes.', 'authorized', 'public', 'Approved. Good handling by trainer.');

-- 10. ACADEMIC CALENDAR EVENTS TABLE
CREATE TABLE IF NOT EXISTS `academic_calendar_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `branch_id` INT NOT NULL DEFAULT 1,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `event_date` DATE NOT NULL,
  `end_date` DATE DEFAULT NULL,
  `event_type` VARCHAR(50) NOT NULL DEFAULT 'holiday'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO `academic_calendar_events` (`id`, `branch_id`, `title`, `description`, `event_date`, `end_date`, `event_type`) VALUES
(1, 1, 'Esala Full Moon Poya Day', 'Center Holiday', '2026-07-28', NULL, 'poya'),
(2, 1, 'Mid-Year Parent Teacher Meeting', 'Individual progress discussions', '2026-08-15', NULL, 'parents_teacher');

-- 11. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `user_name` VARCHAR(100) NOT NULL,
  `action` VARCHAR(255) NOT NULL,
  `table_name` VARCHAR(100) NOT NULL,
  `record_id` INT DEFAULT NULL,
  `ip_address` VARCHAR(50) DEFAULT '127.0.0.1',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `audit_logs` (`id`, `user_id`, `user_name`, `action`, `table_name`, `record_id`, `ip_address`, `created_at`) VALUES
(1, 1, 'Super Admin', 'system_init_database', 'system', 1, '127.0.0.1', NOW());
