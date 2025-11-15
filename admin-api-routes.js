// Complete Admin API Routes with Full Functionality
// Add this to your server.js

// Helper function to log admin actions
async function logAdminAction(adminId, adminEmail, actionType, entityType, entityId, oldValue, newValue, details) {
  try {
    await query(
      `INSERT INTO audit_log (admin_id, admin_email, action_type, entity_type, entity_id, old_value, new_value, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [adminId, adminEmail, actionType, entityType, entityId, JSON.stringify(oldValue), JSON.stringify(newValue), details]
    );
  } catch (err) {
    console.error('Error logging admin action:', err);
  }
}

// Helper function to log system activity
async function logSystemActivity(userId, userEmail, activityType, action, details, success = true, errorMessage = null) {
  try {
    await query(
      `INSERT INTO system_activity_log (user_id, user_email, activity_type, action, details, success, error_message)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, userEmail, activityType, action, JSON.stringify(details), success, errorMessage]
    );
  } catch (err) {
    console.error('Error logging system activity:', err);
  }
}

// ===== USER/PROFILE MANAGEMENT =====

// Get all users with filters
app.get('/api/admin/users', async (req, res) => {
  try {
    const { status, role, verified, search, page = 1, limit = 20 } = req.query;
    const where = [];
    const params = [];

    if (status) {
      where.push('status = ?');
      params.push(status);
    }
    if (role) {
      where.push('role = ?');
      params.push(role);
    }
    if (verified !== undefined) {
      where.push('verified = ?');
      params.push(verified === 'true' ? 1 : 0);
    }
    if (search) {
      where.push('(email LIKE ? OR id = ?)');
      params.push(`%${search}%`, parseInt(search) || 0);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [total] = await query(`SELECT COUNT(*) as count FROM users ${whereSql}`, params);

    const users = await query(
      `SELECT id, email, role, status, verified, created_at, profile_approved_at, rejection_reason
       FROM users ${whereSql}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      users,
      total: total.count,
      page: parseInt(page),
      totalPages: Math.ceil(total.count / parseInt(limit))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user details with full history
app.get('/api/admin/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    const [user] = await query('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's campaigns
    const campaigns = await query('SELECT * FROM campaigns WHERE user_id = ?', [userId]);

    // Get user's donations
    const donations = await query('SELECT * FROM donations WHERE user_id = ?', [userId]);

    // Get status history
    const statusHistory = await query(
      `SELECT h.*, u.email as changed_by_email
       FROM user_status_history h
       LEFT JOIN users u ON h.changed_by = u.id
       WHERE h.user_id = ?
       ORDER BY h.created_at DESC`,
      [userId]
    );

    // Get audit log
    const auditLog = await query(
      `SELECT * FROM audit_log
       WHERE entity_type = 'user' AND entity_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );

    res.json({
      success: true,
      user,
      campaigns,
      donations,
      statusHistory,
      auditLog
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve user profile (WORKING VERSION)
app.post('/api/admin/users/:id/approve', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { adminId, adminEmail, notes } = req.body;

    // Get current user state
    const [user] = await query('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oldStatus = user.status;

    // Update user status
    await query(
      `UPDATE users
       SET verified = 1,
           status = 'active',
           profile_approved_at = NOW(),
           approved_by = ?
       WHERE id = ?`,
      [adminId, userId]
    );

    // Log status history
    await query(
      `INSERT INTO user_status_history (user_id, old_status, new_status, changed_by, reason)
       VALUES (?, ?, 'active', ?, ?)`,
      [userId, oldStatus, adminId, notes || 'Profile approved by admin']
    );

    // Log admin action
    await logAdminAction(
      adminId,
      adminEmail,
      'APPROVE_PROFILE',
      'user',
      userId,
      { status: oldStatus, verified: user.verified },
      { status: 'active', verified: 1 },
      `Profile approved. Notes: ${notes || 'None'}`
    );

    // Log system activity
    await logSystemActivity(
      userId,
      user.email,
      'PROFILE_VERIFICATION',
      'APPROVED',
      { approvedBy: adminEmail, notes }
    );

    // Remove notification if exists
    await query(
      'DELETE FROM admin_notifications WHERE notification_type = ? AND entity_id = ?',
      ['profile_review', userId]
    );

    res.json({
      success: true,
      message: 'Profile approved successfully',
      user: {
        id: userId,
        email: user.email,
        status: 'active',
        verified: true
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject user profile (WORKING VERSION)
app.post('/api/admin/users/:id/reject', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { adminId, adminEmail, reason } = req.body;

    const [user] = await query('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oldStatus = user.status;

    // Update user status
    await query(
      `UPDATE users
       SET verified = 0,
           status = 'rejected',
           rejection_reason = ?
       WHERE id = ?`,
      [reason, userId]
    );

    // Log status history
    await query(
      `INSERT INTO user_status_history (user_id, old_status, new_status, changed_by, reason)
       VALUES (?, ?, 'rejected', ?, ?)`,
      [userId, oldStatus, adminId, reason]
    );

    // Log admin action
    await logAdminAction(
      adminId,
      adminEmail,
      'REJECT_PROFILE',
      'user',
      userId,
      { status: oldStatus },
      { status: 'rejected' },
      `Profile rejected. Reason: ${reason}`
    );

    res.json({
      success: true,
      message: 'Profile rejected',
      user: {
        id: userId,
        email: user.email,
        status: 'rejected',
        reason
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Suspend user
app.post('/api/admin/users/:id/suspend', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { adminId, adminEmail, reason } = req.body;

    const [user] = await query('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oldStatus = user.status;

    await query('UPDATE users SET status = ?, rejection_reason = ? WHERE id = ?', ['suspended', reason, userId]);

    await query(
      `INSERT INTO user_status_history (user_id, old_status, new_status, changed_by, reason)
       VALUES (?, ?, 'suspended', ?, ?)`,
      [userId, oldStatus, adminId, reason]
    );

    await logAdminAction(adminId, adminEmail, 'SUSPEND_USER', 'user', userId, { status: oldStatus }, { status: 'suspended' }, reason);

    res.json({ success: true, message: 'User suspended' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reactivate user
app.post('/api/admin/users/:id/reactivate', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { adminId, adminEmail, notes } = req.body;

    const [user] = await query('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oldStatus = user.status;

    await query('UPDATE users SET status = ?, verified = 1, rejection_reason = NULL WHERE id = ?', ['active', userId]);

    await query(
      `INSERT INTO user_status_history (user_id, old_status, new_status, changed_by, reason)
       VALUES (?, ?, 'active', ?, ?)`,
      [userId, oldStatus, adminId, notes || 'Reactivated by admin']
    );

    await logAdminAction(adminId, adminEmail, 'REACTIVATE_USER', 'user', userId, { status: oldStatus }, { status: 'active' }, notes);

    res.json({ success: true, message: 'User reactivated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== CAMPAIGN MANAGEMENT =====

// Get all campaigns for admin (including drafts, pending, etc.)
app.get('/api/admin/campaigns', async (req, res) => {
  try {
    const { status, flagged, search, page = 1, limit = 20 } = req.query;
    const where = [];
    const params = [];

    if (status) {
      where.push('c.status = ?');
      params.push(status);
    }
    if (flagged === 'true') {
      where.push('c.flagged = 1');
    }
    if (search) {
      where.push('(c.title LIKE ? OR c.id = ? OR u.email LIKE ?)');
      params.push(`%${search}%`, parseInt(search) || 0, `%${search}%`);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [total] = await query(
      `SELECT COUNT(*) as count FROM campaigns c LEFT JOIN users u ON c.user_id = u.id ${whereSql}`,
      params
    );

    const campaigns = await query(
      `SELECT c.*, u.email as creator_email, u.status as user_status
       FROM campaigns c
       LEFT JOIN users u ON c.user_id = u.id
       ${whereSql}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      campaigns,
      total: total.count,
      page: parseInt(page),
      totalPages: Math.ceil(total.count / parseInt(limit))
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get campaign details with full history
app.get('/api/admin/campaigns/:id/details', async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);

    const [campaign] = await query('SELECT c.*, u.email as creator_email FROM campaigns c LEFT JOIN users u ON c.user_id = u.id WHERE c.id = ?', [campaignId]);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const donations = await query('SELECT * FROM donations WHERE campaign_id = ? ORDER BY created_at DESC', [campaignId]);
    const updates = await query('SELECT * FROM campaign_updates WHERE campaign_id = ? ORDER BY created_at DESC', [campaignId]);
    const comments = await query('SELECT * FROM campaign_comments WHERE campaign_id = ? ORDER BY created_at DESC', [campaignId]);

    const statusHistory = await query(
      `SELECT h.*, u.email as changed_by_email
       FROM campaign_status_history h
       LEFT JOIN users u ON h.changed_by = u.id
       WHERE h.campaign_id = ?
       ORDER BY h.created_at DESC`,
      [campaignId]
    );

    const auditLog = await query(
      `SELECT * FROM audit_log WHERE entity_type = 'campaign' AND entity_id = ? ORDER BY created_at DESC LIMIT 50`,
      [campaignId]
    );

    res.json({
      success: true,
      campaign,
      donations,
      updates,
      comments,
      statusHistory,
      auditLog
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve campaign (WORKING VERSION)
app.post('/api/admin/campaigns/:id/approve', async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const { adminId, adminEmail, notes } = req.body;

    const [campaign] = await query('SELECT * FROM campaigns WHERE id = ?', [campaignId]);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const oldStatus = campaign.status;

    await query(
      `UPDATE campaigns
       SET status = 'active',
           approved_at = NOW(),
           approved_by = ?,
           moderation_notes = ?
       WHERE id = ?`,
      [adminId, notes, campaignId]
    );

    await query(
      `INSERT INTO campaign_status_history (campaign_id, old_status, new_status, changed_by, reason)
       VALUES (?, ?, 'active', ?, ?)`,
      [campaignId, oldStatus, adminId, notes || 'Campaign approved']
    );

    await logAdminAction(adminId, adminEmail, 'APPROVE_CAMPAIGN', 'campaign', campaignId, { status: oldStatus }, { status: 'active' }, notes);

    await query('DELETE FROM admin_notifications WHERE notification_type = ? AND entity_id = ?', ['campaign_review', campaignId]);

    res.json({ success: true, message: 'Campaign approved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Reject campaign (WORKING VERSION)
app.post('/api/admin/campaigns/:id/reject', async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const { adminId, adminEmail, reason } = req.body;

    const [campaign] = await query('SELECT * FROM campaigns WHERE id = ?', [campaignId]);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const oldStatus = campaign.status;

    await query('UPDATE campaigns SET status = ?, rejection_reason = ? WHERE id = ?', ['rejected', reason, campaignId]);

    await query(
      `INSERT INTO campaign_status_history (campaign_id, old_status, new_status, changed_by, reason)
       VALUES (?, ?, 'rejected', ?, ?)`,
      [campaignId, oldStatus, adminId, reason]
    );

    await logAdminAction(adminId, adminEmail, 'REJECT_CAMPAIGN', 'campaign', campaignId, { status: oldStatus }, { status: 'rejected' }, reason);

    res.json({ success: true, message: 'Campaign rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update campaign status (admin override)
app.put('/api/admin/campaigns/:id/status', async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const { status, adminId, adminEmail, reason } = req.body;

    const [campaign] = await query('SELECT * FROM campaigns WHERE id = ?', [campaignId]);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const oldStatus = campaign.status;

    await query('UPDATE campaigns SET status = ? WHERE id = ?', [status, campaignId]);

    await query(
      `INSERT INTO campaign_status_history (campaign_id, old_status, new_status, changed_by, reason)
       VALUES (?, ?, ?, ?, ?)`,
      [campaignId, oldStatus, status, adminId, reason]
    );

    await logAdminAction(adminId, adminEmail, 'CHANGE_CAMPAIGN_STATUS', 'campaign', campaignId, { status: oldStatus }, { status }, reason);

    res.json({ success: true, message: 'Campaign status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update campaign details (admin override - can change anything)
app.put('/api/admin/campaigns/:id/update', async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const { adminId, adminEmail, updates, reason } = req.body;

    const [campaign] = await query('SELECT * FROM campaigns WHERE id = ?', [campaignId]);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const updateFields = [];
    const params = [];
    const oldValues = {};
    const newValues = {};

    for (const [key, value] of Object.entries(updates)) {
      updateFields.push(`${key} = ?`);
      params.push(value);
      oldValues[key] = campaign[key];
      newValues[key] = value;
    }

    if (updateFields.length > 0) {
      params.push(campaignId);
      await query(`UPDATE campaigns SET ${updateFields.join(', ')} WHERE id = ?`, params);

      await logAdminAction(adminId, adminEmail, 'UPDATE_CAMPAIGN', 'campaign', campaignId, oldValues, newValues, reason);

      res.json({ success: true, message: 'Campaign updated' });
    } else {
      res.json({ success: false, message: 'No fields to update' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Flag/unflag campaign
app.post('/api/admin/campaigns/:id/flag', async (req, res) => {
  try {
    const campaignId = parseInt(req.params.id);
    const { adminId, adminEmail, flagged, reason } = req.body;

    await query('UPDATE campaigns SET flagged = ?, flag_reason = ? WHERE id = ?', [flagged ? 1 : 0, reason, campaignId]);

    await logAdminAction(
      adminId,
      adminEmail,
      flagged ? 'FLAG_CAMPAIGN' : 'UNFLAG_CAMPAIGN',
      'campaign',
      campaignId,
      {},
      { flagged, reason },
      reason
    );

    res.json({ success: true, message: flagged ? 'Campaign flagged' : 'Campaign unflagged' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== DONATION MANAGEMENT =====

// Get all donations for admin
app.get('/api/admin/donations', async (req, res) => {
  try {
    const { flagged, status, page = 1, limit = 50 } = req.query;
    const where = [];
    const params = [];

    if (flagged === 'true') {
      where.push('d.flagged = 1');
    }
    if (status) {
      where.push('d.status = ?');
      params.push(status);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const donations = await query(
      `SELECT d.*, c.title as campaign_title, u.email as donor_email
       FROM donations d
       LEFT JOIN campaigns c ON d.campaign_id = c.id
       LEFT JOIN users u ON d.user_id = u.id
       ${whereSql}
       ORDER BY d.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({ success: true, donations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Flag/verify donation
app.post('/api/admin/donations/:id/verify', async (req, res) => {
  try {
    const donationId = parseInt(req.params.id);
    const { adminId, adminEmail, verified } = req.body;

    await query(
      'UPDATE donations SET verified_by = ?, verified_at = NOW(), flagged = ? WHERE id = ?',
      [adminId, verified ? 0 : 1, donationId]
    );

    await logAdminAction(adminId, adminEmail, 'VERIFY_DONATION', 'donation', donationId, {}, { verified }, 'Donation verification');

    res.json({ success: true, message: 'Donation updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== AUDIT & HISTORY =====

// Get audit log with filters
app.get('/api/admin/audit-log', async (req, res) => {
  try {
    const { actionType, entityType, adminId, startDate, endDate, page = 1, limit = 100 } = req.query;
    const where = [];
    const params = [];

    if (actionType) {
      where.push('action_type = ?');
      params.push(actionType);
    }
    if (entityType) {
      where.push('entity_type = ?');
      params.push(entityType);
    }
    if (adminId) {
      where.push('admin_id = ?');
      params.push(adminId);
    }
    if (startDate) {
      where.push('created_at >= ?');
      params.push(startDate);
    }
    if (endDate) {
      where.push('created_at <= ?');
      params.push(endDate);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const logs = await query(
      `SELECT * FROM audit_log ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({ success: true, logs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get system activity log
app.get('/api/admin/activity-log', async (req, res) => {
  try {
    const { activityType, userId, success, page = 1, limit = 100 } = req.query;
    const where = [];
    const params = [];

    if (activityType) {
      where.push('activity_type = ?');
      params.push(activityType);
    }
    if (userId) {
      where.push('user_id = ?');
      params.push(userId);
    }
    if (success !== undefined) {
      where.push('success = ?');
      params.push(success === 'true' ? 1 : 0);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const logs = await query(
      `SELECT * FROM system_activity_log ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({ success: true, logs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get admin notifications
app.get('/api/admin/notifications', async (req, res) => {
  try {
    const { read, priority } = req.query;
    const where = [];
    const params = [];

    if (read !== undefined) {
      where.push('read_status = ?');
      params.push(read === 'true' ? 1 : 0);
    }
    if (priority) {
      where.push('priority = ?');
      params.push(priority);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const notifications = await query(
      `SELECT * FROM admin_notifications ${whereSql} ORDER BY created_at DESC LIMIT 100`,
      params
    );

    res.json({ success: true, notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark notification as read
app.post('/api/admin/notifications/:id/read', async (req, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    await query('UPDATE admin_notifications SET read_status = 1 WHERE id = ?', [notificationId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== ADMIN SETTINGS =====

// Get all settings
app.get('/api/admin/settings', async (req, res) => {
  try {
    const settings = await query('SELECT * FROM admin_settings ORDER BY setting_key');
    res.json({ success: true, settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update setting
app.put('/api/admin/settings/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value, adminId } = req.body;

    await query(
      'UPDATE admin_settings SET setting_value = ?, updated_by = ?, updated_at = NOW() WHERE setting_key = ?',
      [value, adminId, key]
    );

    res.json({ success: true, message: 'Setting updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== DASHBOARD STATS =====

// Enhanced admin dashboard stats
app.get('/api/admin/dashboard-stats', async (req, res) => {
  try {
    const [totalUsers] = await query('SELECT COUNT(*) as count FROM users');
    const [activeUsers] = await query('SELECT COUNT(*) as count FROM users WHERE status = "active"');
    const [pendingUsers] = await query('SELECT COUNT(*) as count FROM users WHERE status = "pending"');
    const [suspendedUsers] = await query('SELECT COUNT(*) as count FROM users WHERE status = "suspended"');

    const [totalCampaigns] = await query('SELECT COUNT(*) as count FROM campaigns');
    const [activeCampaigns] = await query('SELECT COUNT(*) as count FROM campaigns WHERE status = "active"');
    const [pendingCampaigns] = await query('SELECT COUNT(*) as count FROM campaigns WHERE status IN ("draft", "pending")');
    const [flaggedCampaigns] = await query('SELECT COUNT(*) as count FROM campaigns WHERE flagged = 1');

    const [totalDonations] = await query('SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM donations');
    const [todayDonations] = await query('SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM donations WHERE DATE(created_at) = CURDATE()');

    const [unreadNotifications] = await query('SELECT COUNT(*) as count FROM admin_notifications WHERE read_status = 0');
    const [recentAuditLogs] = await query('SELECT COUNT(*) as count FROM audit_log WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)');

    res.json({
      success: true,
      stats: {
        users: {
          total: totalUsers.count,
          active: activeUsers.count,
          pending: pendingUsers.count,
          suspended: suspendedUsers.count
        },
        campaigns: {
          total: totalCampaigns.count,
          active: activeCampaigns.count,
          pending: pendingCampaigns.count,
          flagged: flaggedCampaigns.count
        },
        donations: {
          total: totalDonations.count,
          totalAmount: totalDonations.total,
          today: todayDonations.count,
          todayAmount: todayDonations.total
        },
        notifications: {
          unread: unreadNotifications.count
        },
        activity: {
          last24Hours: recentAuditLogs.count
        }
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== ACTIVITY MONITOR =====

// Get all platform activities
app.get('/api/admin/activities', async (req, res) => {
  try {
    const { timeRange = 'today' } = req.query;
    const activities = [];

    // Calculate time filter
    let timeFilter = '';
    switch (timeRange) {
      case 'today':
        timeFilter = 'DATE(created_at) = CURDATE()';
        break;
      case 'week':
        timeFilter = 'created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
        break;
      case 'month':
        timeFilter = 'created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
        break;
      default:
        timeFilter = '1=1'; // all time
    }

    // 1. Recent Donations
    const donations = await query(`
      SELECT
        d.id,
        d.amount,
        d.donor_email,
        d.donor_name,
        d.created_at,
        c.title as campaign_title,
        c.id as campaign_id
      FROM donations d
      LEFT JOIN campaigns c ON d.campaign_id = c.id
      WHERE ${timeFilter}
      ORDER BY d.created_at DESC
      LIMIT 50
    `);

    donations.forEach(d => {
      activities.push({
        type: 'donation',
        action: 'New Donation',
        description: `${d.donor_name || d.donor_email} donated to "${d.campaign_title}"`,
        details: `Amount: ${d.amount} MAD`,
        user: d.donor_name || d.donor_email,
        timestamp: d.created_at,
        amount: d.amount,
        campaignId: d.campaign_id
      });
    });

    // 2. New Campaigns
    const campaigns = await query(`
      SELECT
        id,
        title,
        student_name,
        status,
        created_at,
        verification_status
      FROM campaigns
      WHERE ${timeFilter}
      ORDER BY created_at DESC
      LIMIT 50
    `);

    campaigns.forEach(c => {
      activities.push({
        type: 'campaign',
        action: c.status === 'pending' ? 'Campaign Submitted' : 'Campaign Created',
        description: `${c.student_name} created "${c.title}"`,
        details: `Status: ${c.status}`,
        user: c.student_name,
        timestamp: c.created_at,
        campaignId: c.id
      });
    });

    // 3. Campaign Approvals/Rejections (from audit log)
    const approvals = await query(`
      SELECT
        admin_email,
        action_type,
        entity_id,
        details,
        created_at,
        new_value
      FROM audit_log
      WHERE entity_type = 'campaign'
        AND action_type IN ('approve', 'reject')
        AND ${timeFilter.replace('created_at', 'audit_log.created_at')}
      ORDER BY created_at DESC
      LIMIT 50
    `);

    for (const a of approvals) {
      const [campaign] = await query('SELECT title FROM campaigns WHERE id = ?', [a.entity_id]);
      activities.push({
        type: a.action_type === 'approve' ? 'approval' : 'rejection',
        action: a.action_type === 'approve' ? 'Campaign Approved' : 'Campaign Rejected',
        description: `Admin ${a.action_type}d campaign "${campaign?.title || 'Unknown'}"`,
        details: a.details || '',
        user: a.admin_email,
        timestamp: a.created_at,
        campaignId: a.entity_id
      });
    }

    // 4. New User Registrations
    const users = await query(`
      SELECT
        id,
        email,
        role,
        created_at
      FROM users
      WHERE ${timeFilter}
      ORDER BY created_at DESC
      LIMIT 50
    `);

    users.forEach(u => {
      activities.push({
        type: 'user',
        action: 'New User Registration',
        description: `New ${u.role} registered`,
        details: u.email,
        user: u.email,
        timestamp: u.created_at
      });
    });

    // 5. Campaign Updates
    const updates = await query(`
      SELECT
        cu.id,
        cu.title,
        cu.content,
        cu.created_at,
        c.title as campaign_title,
        c.student_name,
        c.id as campaign_id
      FROM campaign_updates cu
      LEFT JOIN campaigns c ON cu.campaign_id = c.id
      WHERE ${timeFilter.replace('created_at', 'cu.created_at')}
      ORDER BY cu.created_at DESC
      LIMIT 30
    `);

    updates.forEach(u => {
      activities.push({
        type: 'update',
        action: 'Campaign Update Posted',
        description: `${u.student_name} posted update for "${u.campaign_title}"`,
        details: u.title || 'Update posted',
        user: u.student_name,
        timestamp: u.created_at,
        campaignId: u.campaign_id
      });
    });

    // 6. Comments
    const comments = await query(`
      SELECT
        cc.id,
        cc.message,
        cc.created_at,
        cc.commenter_name,
        c.title as campaign_title,
        c.id as campaign_id
      FROM campaign_comments cc
      LEFT JOIN campaigns c ON cc.campaign_id = c.id
      WHERE ${timeFilter.replace('created_at', 'cc.created_at')}
      ORDER BY cc.created_at DESC
      LIMIT 30
    `);

    comments.forEach(c => {
      activities.push({
        type: 'comment',
        action: 'New Comment',
        description: `${c.commenter_name} commented on "${c.campaign_title}"`,
        details: c.message.substring(0, 100) + (c.message.length > 100 ? '...' : ''),
        user: c.commenter_name,
        timestamp: c.created_at,
        campaignId: c.campaign_id
      });
    });

    // 7. Profile Verifications
    const verifications = await query(`
      SELECT
        admin_email,
        action_type,
        entity_id,
        details,
        created_at
      FROM audit_log
      WHERE entity_type = 'profile'
        AND action_type IN ('verify', 'reject_verification')
        AND ${timeFilter.replace('created_at', 'audit_log.created_at')}
      ORDER BY created_at DESC
      LIMIT 30
    `);

    verifications.forEach(v => {
      activities.push({
        type: 'verification',
        action: v.action_type === 'verify' ? 'Profile Verified' : 'Verification Rejected',
        description: `Admin ${v.action_type === 'verify' ? 'verified' : 'rejected'} profile verification`,
        details: v.details || '',
        user: v.admin_email,
        timestamp: v.created_at
      });
    });

    // Sort all activities by timestamp (most recent first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      activities: activities,
      count: activities.length,
      timeRange
    });
  } catch (err) {
    console.error('Error fetching activities:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activities',
      activities: []
    });
  }
});
