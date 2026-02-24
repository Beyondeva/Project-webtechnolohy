-- =============================================
-- Dormitory Maintenance Ticketing System
-- MySQL Database Setup
-- =============================================

CREATE DATABASE IF NOT EXISTS dorm_maintenance
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE dorm_maintenance;

-- -------------------------------------------
-- Table: users
-- -------------------------------------------
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'technician', 'admin') NOT NULL,
  name VARCHAR(100) NOT NULL,
  avatar VARCHAR(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------
-- Table: tickets
-- -------------------------------------------
CREATE TABLE tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  room_number VARCHAR(20),
  status ENUM('Pending', 'In-Progress', 'Resolved') NOT NULL DEFAULT 'Pending',
  created_by INT NOT NULL,
  technician_id INT DEFAULT NULL,
  image_before VARCHAR(500) DEFAULT NULL,
  image_after VARCHAR(500) DEFAULT NULL,
  rating INT DEFAULT NULL CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
  review TEXT DEFAULT NULL,
  cancel_reason TEXT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (technician_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------
-- Seed: Demo Users
-- -------------------------------------------
INSERT INTO users (username, password, role, name) VALUES
  ('user1', 'pass1', 'user', 'สมชาย ดีใจ'),
  ('user2', 'pass2', 'user', 'สมหญิง สุขสันต์'),
  ('user3', 'pass3', 'user', 'วิภา รักเรียน'),
  ('tech1', 'pass1', 'technician', 'ช่างประยุทธ์ ซ่อมเก่ง'),
  ('tech2', 'pass2', 'technician', 'ช่างสมศักดิ์ แก้ไขดี'),
  ('admin', 'admin123', 'admin', 'ผู้ดูแลระบบ');
