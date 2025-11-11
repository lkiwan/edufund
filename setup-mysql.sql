-- EduFund MySQL Database Setup Script
-- Run this in MySQL Workbench

-- Create the database
CREATE DATABASE IF NOT EXISTS edufund;

-- Use the database
USE edufund;

-- Create user for the application (allowing connections from any host)
CREATE USER IF NOT EXISTS 'edufund_user'@'%' IDENTIFIED BY '132456';

-- Grant all privileges on the edufund database
GRANT ALL PRIVILEGES ON edufund.* TO 'edufund_user'@'%';

-- Also allow root user from any host for development
-- Note: Only use this for development, not production!
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED BY '132456';
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' WITH GRANT OPTION;

-- Flush privileges to apply changes
FLUSH PRIVILEGES;

-- Verify the database was created
SHOW DATABASES;

-- Show users
SELECT User, Host FROM mysql.user WHERE User IN ('root', 'edufund_user');
