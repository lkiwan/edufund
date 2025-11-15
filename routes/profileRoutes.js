const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

module.exports = (pool) => {
  const query = (sql, params) => pool.query(sql, params).then(([rows]) => rows);

  // ==================== PROFILE SETTINGS ENDPOINTS ====================

  // Get user profile (NEW - matches ProfileSettings.jsx)
  router.get('/profile/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      const users = await query(
        `SELECT id, email, first_name, last_name, phone, bio, avatar, university, field, year,
                city, country, facebook, twitter, linkedin, instagram, website, role, created_at
         FROM users WHERE id = ?`,
        [userId]
      );

      if (!users || users.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      res.json({ success: true, profile: users[0] });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch profile' });
    }
  });

  // Update user profile (NEW - matches ProfileSettings.jsx)
  router.put('/profile/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const {
        first_name, last_name, phone, bio, avatar,
        university, field, year, city, country,
        facebook, twitter, linkedin, instagram, website
      } = req.body;

      await query(
        `UPDATE users
         SET first_name = ?, last_name = ?, phone = ?, bio = ?, avatar = ?,
             university = ?, field = ?, year = ?, city = ?, country = ?,
             facebook = ?, twitter = ?, linkedin = ?, instagram = ?, website = ?
         WHERE id = ?`,
        [first_name, last_name, phone, bio, avatar,
         university, field, year, city, country,
         facebook, twitter, linkedin, instagram, website, userId]
      );

      res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
  });

  // Get user profile (OLD - keeping for backwards compatibility)
  router.get('/users/:userId/profile', async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await query(
        'SELECT id, email, full_name, bio, phone, location, profile_picture, cover_image, role, created_at FROM users WHERE id = ?',
        [userId]
      );

      if (!user || user.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      res.json({ success: true, profile: user[0] });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch profile' });
    }
  });

  // Update user profile (OLD - keeping for backwards compatibility)
  router.put('/users/:userId/profile', async (req, res) => {
    try {
      const { userId } = req.params;
      const { full_name, bio, phone, location, profile_picture, cover_image } = req.body;

      await query(
        `UPDATE users
         SET full_name = ?, bio = ?, phone = ?, location = ?, profile_picture = ?, cover_image = ?
         WHERE id = ?`,
        [full_name, bio, phone, location, profile_picture, cover_image, userId]
      );

      res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
  });

  // ==================== ACCOUNT SETTINGS ENDPOINTS ====================

  // Get account settings (NEW - matches AccountSettings.jsx)
  router.get('/account/settings/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      const users = await query(
        'SELECT id, email, role, created_at FROM users WHERE id = ?',
        [userId]
      );

      if (!users || users.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Get settings from user_settings table
      let settings = await query(
        'SELECT * FROM user_settings WHERE user_id = ?',
        [userId]
      );

      // Create default settings if none exist
      if (!settings || settings.length === 0) {
        await query(
          'INSERT INTO user_settings (user_id) VALUES (?)',
          [userId]
        );
        settings = await query(
          'SELECT * FROM user_settings WHERE user_id = ?',
          [userId]
        );
      }

      res.json({
        success: true,
        account: users[0],
        settings: settings[0]
      });
    } catch (error) {
      console.error('Error fetching account settings:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch account settings' });
    }
  });

  // Update account settings (NEW - matches AccountSettings.jsx)
  router.put('/account/settings/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const {
        email_notifications,
        campaign_updates,
        donation_receipts,
        monthly_reports,
        marketing_emails,
        two_factor_enabled,
        public_profile,
        show_donations
      } = req.body;

      await query(
        `UPDATE user_settings
         SET email_notifications = ?, campaign_updates = ?, donation_receipts = ?,
             monthly_reports = ?, marketing_emails = ?, two_factor_enabled = ?,
             public_profile = ?, show_donations = ?
         WHERE user_id = ?`,
        [email_notifications, campaign_updates, donation_receipts,
         monthly_reports, marketing_emails, two_factor_enabled,
         public_profile, show_donations, userId]
      );

      res.json({ success: true, message: 'Settings updated successfully' });
    } catch (error) {
      console.error('Error updating settings:', error);
      res.status(500).json({ success: false, error: 'Failed to update settings' });
    }
  });

  // Change password (NEW - matches AccountSettings.jsx)
  router.post('/account/change-password', async (req, res) => {
    try {
      const { userId, currentPassword, newPassword } = req.body;

      // Get current password
      const users = await query('SELECT password FROM users WHERE id = ?', [userId]);
      if (!users || users.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
      if (!isValidPassword) {
        return res.status(401).json({ success: false, error: 'Current password is incorrect' });
      }

      // Hash new password
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(newPassword, salt);

      // Update password
      await query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

      // Log activity
      await query(
        'INSERT INTO user_activity_log (user_id, activity_type, activity_description) VALUES (?, ?, ?)',
        [userId, 'PASSWORD_CHANGE', 'Password changed successfully']
      );

      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ success: false, error: 'Failed to change password' });
    }
  });

  // Delete account (NEW - matches AccountSettings.jsx)
  router.delete('/account/delete/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { password } = req.body;

      // Verify password before deletion
      const users = await query('SELECT password FROM users WHERE id = ?', [userId]);
      if (!users || users.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const isValidPassword = await bcrypt.compare(password, users[0].password);
      if (!isValidPassword) {
        return res.status(401).json({ success: false, error: 'Invalid password' });
      }

      // Delete user (cascading deletes will handle related records)
      await query('DELETE FROM users WHERE id = ?', [userId]);

      res.json({ success: true, message: 'Account deleted successfully' });
    } catch (error) {
      console.error('Error deleting account:', error);
      res.status(500).json({ success: false, error: 'Failed to delete account' });
    }
  });

  // Get user account settings (OLD - keeping for backwards compatibility)
  router.get('/users/:userId/account', async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await query(
        'SELECT id, email, role, created_at FROM users WHERE id = ?',
        [userId]
      );

      if (!user || user.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Get preferences
      let preferences = await query(
        'SELECT * FROM user_preferences WHERE user_id = ?',
        [userId]
      );

      // Create default preferences if none exist
      if (!preferences || preferences.length === 0) {
        await query(
          'INSERT INTO user_preferences (user_id) VALUES (?)',
          [userId]
        );
        preferences = await query(
          'SELECT * FROM user_preferences WHERE user_id = ?',
          [userId]
        );
      }

      res.json({ success: true, account: user[0], preferences: preferences[0] });
    } catch (error) {
      console.error('Error fetching account:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch account settings' });
    }
  });

  // Update email
  router.put('/users/:userId/email', async (req, res) => {
    try {
      const { userId } = req.params;
      const { newEmail, password } = req.body;

      // Verify password
      const user = await query('SELECT password FROM users WHERE id = ?', [userId]);
      if (!user || user.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const isValidPassword = await bcrypt.compare(password, user[0].password);
      if (!isValidPassword) {
        return res.status(401).json({ success: false, error: 'Invalid password' });
      }

      // Check if email already exists
      const existingEmail = await query('SELECT id FROM users WHERE email = ? AND id != ?', [newEmail, userId]);
      if (existingEmail && existingEmail.length > 0) {
        return res.status(400).json({ success: false, error: 'Email already in use' });
      }

      // Update email
      await query('UPDATE users SET email = ? WHERE id = ?', [newEmail, userId]);

      // Log activity
      await query(
        'INSERT INTO activity_log (user_id, action, description) VALUES (?, ?, ?)',
        [userId, 'email_changed', `Email changed to ${newEmail}`]
      );

      res.json({ success: true, message: 'Email updated successfully' });
    } catch (error) {
      console.error('Error updating email:', error);
      res.status(500).json({ success: false, error: 'Failed to update email' });
    }
  });

  // Update password
  router.put('/users/:userId/password', async (req, res) => {
    try {
      const { userId } = req.params;
      const { currentPassword, newPassword } = req.body;

      // Get current password
      const user = await query('SELECT password FROM users WHERE id = ?', [userId]);
      if (!user || user.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user[0].password);
      if (!isValidPassword) {
        return res.status(401).json({ success: false, error: 'Current password is incorrect' });
      }

      // Hash new password
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(newPassword, salt);

      // Update password
      await query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

      // Log activity
      await query(
        'INSERT INTO activity_log (user_id, action, description) VALUES (?, ?, ?)',
        [userId, 'password_changed', 'Password changed successfully']
      );

      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ success: false, error: 'Failed to update password' });
    }
  });

  // Update preferences
  router.put('/users/:userId/preferences', async (req, res) => {
    try {
      const { userId } = req.params;
      const preferences = req.body;

      await query(
        `UPDATE user_preferences
         SET email_notifications = ?, push_notifications = ?, sms_notifications = ?,
             newsletter = ?, campaign_updates = ?, donation_receipts = ?, monthly_reports = ?,
             language = ?, timezone = ?, currency = ?
         WHERE user_id = ?`,
        [
          preferences.email_notifications, preferences.push_notifications, preferences.sms_notifications,
          preferences.newsletter, preferences.campaign_updates, preferences.donation_receipts, preferences.monthly_reports,
          preferences.language, preferences.timezone, preferences.currency,
          userId
        ]
      );

      res.json({ success: true, message: 'Preferences updated successfully' });
    } catch (error) {
      console.error('Error updating preferences:', error);
      res.status(500).json({ success: false, error: 'Failed to update preferences' });
    }
  });

  // ==================== SAVED CAMPAIGNS / FAVORITES ENDPOINTS ====================

  // Get favorites (NEW - matches SavedCampaigns.jsx)
  router.get('/favorites/:userId', async (req, res) => {
    try {
      const { userId } = req.params;

      const favorites = await query(
        `SELECT c.*, f.created_at as favorited_at
         FROM campaigns c
         INNER JOIN favorites f ON c.id = f.campaign_id
         WHERE f.user_id = ?
         ORDER BY f.created_at DESC`,
        [userId]
      );

      res.json({ success: true, favorites });
    } catch (error) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch favorites' });
    }
  });

  // Toggle favorite (NEW - matches SavedCampaigns.jsx)
  router.post('/favorites/toggle', async (req, res) => {
    try {
      const { userId, campaignId } = req.body;

      // Check if favorite exists
      const existing = await query(
        'SELECT id FROM favorites WHERE user_id = ? AND campaign_id = ?',
        [userId, campaignId]
      );

      if (existing && existing.length > 0) {
        // Remove favorite
        await query(
          'DELETE FROM favorites WHERE user_id = ? AND campaign_id = ?',
          [userId, campaignId]
        );
        res.json({ success: true, isFavorited: false, message: 'Removed from favorites' });
      } else {
        // Add favorite
        await query(
          'INSERT INTO favorites (user_id, campaign_id) VALUES (?, ?)',
          [userId, campaignId]
        );
        res.json({ success: true, isFavorited: true, message: 'Added to favorites' });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      res.status(500).json({ success: false, error: 'Failed to toggle favorite' });
    }
  });

  // Check if campaign is favorited
  router.get('/favorites/check/:userId/:campaignId', async (req, res) => {
    try {
      const { userId, campaignId } = req.params;

      const favorite = await query(
        'SELECT id FROM favorites WHERE user_id = ? AND campaign_id = ?',
        [userId, campaignId]
      );

      res.json({ success: true, isFavorited: favorite && favorite.length > 0 });
    } catch (error) {
      console.error('Error checking favorite:', error);
      res.status(500).json({ success: false, error: 'Failed to check favorite status' });
    }
  });

  // Get saved campaigns (OLD - keeping for backwards compatibility)
  router.get('/users/:userId/saved-campaigns', async (req, res) => {
    try {
      const { userId } = req.params;

      const savedCampaigns = await query(
        `SELECT c.*, cf.created_at as saved_at
         FROM campaigns c
         INNER JOIN campaign_followers cf ON c.id = cf.campaign_id
         WHERE cf.user_id = ?
         ORDER BY cf.created_at DESC`,
        [userId]
      );

      res.json({ success: true, campaigns: savedCampaigns });
    } catch (error) {
      console.error('Error fetching saved campaigns:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch saved campaigns' });
    }
  });

  // ==================== NOTIFICATIONS ENDPOINTS ====================

  // Get user notifications
  router.get('/users/:userId/notifications', async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const notifications = await query(
        `SELECT * FROM notifications
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, parseInt(limit), parseInt(offset)]
      );

      const unreadCount = await query(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE',
        [userId]
      );

      res.json({
        success: true,
        notifications,
        unreadCount: unreadCount[0]?.count || 0
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
  });

  // Mark notification as read
  router.put('/notifications/:notificationId/read', async (req, res) => {
    try {
      const { notificationId } = req.params;

      await query(
        'UPDATE notifications SET is_read = TRUE WHERE id = ?',
        [notificationId]
      );

      res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ success: false, error: 'Failed to mark notification as read' });
    }
  });

  // Mark all notifications as read
  router.put('/users/:userId/notifications/read-all', async (req, res) => {
    try {
      const { userId } = req.params;

      await query(
        'UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE',
        [userId]
      );

      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ success: false, error: 'Failed to mark all notifications as read' });
    }
  });

  // Delete notification
  router.delete('/notifications/:notificationId', async (req, res) => {
    try {
      const { notificationId } = req.params;

      await query('DELETE FROM notifications WHERE id = ?', [notificationId]);

      res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ success: false, error: 'Failed to delete notification' });
    }
  });

  // ==================== SUPPORT TICKETS ENDPOINTS ====================

  // Create support ticket
  router.post('/support/tickets', async (req, res) => {
    try {
      const { userId, name, email, subject, message, category } = req.body;

      const result = await query(
        `INSERT INTO support_tickets (user_id, name, email, subject, message, category)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId || null, name, email, subject, message, category || 'general']
      );

      // Create notification for user
      if (userId) {
        await query(
          `INSERT INTO notifications (user_id, type, title, message)
           VALUES (?, ?, ?, ?)`,
          [userId, 'support', 'Support Ticket Created', `Your ticket "${subject}" has been received. We'll get back to you soon.`]
        );
      }

      res.json({
        success: true,
        message: 'Support ticket created successfully',
        ticketId: result.insertId
      });
    } catch (error) {
      console.error('Error creating support ticket:', error);
      res.status(500).json({ success: false, error: 'Failed to create support ticket' });
    }
  });

  // Get user support tickets
  router.get('/users/:userId/support-tickets', async (req, res) => {
    try {
      const { userId } = req.params;

      const tickets = await query(
        'SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );

      res.json({ success: true, tickets });
    } catch (error) {
      console.error('Error fetching support tickets:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch support tickets' });
    }
  });

  // ==================== ACTIVITY LOG ENDPOINTS ====================

  // Get user activity log
  router.get('/users/:userId/activity', async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 50, offset = 0 } = req.query;

      const activity = await query(
        `SELECT * FROM activity_log
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [userId, parseInt(limit), parseInt(offset)]
      );

      res.json({ success: true, activity });
    } catch (error) {
      console.error('Error fetching activity log:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch activity log' });
    }
  });

  return router;
};
