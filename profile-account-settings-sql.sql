-- =====================================================
-- SQL SCHEMA FOR PROFILE & ACCOUNT SETTINGS FEATURES
-- =====================================================

-- 1. ADD COLUMNS TO USERS TABLE FOR PROFILE SETTINGS
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS university VARCHAR(200);
ALTER TABLE users ADD COLUMN IF NOT EXISTS field VARCHAR(150);
ALTER TABLE users ADD COLUMN IF NOT EXISTS year VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'Morocco';

-- Social Links
ALTER TABLE users ADD COLUMN IF NOT EXISTS facebook VARCHAR(300);
ALTER TABLE users ADD COLUMN IF NOT EXISTS twitter VARCHAR(300);
ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin VARCHAR(300);
ALTER TABLE users ADD COLUMN IF NOT EXISTS instagram VARCHAR(300);
ALTER TABLE users ADD COLUMN IF NOT EXISTS website VARCHAR(300);

-- 2. CREATE USER_SETTINGS TABLE FOR ACCOUNT PREFERENCES
CREATE TABLE IF NOT EXISTS user_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,

  -- Notification Settings
  email_notifications BOOLEAN DEFAULT TRUE,
  campaign_updates BOOLEAN DEFAULT TRUE,
  donation_receipts BOOLEAN DEFAULT TRUE,
  monthly_reports BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT FALSE,

  -- Security Settings
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  two_factor_secret VARCHAR(500),

  -- Privacy Settings
  public_profile BOOLEAN DEFAULT TRUE,
  show_donations BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. CREATE FAVORITES TABLE FOR SAVED CAMPAIGNS
CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  campaign_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  UNIQUE KEY unique_favorite (user_id, campaign_id),
  INDEX idx_user_favorites (user_id),
  INDEX idx_campaign_favorites (campaign_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CREATE USER_SESSIONS TABLE FOR LOGIN TRACKING
CREATE TABLE IF NOT EXISTS user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_token VARCHAR(500) NOT NULL,
  ip_address VARCHAR(50),
  user_agent TEXT,
  device_type VARCHAR(50),
  location VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_sessions (user_id),
  INDEX idx_session_token (session_token(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. CREATE PASSWORD_RESET_TOKENS TABLE
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token(255)),
  INDEX idx_user_reset (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. CREATE USER_ACTIVITY_LOG TABLE
CREATE TABLE IF NOT EXISTS user_activity_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  activity_type VARCHAR(100) NOT NULL,
  activity_description TEXT,
  ip_address VARCHAR(50),
  user_agent TEXT,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_activity (user_id),
  INDEX idx_activity_type (activity_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. CREATE NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'donation', 'campaign_update', 'comment', 'milestone', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_notifications (user_id),
  INDEX idx_is_read (is_read),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. INSERT DEFAULT SETTINGS FOR EXISTING USERS
INSERT IGNORE INTO user_settings (user_id)
SELECT id FROM users WHERE NOT EXISTS (
  SELECT 1 FROM user_settings WHERE user_settings.user_id = users.id
);

-- 9. CREATE VIEWS FOR EASY QUERIES

-- View for user profiles with settings
CREATE OR REPLACE VIEW user_profiles AS
SELECT
  u.id,
  u.email,
  u.role,
  u.first_name,
  u.last_name,
  u.phone,
  u.bio,
  u.avatar,
  u.university,
  u.field,
  u.year,
  u.city,
  u.country,
  u.facebook,
  u.twitter,
  u.linkedin,
  u.instagram,
  u.website,
  u.verified,
  u.status,
  u.created_at,
  us.email_notifications,
  us.campaign_updates,
  us.donation_receipts,
  us.monthly_reports,
  us.marketing_emails,
  us.two_factor_enabled,
  us.public_profile,
  us.show_donations
FROM users u
LEFT JOIN user_settings us ON u.id = us.user_id;

-- View for user favorites with campaign details
CREATE OR REPLACE VIEW user_favorites AS
SELECT
  f.id as favorite_id,
  f.user_id,
  f.created_at as favorited_at,
  c.*
FROM favorites f
INNER JOIN campaigns c ON f.campaign_id = c.id;

-- 10. CREATE STORED PROCEDURES

DELIMITER //

-- Procedure to toggle favorite
CREATE PROCEDURE IF NOT EXISTS toggle_favorite(
  IN p_user_id INT,
  IN p_campaign_id INT,
  OUT p_is_favorited BOOLEAN
)
BEGIN
  DECLARE favorite_exists INT;

  SELECT COUNT(*) INTO favorite_exists
  FROM favorites
  WHERE user_id = p_user_id AND campaign_id = p_campaign_id;

  IF favorite_exists > 0 THEN
    DELETE FROM favorites
    WHERE user_id = p_user_id AND campaign_id = p_campaign_id;
    SET p_is_favorited = FALSE;
  ELSE
    INSERT INTO favorites (user_id, campaign_id)
    VALUES (p_user_id, p_campaign_id);
    SET p_is_favorited = TRUE;
  END IF;
END //

-- Procedure to get user notification count
CREATE PROCEDURE IF NOT EXISTS get_unread_notification_count(
  IN p_user_id INT,
  OUT p_count INT
)
BEGIN
  SELECT COUNT(*) INTO p_count
  FROM notifications
  WHERE user_id = p_user_id AND is_read = FALSE;
END //

DELIMITER ;

-- 11. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- 12. SAMPLE DATA (OPTIONAL - COMMENT OUT IF NOT NEEDED)
/*
-- Sample user settings
INSERT INTO user_settings (user_id, email_notifications, campaign_updates)
SELECT id, TRUE, TRUE FROM users LIMIT 5;

-- Sample favorites
INSERT INTO favorites (user_id, campaign_id)
SELECT
  (SELECT id FROM users WHERE role = 'donor' LIMIT 1),
  id
FROM campaigns
WHERE status = 'active'
LIMIT 3;
*/

-- 13. GRANT PERMISSIONS (ADJUST AS NEEDED FOR YOUR SETUP)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON edufund.* TO 'your_app_user'@'localhost';

-- =====================================================
-- END OF SCHEMA
-- =====================================================

-- To run this file:
-- mysql -u your_username -p your_database_name < profile-account-settings-sql.sql
