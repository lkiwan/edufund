/**
 * Email Automation Service
 *
 * This file handles automated monthly email reports to donors
 *
 * To use:
 * 1. Install required packages:
 *    npm install node-cron nodemailer
 *
 * 2. Configure your email service in .env:
 *    EMAIL_SERVICE=gmail
 *    EMAIL_USER=your-email@gmail.com
 *    EMAIL_PASSWORD=your-app-password
 *
 * 3. Uncomment the code below and restart server
 */

const cron = require('node-cron');
const nodemailer = require('nodemailer');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Database connection (reuse from server.js or create new)
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '132456',
  database: process.env.DB_NAME || 'edufund',
});

// Generate monthly report
async function generateMonthlyReport() {
  try {
    const [donors] = await pool.execute(`
      SELECT DISTINCT donor_email, donor_name
      FROM donations
      WHERE donor_email IS NOT NULL
        AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
    `);

    console.log(`Sending monthly reports to ${donors.length} donors...`);

    for (const donor of donors) {
      await sendMonthlyReport(donor.donor_email, donor.donor_name);
    }

    console.log('Monthly reports sent successfully!');
  } catch (err) {
    console.error('Error generating monthly reports:', err);
  }
}

// Send individual donor report
async function sendMonthlyReport(email, name) {
  try {
    // Get donor's donations this month
    const [donations] = await pool.execute(`
      SELECT d.amount, d.created_at, c.title as campaign_title, c.student_name
      FROM donations d
      LEFT JOIN campaigns c ON d.campaign_id = c.id
      WHERE d.donor_email = ?
        AND d.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
      ORDER BY d.created_at DESC
    `, [email]);

    const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
    const campaignsSupported = new Set(donations.map(d => d.campaign_title)).size;

    // Email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .stat-card { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .stat-label { color: #6b7280; font-size: 14px; }
          .stat-value { font-size: 24px; font-weight: bold; color: #10b981; }
          .donation-list { margin-top: 20px; }
          .donation-item { background: white; padding: 12px; margin: 8px 0; border-left: 4px solid #10b981; border-radius: 4px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 Your Monthly Impact Report</h1>
            <p>Thank you for supporting education!</p>
          </div>

          <div class="content">
            <p>Dear ${name || 'Valued Donor'},</p>

            <p>This is your monthly summary of the amazing impact you've made through EduFund.</p>

            <div class="stat-card">
              <div class="stat-label">Total Donated This Month</div>
              <div class="stat-value">${totalDonated.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })}</div>
              <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">
                ≈ $${(totalDonated * 0.10).toFixed(2)} USD / €${(totalDonated * 0.09).toFixed(2)} EUR
              </p>
            </div>

            <div class="stat-card">
              <div class="stat-label">Campaigns Supported</div>
              <div class="stat-value">${campaignsSupported}</div>
            </div>

            <div class="donation-list">
              <h3>Your Donations This Month</h3>
              ${donations.map(d => `
                <div class="donation-item">
                  <strong>${d.campaign_title}</strong><br>
                  <span style="color: #6b7280; font-size: 14px;">
                    ${d.student_name} • ${d.amount.toLocaleString('fr-MA', { style: 'currency', currency: 'MAD' })} •
                    ${new Date(d.created_at).toLocaleDateString()}
                  </span>
                </div>
              `).join('')}
            </div>

            <p style="margin-top: 30px;">
              <strong>Your generosity is changing lives!</strong> Thanks to donors like you, students can pursue their dreams and build a better future.
            </p>

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://edufund.com/discover" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Discover More Campaigns
              </a>
            </div>

            <div class="footer">
              <p>This is an automated monthly report from EduFund</p>
              <p>© 2025 EduFund - Supporting Student Dreams</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: `"EduFund" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: '📊 Your Monthly Impact Report - EduFund',
      html: htmlContent,
    });

    console.log(`Monthly report sent to ${email}`);
  } catch (err) {
    console.error(`Error sending report to ${email}:`, err);
  }
}

// Schedule monthly reports (runs on 1st day of each month at 9 AM)
cron.schedule('0 9 1 * *', () => {
  console.log('Running monthly email automation...');
  generateMonthlyReport();
}, {
  timezone: 'Africa/Casablanca'
});

// For testing: Run immediately
// generateMonthlyReport();

console.log('Email automation service started!');
console.log('Monthly reports will be sent on the 1st of each month at 9:00 AM');

module.exports = { generateMonthlyReport, sendMonthlyReport };
