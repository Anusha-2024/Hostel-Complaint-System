-- SRM KTR Hostel Complaint Management System
-- Run this script to initialize the database

CREATE DATABASE IF NOT EXISTS hostel_complaints;
USE hostel_complaints;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  reg_no VARCHAR(20) UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'staff', 'admin') DEFAULT 'student',
  hostel_block VARCHAR(10),
  room_no VARCHAR(10),
  phone VARCHAR(15),
  department VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Complaints table
CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id VARCHAR(20) UNIQUE NOT NULL,
  student_id INT NOT NULL,
  category ENUM('Electrical','Plumbing','Housekeeping','Internet','Furniture','Mess','Water Supply') NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  image_url VARCHAR(500),
  priority ENUM('Low','Medium','High','Critical') DEFAULT 'Medium',
  status ENUM('Submitted','Assigned','In Progress','Resolved','Closed') DEFAULT 'Submitted',
  assigned_to INT,
  hostel_block VARCHAR(10),
  room_no VARCHAR(10),
  sla_deadline DATETIME,
  resolved_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Complaint updates/timeline
CREATE TABLE IF NOT EXISTS complaint_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  updated_by INT NOT NULL,
  status ENUM('Submitted','Assigned','In Progress','Resolved','Closed') NOT NULL,
  remarks TEXT,
  proof_image VARCHAR(500),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT UNIQUE NOT NULL,
  student_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  complaint_id INT,
  message TEXT NOT NULL,
  type ENUM('info','success','warning','error') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE SET NULL
);

-- SLA Config table
CREATE TABLE IF NOT EXISTS sla_config (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(50) UNIQUE NOT NULL,
  hours_limit INT NOT NULL,
  priority_multiplier FLOAT DEFAULT 1.0
);

-- Default SLA config
INSERT INTO sla_config (category, hours_limit) VALUES
  ('Electrical', 24),
  ('Plumbing', 12),
  ('Housekeeping', 48),
  ('Internet', 8),
  ('Furniture', 72),
  ('Mess', 6),
  ('Water Supply', 12)
ON DUPLICATE KEY UPDATE hours_limit = VALUES(hours_limit);

-- Staff assignments config
CREATE TABLE IF NOT EXISTS staff_category (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staff_id INT NOT NULL,
  category VARCHAR(50) NOT NULL,
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Default admin account (password: Admin@123)
INSERT INTO users (name, email, password, role, hostel_block) VALUES
  ('Admin', 'admin@srmktr.edu.in', '$2a$10$cv8jQAaDHP9gf/lNVCnaTeJB0BdDMeScFfGlUO/iBrePD5HF0RDiu', 'admin', 'Admin')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Sample staff (password: Staff@123)
INSERT INTO users (name, email, password, role, department) VALUES
  ('Rajan Electrician', 'rajan.electric@srmktr.edu.in', '$2a$10$G0EMsP5JCtFj5rfMWEgXluOPLNvZazJcD.mwG0debJ7dDTTOFP2km', 'staff', 'Electrical'),
  ('Kumar Plumber', 'kumar.plumb@srmktr.edu.in', '$2a$10$G0EMsP5JCtFj5rfMWEgXluOPLNvZazJcD.mwG0debJ7dDTTOFP2km', 'staff', 'Plumbing'),
  ('Siva Network', 'siva.network@srmktr.edu.in', '$2a$10$G0EMsP5JCtFj5rfMWEgXluOPLNvZazJcD.mwG0debJ7dDTTOFP2km', 'staff', 'Internet')
ON DUPLICATE KEY UPDATE name = VALUES(name);
