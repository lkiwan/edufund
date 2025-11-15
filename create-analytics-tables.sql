-- Campaign View Tracking Table
CREATE TABLE IF NOT EXISTS campaign_views (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  user_id INT NULL,
  ip_address VARCHAR(45) NULL,
  user_agent TEXT NULL,
  referrer TEXT NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_id VARCHAR(255) NULL,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_campaign_id (campaign_id),
  INDEX idx_user_id (user_id),
  INDEX idx_viewed_at (viewed_at),
  INDEX idx_session_id (session_id)
);

-- Campaign Performance Metrics Table (daily aggregates)
CREATE TABLE IF NOT EXISTS campaign_daily_stats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  stat_date DATE NOT NULL,
  views_count INT DEFAULT 0,
  unique_visitors INT DEFAULT 0,
  donations_count INT DEFAULT 0,
  donations_amount DECIMAL(10,2) DEFAULT 0,
  shares_count INT DEFAULT 0,
  followers_count INT DEFAULT 0,
  conversion_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  UNIQUE KEY unique_campaign_date (campaign_id, stat_date),
  INDEX idx_stat_date (stat_date)
);

-- Platform-wide Daily Statistics
CREATE TABLE IF NOT EXISTS platform_daily_stats (
  id INT PRIMARY KEY AUTO_INCREMENT,
  stat_date DATE NOT NULL UNIQUE,
  total_campaigns INT DEFAULT 0,
  active_campaigns INT DEFAULT 0,
  new_campaigns INT DEFAULT 0,
  total_donations INT DEFAULT 0,
  donations_amount DECIMAL(12,2) DEFAULT 0,
  new_users INT DEFAULT 0,
  total_users INT DEFAULT 0,
  platform_views INT DEFAULT 0,
  success_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_stat_date (stat_date)
);

-- User Activity Log (for view history)
CREATE TABLE IF NOT EXISTS user_activity (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NULL,
  activity_type ENUM('view', 'donate', 'share', 'follow', 'comment', 'search') NOT NULL,
  campaign_id INT NULL,
  metadata JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  session_id VARCHAR(255) NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_activity_type (activity_type),
  INDEX idx_created_at (created_at),
  INDEX idx_campaign_id (campaign_id)
);

-- Trending Campaigns Cache (updated every hour)
CREATE TABLE IF NOT EXISTS trending_campaigns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  trending_score DECIMAL(10,2) NOT NULL,
  rank_position INT NOT NULL,
  period ENUM('hour', 'day', 'week', 'month') DEFAULT 'day',
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  INDEX idx_period_rank (period, rank_position),
  INDEX idx_calculated_at (calculated_at)
);
