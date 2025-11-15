// ====================================================================
// ANALYTICS & TRACKING ENDPOINTS
// ====================================================================

// Track Campaign View
async function trackCampaignView(req, res, pool) {
  const { campaignId } = req.params;
  const { userId, sessionId } = req.body;

  try {
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const referrer = req.headers['referer'] || req.headers['referrer'];

    // Insert view record
    await pool.execute(
      `INSERT INTO campaign_views (campaign_id, user_id, ip_address, user_agent, referrer, session_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [campaignId, userId || null, ipAddress, userAgent, referrer, sessionId]
    );

    // Also log in user_activity if user is logged in
    if (userId) {
      await pool.execute(
        `INSERT INTO user_activity (user_id, activity_type, campaign_id, session_id)
         VALUES (?, 'view', ?, ?)`,
        [userId, campaignId, sessionId]
      );
    }

    // Update campaign metrics views count
    await pool.execute(
      `UPDATE campaign_metrics SET views = views + 1 WHERE campaign_id = ?`,
      [campaignId]
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Error tracking view:', err);
    res.status(500).json({ error: 'Failed to track view' });
  }
}

// Get Trending Campaigns
async function getTrendingCampaigns(req, res, pool) {
  const { period = 'day', limit = 10 } = req.query;

  try {
    // Calculate trending score based on recent activity
    // Score = (recent_views * 1) + (recent_donations * 10) + (recent_shares * 5) + (recent_follows * 3)

    let timeFilter = '';
    if (period === 'hour') {
      timeFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)';
    } else if (period === 'day') {
      timeFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)';
    } else if (period === 'week') {
      timeFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
    } else if (period === 'month') {
      timeFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    }

    const trendingQuery = `
      SELECT
        c.id,
        c.title,
        c.description,
        c.cover_image as image_url,
        c.goal_amount as target_amount,
        c.current_amount,
        c.end_date as deadline,
        c.category,
        c.city as location,
        u.full_name as organizer_name,
        u.email as organizer_email,
        (
          COALESCE((SELECT COUNT(*) FROM campaign_views cv WHERE cv.campaign_id = c.id ${timeFilter.replace('created_at', 'cv.viewed_at')}), 0) * 1 +
          COALESCE((SELECT COUNT(*) FROM donations d WHERE d.campaign_id = c.id ${timeFilter.replace('created_at', 'd.created_at')}), 0) * 10 +
          COALESCE((SELECT COUNT(*) FROM social_shares ss WHERE ss.campaign_id = c.id ${timeFilter.replace('created_at', 'ss.created_at')}), 0) * 5 +
          COALESCE((SELECT COUNT(*) FROM campaign_followers cf WHERE cf.campaign_id = c.id ${timeFilter.replace('created_at', 'cf.created_at')}), 0) * 3
        ) as trending_score,
        COALESCE((SELECT COUNT(*) FROM donations WHERE campaign_id = c.id), 0) as total_donors,
        COALESCE((SELECT COUNT(*) FROM campaign_views cv WHERE cv.campaign_id = c.id ${timeFilter.replace('created_at', 'cv.viewed_at')}), 0) as recent_views
      FROM campaigns c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.status IN ('active', 'published')
        AND c.end_date >= NOW()
      HAVING trending_score > 0
      ORDER BY trending_score DESC, c.created_at DESC
      LIMIT ?
    `;

    const [campaigns] = await pool.execute(trendingQuery, [parseInt(limit)]);

    res.json({
      success: true,
      campaigns,
      period
    });
  } catch (err) {
    console.error('Error fetching trending campaigns:', err);
    res.status(500).json({ error: 'Failed to fetch trending campaigns' });
  }
}

// Get Campaign Analytics (for campaign owner)
async function getCampaignAnalytics(req, res, pool) {
  const { campaignId } = req.params;
  const { timeRange = '30' } = req.query; // days

  try {
    const days = parseInt(timeRange);

    // Get view statistics
    const [viewStats] = await pool.execute(`
      SELECT
        DATE(viewed_at) as date,
        COUNT(*) as views,
        COUNT(DISTINCT COALESCE(user_id, ip_address)) as unique_visitors
      FROM campaign_views
      WHERE campaign_id = ?
        AND viewed_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(viewed_at)
      ORDER BY date ASC
    `, [campaignId, days]);

    // Get donation statistics
    const [donationStats] = await pool.execute(`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as donations_count,
        SUM(amount) as donations_amount,
        AVG(amount) as average_donation
      FROM donations
      WHERE campaign_id = ?
        AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, [campaignId, days]);

    // Get share statistics
    const [shareStats] = await pool.execute(`
      SELECT
        platform,
        COUNT(*) as count
      FROM social_shares
      WHERE campaign_id = ?
        AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY platform
    `, [campaignId, days]);

    // Get overall metrics
    const [overallMetrics] = await pool.execute(`
      SELECT
        (SELECT COUNT(*) FROM campaign_views WHERE campaign_id = ?) as total_views,
        (SELECT COUNT(DISTINCT COALESCE(user_id, ip_address)) FROM campaign_views WHERE campaign_id = ?) as unique_visitors,
        (SELECT COUNT(*) FROM donations WHERE campaign_id = ?) as total_donations,
        (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE campaign_id = ?) as total_raised,
        (SELECT COUNT(*) FROM social_shares WHERE campaign_id = ?) as total_shares,
        (SELECT COUNT(*) FROM campaign_followers WHERE campaign_id = ?) as total_followers,
        (SELECT COUNT(*) FROM campaign_comments WHERE campaign_id = ?) as total_comments
    `, [campaignId, campaignId, campaignId, campaignId, campaignId, campaignId, campaignId]);

    // Calculate conversion rate
    const conversionRate = overallMetrics[0].unique_visitors > 0
      ? ((overallMetrics[0].total_donations / overallMetrics[0].unique_visitors) * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      analytics: {
        viewStats,
        donationStats,
        shareStats,
        overallMetrics: {
          ...overallMetrics[0],
          conversion_rate: parseFloat(conversionRate)
        }
      }
    });
  } catch (err) {
    console.error('Error fetching campaign analytics:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
}

// Get User View History
async function getUserViewHistory(req, res, pool) {
  const { userId } = req.params;
  const { limit = 20 } = req.query;

  try {
    const [history] = await pool.execute(`
      SELECT DISTINCT
        c.id,
        c.title,
        c.description,
        c.image_url,
        c.target_amount,
        c.current_amount,
        c.category,
        c.location,
        MAX(ua.created_at) as last_viewed,
        COUNT(ua.id) as view_count
      FROM user_activity ua
      JOIN campaigns c ON ua.campaign_id = c.id
      WHERE ua.user_id = ?
        AND ua.activity_type = 'view'
        AND c.status IN ('active', 'published')
      GROUP BY c.id
      ORDER BY last_viewed DESC
      LIMIT ?
    `, [userId, parseInt(limit)]);

    res.json({
      success: true,
      history
    });
  } catch (err) {
    console.error('Error fetching view history:', err);
    res.status(500).json({ error: 'Failed to fetch view history' });
  }
}

// Get Platform-wide Statistics (for admin)
async function getPlatformStatistics(req, res, pool) {
  const { timeRange = '30' } = req.query; // days

  try {
    const days = parseInt(timeRange);

    // Get daily statistics
    const [dailyStats] = await pool.execute(`
      SELECT
        DATE(created_at) as date,
        (SELECT COUNT(*) FROM campaigns WHERE DATE(created_at) = DATE(c.created_at)) as new_campaigns,
        (SELECT COUNT(*) FROM users WHERE DATE(created_at) = DATE(c.created_at)) as new_users,
        (SELECT COUNT(*) FROM donations WHERE DATE(created_at) = DATE(c.created_at)) as donations_count,
        (SELECT COALESCE(SUM(amount), 0) FROM donations WHERE DATE(created_at) = DATE(c.created_at)) as donations_amount
      FROM campaigns c
      WHERE c.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY DATE(c.created_at)
      ORDER BY date ASC
    `, [days]);

    // Get overall platform metrics
    const [platformMetrics] = await pool.execute(`
      SELECT
        (SELECT COUNT(*) FROM campaigns) as total_campaigns,
        (SELECT COUNT(*) FROM campaigns WHERE status IN ('active', 'published')) as active_campaigns,
        (SELECT COUNT(*) FROM campaigns WHERE status = 'completed') as completed_campaigns,
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
        (SELECT COUNT(*) FROM users WHERE role = 'donor') as total_donors,
        (SELECT COALESCE(SUM(current_amount), 0) FROM campaigns) as total_raised,
        (SELECT COUNT(*) FROM donations) as total_donations,
        (SELECT COUNT(*) FROM campaign_views) as total_views
    `);

    // Calculate success rate
    const successRate = platformMetrics[0].total_campaigns > 0
      ? ((platformMetrics[0].completed_campaigns / platformMetrics[0].total_campaigns) * 100).toFixed(2)
      : 0;

    // Get top performing campaigns
    const [topCampaigns] = await pool.execute(`
      SELECT
        c.id,
        c.title,
        c.current_amount,
        c.goal_amount as target_amount,
        (c.current_amount / c.goal_amount * 100) as funding_percentage,
        (SELECT COUNT(*) FROM donations WHERE campaign_id = c.id) as donors_count
      FROM campaigns c
      WHERE c.status IN ('active', 'published', 'completed')
      ORDER BY c.current_amount DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      statistics: {
        dailyStats,
        platformMetrics: {
          ...platformMetrics[0],
          success_rate: parseFloat(successRate)
        },
        topCampaigns
      }
    });
  } catch (err) {
    console.error('Error fetching platform statistics:', err);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
}

// Get Real-time Activity Feed
async function getActivityFeed(req, res, pool) {
  const { limit = 50 } = req.query;

  try {
    // Get recent donations
    const [recentDonations] = await pool.execute(`
      SELECT
        'donation' as type,
        d.id,
        d.donor_name,
        d.amount,
        d.message,
        d.created_at,
        c.id as campaign_id,
        c.title as campaign_title
      FROM donations d
      JOIN campaigns c ON d.campaign_id = c.id
      WHERE d.is_anonymous = 0
      ORDER BY d.created_at DESC
      LIMIT ?
    `, [parseInt(limit) / 3]);

    // Get recent campaigns
    const [recentCampaigns] = await pool.execute(`
      SELECT
        'campaign' as type,
        c.id,
        c.title,
        c.created_at,
        u.full_name as organizer_name
      FROM campaigns c
      JOIN users u ON c.user_id = u.id
      WHERE c.status IN ('active', 'published')
      ORDER BY c.created_at DESC
      LIMIT ?
    `, [parseInt(limit) / 3]);

    // Get recent milestones
    const [recentMilestones] = await pool.execute(`
      SELECT
        'milestone' as type,
        c.id as campaign_id,
        c.title as campaign_title,
        c.current_amount,
        c.target_amount,
        c.updated_at as created_at,
        (c.current_amount / c.target_amount * 100) as percentage
      FROM campaigns c
      WHERE c.status IN ('active', 'published', 'completed')
        AND (
          (c.current_amount / c.target_amount >= 0.25 AND c.current_amount / c.target_amount < 0.26) OR
          (c.current_amount / c.target_amount >= 0.50 AND c.current_amount / c.target_amount < 0.51) OR
          (c.current_amount / c.target_amount >= 0.75 AND c.current_amount / c.target_amount < 0.76) OR
          (c.current_amount / c.target_amount >= 1.00)
        )
      ORDER BY c.updated_at DESC
      LIMIT ?
    `, [parseInt(limit) / 3]);

    // Combine and sort all activities
    const allActivities = [
      ...recentDonations,
      ...recentCampaigns,
      ...recentMilestones
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, parseInt(limit));

    res.json({
      success: true,
      activities: allActivities
    });
  } catch (err) {
    console.error('Error fetching activity feed:', err);
    res.status(500).json({ error: 'Failed to fetch activity feed' });
  }
}

// Export functions
module.exports = {
  trackCampaignView,
  getTrendingCampaigns,
  getCampaignAnalytics,
  getUserViewHistory,
  getPlatformStatistics,
  getActivityFeed
};
