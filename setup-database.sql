-- EduFund Database Setup Script
-- Run this with: sudo mysql < setup-database.sql

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS edufund CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user if it doesn't exist
CREATE USER IF NOT EXISTS 'edufund_user'@'localhost' IDENTIFIED BY '132456';

-- Grant all privileges on edufund database to edufund_user
GRANT ALL PRIVILEGES ON edufund.* TO 'edufund_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Show success message
SELECT 'Database and user created successfully!' as status;

-- Show databases to confirm
SHOW DATABASES;
