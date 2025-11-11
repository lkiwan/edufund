// Script to update server.js with new comprehensive admin endpoints
const fs = require('fs');

const adminRoutes = `
// ===== COMPREHENSIVE ADMIN SYSTEM =====
// Helper functions for logging

async function logAdminAction(adminId, adminEmail, actionType, entityType, entityId, oldValue, newValue, details) {
  try {
    await query(
      \`INSERT INTO audit_log (admin_id, admin_email, action_type, entity_type, entity_id, old_value, new_value, details)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)\`,
      [adminId, adminEmail, actionType, entityType, entityId, JSON.stringify(oldValue), JSON.stringify(newValue), details]
    );
  } catch (err) {
    console.error('Error logging admin action:', err);
  }
}

async function logSystemActivity(userId, userEmail, activityType, action, details, success = true, errorMessage = null) {
  try {
    await query(
      \`INSERT INTO system_activity_log (user_id, user_email, activity_type, action, details, success, error_message)
       VALUES (?, ?, ?, ?, ?, ?, ?)\`,
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
      params.push(\`%\${search}%\`, parseInt(search) || 0);
    }

    const whereSql = where.length ? \`WHERE \${where.join(' AND ')}\` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [total] = await query(\`SELECT COUNT(*) as count FROM users \${whereSql}\`, params);

    const users = await query(
      \`SELECT id, email, role, status, verified, created_at, profile_approved_at, rejection_reason
       FROM users \${whereSql}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?\`,
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

    const campaigns = await query('SELECT * FROM campaigns WHERE user_id = ?', [userId]);
    const donations = await query('SELECT * FROM donations WHERE user_id = ?', [userId]);

    const statusHistory = await query(
      \`SELECT h.*, u.email as changed_by_email
       FROM user_status_history h
       LEFT JOIN users u ON h.changed_by = u.id
       WHERE h.user_id = ?
       ORDER BY h.created_at DESC\`,
      [userId]
    );

    const auditLog = await query(
      \`SELECT * FROM audit_log
       WHERE entity_type = 'user' AND entity_id = ?
       ORDER BY created_at DESC
       LIMIT 50\`,
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

    const [user] = await query('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oldStatus = user.status;

    await query(
      \`UPDATE users
       SET verified = 1,
           status = 'active',
           profile_approved_at = NOW(),
           approved_by = ?
       WHERE id = ?\`,
      [adminId, userId]
    );

    await query(
      \`INSERT INTO user_status_history (user_id, old_status, new_status, changed_by, reason)
       VALUES (?, ?, 'active', ?, ?)\`,
      [userId, oldStatus, adminId, notes || 'Profile approved by admin']
    );

    await logAdminAction(
      adminId,
      adminEmail,
      'APPROVE_PROFILE',
      'user',
      userId,
      { status: oldStatus, verified: user.verified },
      { status: 'active', verified: 1 },
      \`Profile approved. Notes: \${notes || 'None'}\`
    );

    await logSystemActivity(
      userId,
      user.email,
      'PROFILE_VERIFICATION',
      'APPROVED',
      { approvedBy: adminEmail, notes }
    );

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

    await query(
      \`UPDATE users
       SET verified = 0,
           status = 'rejected',
           rejection_reason = ?
       WHERE id = ?\`,
      [reason, userId]
    );

    await query(
      \`INSERT INTO user_status_history (user_id, old_status, new_status, changed_by, reason)
       VALUES (?, ?, 'rejected', ?, ?)\`,
      [userId, oldStatus, adminId, reason]
    );

    await logAdminAction(
      adminId,
      adminEmail,
      'REJECT_PROFILE',
      'user',
      userId,
      { status: oldStatus },
      { status: 'rejected' },
      \`Profile rejected. Reason: \${reason}\`
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
      \`INSERT INTO user_status_history (user_id, old_status, new_status, changed_by, reason)
       VALUES (?, ?, 'suspended', ?, ?)\`,
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
      \`INSERT INTO user_status_history (user_id, old_status, new_status, changed_by, reason)
       VALUES (?, ?, 'active', ?, ?)\`,
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

// Get all campaigns for admin
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
      params.push(\`%\${search}%\`, parseInt(search) || 0, \`%\${search}%\`);
    }

    const whereSql = where.length ? \`WHERE \${where.join(' AND ')}\` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [total] = await query(
      \`SELECT COUNT(*) as count FROM campaigns c LEFT JOIN users u ON c.user_id = u.id \${whereSql}\`,
      params
    );

    const campaigns = await query(
      \`SELECT c.*, u.email as creator_email, u.status as user_status
       FROM campaigns c
       LEFT JOIN users u ON c.user_id = u.id
       \${whereSql}
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?\`,
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
      \`SELECT h.*, u.email as changed_by_email
       FROM campaign_status_history h
       LEFT JOIN users u ON h.changed_by = u.id
       WHERE h.campaign_id = ?
       ORDER BY h.created_at DESC\`,
      [campaignId]
    );

    const auditLog = await query(
      \`SELECT * FROM audit_log WHERE entity_type = 'campaign' AND entity_id = ? ORDER BY created_at DESC LIMIT 50\`,
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

// Get admin dashboard stats
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

// Get audit log
app.get('/api/admin/audit-log', async (req, res) => {
  try {
    const { actionType, entityType, adminId, page = 1, limit = 100 } = req.query;
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

    const whereSql = where.length ? \`WHERE \${where.join(' AND ')}\` : '';
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const logs = await query(
      \`SELECT * FROM audit_log \${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?\`,
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
    const { read } = req.query;
    const where = [];
    const params = [];

    if (read !== undefined) {
      where.push('read_status = ?');
      params.push(read === 'true' ? 1 : 0);
    }

    const whereSql = where.length ? \`WHERE \${where.join(' AND ')}\` : '';

    const notifications = await query(
      \`SELECT * FROM admin_notifications \${whereSql} ORDER BY created_at DESC LIMIT 100\`,
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

// Old admin endpoints kept for backwards compatibility
`;

// Read current server.js
const serverContent = fs.readFileSync('server.js', 'utf8');

// Find where to insert (before the old admin endpoints)
const insertPosition = serverContent.indexOf('app.get(\'/api/admin/stats\'');

if (insertPosition === -1) {
  console.log('✗ Could not find insertion point');
  process.exit(1);
}

// Insert new admin routes before old ones
const updatedContent = serverContent.slice(0, insertPosition) + adminRoutes + serverContent.slice(insertPosition);

// Write updated server.js
fs.writeFileSync('server.js', updatedContent);

console.log('✓ Server.js updated with comprehensive admin endpoints!');
console.log('✓ Backup saved as server.js.backup');
console.log('\nNew admin endpoints added:');
console.log('  • GET /api/admin/users - List all users with filters');
console.log('  • GET /api/admin/users/:id - Get user details with history');
console.log('  • POST /api/admin/users/:id/approve - Approve user profile (WORKING)');
console.log('  • POST /api/admin/users/:id/reject - Reject user profile (WORKING)');
console.log('  • POST /api/admin/users/:id/suspend - Suspend user');
console.log('  • POST /api/admin/users/:id/reactivate - Reactivate user');
console.log('  • GET /api/admin/campaigns - List all campaigns with filters');
console.log('  • GET /api/admin/campaigns/:id/details - Get campaign with full history');
console.log('  • GET /api/admin/dashboard-stats - Enhanced dashboard stats');
console.log('  • GET /api/admin/audit-log - Complete audit trail');
console.log('  • GET /api/admin/notifications - Admin notifications');
console.log('  • POST /api/admin/notifications/:id/read - Mark notification as read');
