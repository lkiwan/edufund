# MySQL Setup Guide for EduFund Platform

This guide will help you set up MySQL for the EduFund crowdfunding platform with all GoFundMe-like features.

## Prerequisites

- MySQL 8.0 or higher installed
- Node.js 18+ installed
- npm installed

## Step 1: Install MySQL

### Windows
1. Download MySQL from https://dev.mysql.com/downloads/installer/
2. Run the installer and choose "Developer Default"
3. Set a root password during installation
4. Remember your password!

### macOS
```bash
brew install mysql
brew services start mysql
mysql_secure_installation
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```

## Step 2: Create Database and User

Open MySQL command line:

```bash
mysql -u root -p
```

Then run these SQL commands:

```sql
-- Create the database
CREATE DATABASE edufund CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create a dedicated user
CREATE USER 'edufund_user'@'localhost' IDENTIFIED BY '132456';

-- Grant privileges
GRANT ALL PRIVILEGES ON edufund.* TO 'edufund_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Verify it worked
SHOW DATABASES;

-- Exit
EXIT;
```

## Step 3: Configure Environment Variables

Your `.env` file should already have these settings:

```env
DB_USER=edufund_user
DB_PASSWORD=132456
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=edufund
```

**IMPORTANT**: Change `DB_PASSWORD` to a strong password in production!

## Step 4: Install Dependencies

Run this command in your project directory:

```bash
npm install
```

This will install `mysql2` and all other dependencies.

## Step 5: Start the Application

The database tables will be created automatically when you start the server:

```bash
node server.js
```

You should see:

```
Connected to MySQL database
Admin user created successfully
Database tables initialized successfully
Server running on port 3001
```

## Step 6: Verify Database Setup

Connect to MySQL and check tables:

```bash
mysql -u edufund_user -p edufund
```

Then run:

```sql
SHOW TABLES;
```

You should see all these tables:
- `users`
- `campaigns`
- `donations`
- `campaign_metrics`
- `campaign_updates`
- `campaign_comments`
- `favorites`
- `campaign_team_members`
- `campaign_beneficiaries`
- `bank_accounts`
- `withdrawals`
- `recurring_donations`
- `donation_refunds`
- `thank_you_messages`
- `offline_donations`
- `donation_receipts`
- `email_notifications`
- `verification_requests`

## Database Schema Overview

### Core Tables

#### users
- Stores user accounts (students, donors, admins)
- Passwords are hashed with bcrypt
- Default admin: omar@gmail.com / 0668328275Aa

#### campaigns
- Main fundraising campaigns
- Includes all GoFundMe-like features:
  - Beneficiary information
  - Verification status
  - Trust score
  - Withdrawn amount tracking

#### donations
- All donations with tips/platform fees
- Automatic receipt generation
- Anonymous donation support

#### campaign_metrics
- View counts, shares, updates
- Used for trending algorithm

### GoFundMe Features

#### campaign_team_members
- Co-organizers and team management
- Permission-based access
- Invitation system

#### bank_accounts
- Secure bank account storage
- Masked account numbers
- Default account selection

#### withdrawals
- Fund withdrawal requests
- Admin approval workflow
- Balance tracking

#### recurring_donations
- Weekly, monthly, yearly donations
- Automatic scheduling
- Cancellation support

#### donation_refunds
- Donor refund requests
- Admin processing
- Campaign balance updates

#### verification_requests
- Campaign verification system
- Document upload
- Admin review workflow

## Testing the Setup

### 1. Test Database Connection

```bash
mysql -u edufund_user -p edufund -e "SELECT COUNT(*) FROM users;"
```

You should see at least 1 user (the admin).

### 2. Test API Endpoints

Start the server:
```bash
node server.js
```

Test in another terminal:

```bash
# Test campaigns list
curl http://localhost:3001/api/campaigns

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"omar@gmail.com","password":"0668328275Aa"}'
```

### 3. Test Frontend Connection

Start the frontend:
```bash
npm start
```

Visit `http://localhost:5173` and you should see campaigns loading.

## Common Issues

### Issue: "Access denied for user"

**Solution**: Check your `.env` file has the correct password:
```env
DB_PASSWORD=132456
```

### Issue: "Cannot connect to MySQL server"

**Solution**: Make sure MySQL is running:

Windows:
```cmd
net start MySQL80
```

macOS:
```bash
brew services start mysql
```

Linux:
```bash
sudo systemctl start mysql
```

### Issue: "Database 'edufund' doesn't exist"

**Solution**: Recreate the database:
```bash
mysql -u root -p
```
```sql
CREATE DATABASE edufund CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Issue: "Table doesn't exist"

**Solution**: The tables are created automatically. Just restart the server:
```bash
node server.js
```

## Production Recommendations

### 1. Change Default Password

```sql
ALTER USER 'edufund_user'@'localhost' IDENTIFIED BY 'your-strong-password-here';
FLUSH PRIVILEGES;
```

Update `.env`:
```env
DB_PASSWORD=your-strong-password-here
```

### 2. Enable SSL Connection

Add to your MySQL configuration (`my.cnf` or `my.ini`):
```ini
[mysqld]
require_secure_transport=ON
```

Update `init-db.js` pool config:
```javascript
const pool = mysql.createPool({
  // ...existing config...
  ssl: {
    rejectUnauthorized: true
  }
});
```

### 3. Set Up Backups

Daily backup script:
```bash
#!/bin/bash
mysqldump -u edufund_user -p edufund > backup-$(date +%Y%m%d).sql
```

### 4. Monitor Performance

Enable slow query log in MySQL:
```sql
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

### 5. Add Indexes for Performance

The schema already includes foreign keys. For better performance, you can add:

```sql
-- Index for campaign search
CREATE INDEX idx_campaigns_title ON campaigns(title(100));
CREATE INDEX idx_campaigns_category ON campaigns(category);
CREATE INDEX idx_campaigns_status ON campaigns(status);

-- Index for donations
CREATE INDEX idx_donations_created_at ON donations(created_at);
CREATE INDEX idx_donations_campaign_id_created_at ON donations(campaign_id, created_at);

-- Index for trending campaigns
CREATE INDEX idx_metrics_trending ON campaign_metrics(view_count, share_count);
```

## Migration from SQLite

If you have existing SQLite data:

### 1. Export from SQLite

```bash
sqlite3 src/db/edufund.sqlite .dump > sqlite_dump.sql
```

### 2. Convert to MySQL format

SQLite to MySQL differences:
- `AUTOINCREMENT` → `AUTO_INCREMENT`
- `INTEGER PRIMARY KEY` → `INT AUTO_INCREMENT PRIMARY KEY`
- `DATETIME('now')` → `CURRENT_TIMESTAMP`
- Boolean: `0/1` remains the same (MySQL uses TINYINT)

### 3. Import to MySQL

```bash
mysql -u edufund_user -p edufund < converted_dump.sql
```

## Useful MySQL Commands

### View all data in a table
```sql
SELECT * FROM campaigns LIMIT 10;
```

### Count records
```sql
SELECT COUNT(*) FROM donations;
```

### Find campaigns with most donations
```sql
SELECT c.title, COUNT(d.id) as donation_count, SUM(d.amount) as total_raised
FROM campaigns c
LEFT JOIN donations d ON c.id = d.campaign_id
GROUP BY c.id
ORDER BY total_raised DESC
LIMIT 10;
```

### Check database size
```sql
SELECT
    table_name AS `Table`,
    round(((data_length + index_length) / 1024 / 1024), 2) `Size in MB`
FROM information_schema.TABLES
WHERE table_schema = "edufund"
ORDER BY (data_length + index_length) DESC;
```

### View recent donations
```sql
SELECT d.*, c.title as campaign_title
FROM donations d
JOIN campaigns c ON d.campaign_id = c.id
ORDER BY d.created_at DESC
LIMIT 20;
```

## Next Steps

1. ✅ Database is set up
2. ✅ Tables are created
3. ✅ Admin user exists
4. → Start building campaigns!
5. → Test all GoFundMe features
6. → Set up payment processing (Stripe/PayPal)
7. → Configure email service for notifications
8. → Deploy to production

## Support

If you encounter issues:

1. Check MySQL error log:
   - Windows: `C:\ProgramData\MySQL\MySQL Server 8.0\Data\*.err`
   - macOS: `/usr/local/var/mysql/*.err`
   - Linux: `/var/log/mysql/error.log`

2. Enable debug logging in init-db.js:
   ```javascript
   console.log('Query:', sql);
   console.log('Params:', params);
   ```

3. Check Node.js console for errors

4. Verify network connectivity:
   ```bash
   telnet 127.0.0.1 3306
   ```

For more help, check the API documentation in `GOFUNDME_FEATURES_API.md`.
