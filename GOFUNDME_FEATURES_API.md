
# GoFundMe Features - API Documentation

This document describes all the new GoFundMe-like features that have been added to the platform.

## Table of Contents
1. [Team Members / Co-Organizers](#team-members--co-organizers)
2. [Beneficiaries](#beneficiaries)
3. [Bank Accounts](#bank-accounts)
4. [Withdrawals](#withdrawals)
5. [Recurring Donations](#recurring-donations)
6. [Donation Refunds](#donation-refunds)
7. [Thank You Messages](#thank-you-messages)
8. [Offline Donations](#offline-donations)
9. [Receipts](#receipts)
10. [Email Notifications](#email-notifications)
11. [Campaign Verification](#campaign-verification)
12. [Trending & Related Campaigns](#trending--related-campaigns)
13. [Campaign Embed Widget](#campaign-embed-widget)
14. [Enhanced Donation System](#enhanced-donation-system)

---

## Team Members / Co-Organizers

Allow campaign organizers to invite team members to help manage campaigns.

### Invite Team Member
```
POST /api/campaigns/:id/team
```

**Request Body:**
```json
{
  "email": "member@example.com",
  "name": "John Doe",
  "role": "member",
  "permissions": "view,edit",
  "invitedBy": 1
}
```

**Response:**
```json
{
  "success": true,
  "memberId": 1
}
```

### List Team Members
```
GET /api/campaigns/:id/team
```

**Response:**
```json
{
  "success": true,
  "members": [
    {
      "id": 1,
      "email": "member@example.com",
      "name": "John Doe",
      "role": "member",
      "permissions": "view,edit",
      "status": "pending",
      "invited_at": "2024-01-01T00:00:00.000Z",
      "accepted_at": null
    }
  ]
}
```

### Accept Team Invitation
```
POST /api/campaigns/:id/team/:memberId/accept
```

**Request Body:**
```json
{
  "userId": 5
}
```

### Remove Team Member
```
DELETE /api/campaigns/:id/team/:memberId
```

---

## Beneficiaries

Designate who will receive the funds from a campaign.

### Add Beneficiary
```
POST /api/campaigns/:id/beneficiary
```

**Request Body:**
```json
{
  "name": "Jane Smith",
  "relationship": "Mother",
  "email": "jane@example.com",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "beneficiaryId": 1
}
```

### Get Beneficiary
```
GET /api/campaigns/:id/beneficiary
```

**Response:**
```json
{
  "success": true,
  "beneficiary": {
    "id": 1,
    "campaign_id": 1,
    "name": "Jane Smith",
    "relationship": "Mother",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "verified": 0,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Bank Accounts

Manage bank accounts for receiving withdrawn funds.

### Add Bank Account
```
POST /api/users/:userId/bank-accounts
```

**Request Body:**
```json
{
  "accountHolderName": "John Doe",
  "accountNumber": "1234567890",
  "bankName": "Bank of America",
  "routingNumber": "021000021",
  "accountType": "checking",
  "isDefault": true
}
```

**Response:**
```json
{
  "success": true,
  "accountId": 1
}
```

### List Bank Accounts
```
GET /api/users/:userId/bank-accounts
```

**Response:**
```json
{
  "success": true,
  "accounts": [
    {
      "id": 1,
      "account_holder_name": "John Doe",
      "account_number": "****7890",
      "bank_name": "Bank of America",
      "account_type": "checking",
      "is_verified": 0,
      "is_default": 1,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Delete Bank Account
```
DELETE /api/users/:userId/bank-accounts/:accountId
```

---

## Withdrawals

Request and manage fund withdrawals from campaigns.

### Request Withdrawal
```
POST /api/campaigns/:id/withdrawals
```

**Request Body:**
```json
{
  "userId": 1,
  "amount": 500.00,
  "bankAccountId": 1,
  "notes": "First withdrawal"
}
```

**Response:**
```json
{
  "success": true,
  "withdrawalId": 1
}
```

### List Withdrawals
```
GET /api/campaigns/:id/withdrawals
```

**Response:**
```json
{
  "success": true,
  "withdrawals": [
    {
      "id": 1,
      "campaign_id": 1,
      "user_id": 1,
      "amount": 500.00,
      "bank_account_id": 1,
      "bank_name": "Bank of America",
      "account_number": "****7890",
      "status": "pending",
      "requested_at": "2024-01-01T00:00:00.000Z",
      "processed_at": null,
      "notes": "First withdrawal"
    }
  ]
}
```

### Process Withdrawal (Admin)
```
POST /api/withdrawals/:id/process
```

**Request Body:**
```json
{
  "status": "completed"
}
```

---

## Recurring Donations

Set up recurring donations to campaigns.

### Create Recurring Donation
```
POST /api/recurring-donations
```

**Request Body:**
```json
{
  "campaignId": 1,
  "userId": 5,
  "donorName": "John Supporter",
  "donorEmail": "john@example.com",
  "amount": 50.00,
  "frequency": "monthly"
}
```

**Frequencies:** `weekly`, `monthly`, `yearly`

**Response:**
```json
{
  "success": true,
  "recurringId": 1
}
```

### Cancel Recurring Donation
```
POST /api/recurring-donations/:id/cancel
```

### List User's Recurring Donations
```
GET /api/users/:userId/recurring-donations
```

**Response:**
```json
{
  "success": true,
  "recurring": [
    {
      "id": 1,
      "campaign_id": 1,
      "campaign_title": "Help John's Education",
      "amount": 50.00,
      "frequency": "monthly",
      "status": "active",
      "next_charge_date": "2024-02-01T00:00:00.000Z",
      "started_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Donation Refunds

Request and process refunds for donations.

### Request Refund
```
POST /api/donations/:id/refund
```

**Request Body:**
```json
{
  "reason": "Accidental duplicate donation",
  "requestedBy": 5
}
```

**Response:**
```json
{
  "success": true,
  "refundId": 1
}
```

### Process Refund (Admin)
```
POST /api/refunds/:id/process
```

**Request Body:**
```json
{
  "status": "completed"
}
```

---

## Thank You Messages

Send personalized thank you messages to donors.

### Send Thank You Message
```
POST /api/donations/:id/thank-you
```

**Request Body:**
```json
{
  "message": "Thank you so much for your generous support!",
  "sentBy": 1
}
```

**Response:**
```json
{
  "success": true,
  "messageId": 1
}
```

### Get Thank You Messages
```
GET /api/donations/:id/thank-you
```

**Response:**
```json
{
  "success": true,
  "messages": [
    {
      "id": 1,
      "donation_id": 1,
      "campaign_id": 1,
      "message": "Thank you so much for your generous support!",
      "sent_by": 1,
      "sent_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Offline Donations

Record donations received outside the platform.

### Record Offline Donation
```
POST /api/campaigns/:id/offline-donations
```

**Request Body:**
```json
{
  "donorName": "Cash Donor",
  "amount": 100.00,
  "paymentMethod": "cash",
  "notes": "Donated at fundraising event",
  "recordedBy": 1
}
```

**Response:**
```json
{
  "success": true,
  "offlineDonationId": 1
}
```

### List Offline Donations
```
GET /api/campaigns/:id/offline-donations
```

**Response:**
```json
{
  "success": true,
  "offlineDonations": [
    {
      "id": 1,
      "campaign_id": 1,
      "donor_name": "Cash Donor",
      "amount": 100.00,
      "payment_method": "cash",
      "notes": "Donated at fundraising event",
      "recorded_by": 1,
      "recorded_by_email": "organizer@example.com",
      "recorded_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Receipts

Generate and retrieve donation receipts.

### Generate Receipt
```
POST /api/donations/:id/receipt
```

**Request Body:**
```json
{
  "taxDeductible": false
}
```

**Response:**
```json
{
  "success": true,
  "receipt": {
    "id": 1,
    "donation_id": 1,
    "receipt_number": "RCP-1704067200000-1",
    "issued_at": "2024-01-01T00:00:00.000Z",
    "tax_deductible": 0
  }
}
```

### Get Receipt
```
GET /api/donations/:id/receipt
```

**Response:**
```json
{
  "success": true,
  "receipt": {
    "id": 1,
    "donation_id": 1,
    "receipt_number": "RCP-1704067200000-1",
    "amount": 100.00,
    "donor_name": "John Doe",
    "donor_email": "john@example.com",
    "donation_date": "2024-01-01T00:00:00.000Z",
    "campaign_title": "Help John's Education",
    "issued_at": "2024-01-01T00:00:00.000Z",
    "tax_deductible": 0
  }
}
```

---

## Email Notifications

Queue and manage email notifications.

### Queue Email Notification
```
POST /api/notifications/email
```

**Request Body:**
```json
{
  "userId": 1,
  "email": "user@example.com",
  "subject": "New Donation Received",
  "body": "You received a new donation of $100",
  "type": "donation"
}
```

**Response:**
```json
{
  "success": true,
  "notificationId": 1
}
```

### Get Pending Notifications
```
GET /api/notifications/email/pending
```

**Response:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": 1,
      "user_id": 1,
      "email": "user@example.com",
      "subject": "New Donation Received",
      "body": "You received a new donation of $100",
      "type": "donation",
      "status": "pending",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Mark Notification as Sent
```
POST /api/notifications/email/:id/sent
```

---

## Campaign Verification

Submit and review campaign verification requests.

### Submit Verification Request
```
POST /api/campaigns/:id/verification
```

**Request Body:**
```json
{
  "userId": 1,
  "documentType": "id",
  "documentUrl": "https://example.com/documents/id.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "verificationId": 1
}
```

### Review Verification (Admin)
```
POST /api/verification/:id/review
```

**Request Body:**
```json
{
  "status": "approved",
  "reviewedBy": 2,
  "notes": "All documents verified"
}
```

### Get Pending Verifications (Admin)
```
GET /api/verification/pending
```

**Response:**
```json
{
  "success": true,
  "verifications": [
    {
      "id": 1,
      "campaign_id": 1,
      "campaign_title": "Help John's Education",
      "user_id": 1,
      "user_email": "organizer@example.com",
      "document_type": "id",
      "document_url": "https://example.com/documents/id.pdf",
      "status": "pending",
      "submitted_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Trending & Related Campaigns

Discover popular and similar campaigns.

### Get Trending Campaigns
```
GET /api/campaigns/trending?limit=10
```

**Response:**
```json
{
  "success": true,
  "campaigns": [
    {
      "id": 1,
      "title": "Help John's Education",
      "description": "Supporting John's college education",
      "goalAmount": 10000,
      "raisedAmount": 7500,
      "category": "Education",
      "image": "https://example.com/image.jpg",
      "trendingScore": 125.5
    }
  ]
}
```

**Trending Score Algorithm:**
- `views * 0.1 + shares * 2 + recent_donations_count * 5`

### Get Related Campaigns
```
GET /api/campaigns/:id/related?limit=6
```

**Response:**
```json
{
  "success": true,
  "campaigns": [
    {
      "id": 2,
      "title": "Mary's Medical Fund",
      "description": "Help with medical expenses",
      "goalAmount": 5000,
      "raisedAmount": 2500,
      "category": "Medical",
      "image": "https://example.com/image2.jpg"
    }
  ]
}
```

---

## Campaign Embed Widget

Generate embeddable widgets for campaigns.

### Get Embed Code
```
GET /api/campaigns/:id/embed?width=100%&height=600px&theme=light
```

**Query Parameters:**
- `width` - Widget width (default: 100%)
- `height` - Widget height (default: 600px)
- `theme` - `light` or `dark` (default: light)

**Response:**
```json
{
  "success": true,
  "embedCode": "<iframe src=\"...\" width=\"100%\" height=\"600px\" ...></iframe>",
  "scriptCode": "<div id=\"edufund-campaign-1\"></div><script>...</script>",
  "iframeUrl": "https://yoursite.com/embed/campaign/1?theme=light",
  "previewUrl": "https://yoursite.com/campaign-details?id=1"
}
```

### View Embed Widget
```
GET /embed/campaign/:id?theme=light
```

This endpoint serves a standalone HTML page with the campaign widget that can be embedded in iframes.

---

## Enhanced Donation System

The donation endpoint now supports platform tips and automatic receipts.

### Create Donation with Tip
```
POST /api/donations
```

**Request Body:**
```json
{
  "campaignId": 1,
  "amount": 100.00,
  "tipAmount": 15.00,
  "donorName": "John Doe",
  "donorEmail": "john@example.com",
  "message": "Hope this helps!",
  "isAnonymous": false,
  "paymentMethod": "card"
}
```

**Response:**
```json
{
  "success": true,
  "donationId": 1,
  "receiptNumber": "RCP-1704067200000-1"
}
```

**Notes:**
- `tipAmount` is optional - represents platform fee/tip
- Receipt is automatically generated
- Email notification is automatically queued for campaign owner
- Only the `amount` (not tip) is added to campaign total

---

## Database Schema Extensions

### New Tables Created:
- `campaign_team_members` - Team member invitations and roles
- `campaign_beneficiaries` - Beneficiary information
- `bank_accounts` - User bank account details
- `withdrawals` - Withdrawal requests and processing
- `recurring_donations` - Recurring donation schedules
- `donation_refunds` - Refund requests and processing
- `thank_you_messages` - Thank you messages to donors
- `offline_donations` - Manually recorded donations
- `donation_receipts` - Generated receipts
- `email_notifications` - Email queue
- `verification_requests` - Campaign verification requests

### Campaign Table Extensions:
- `beneficiary_name` - Name of beneficiary
- `beneficiary_relationship` - Relationship to organizer
- `verification_status` - Verification status
- `trust_score` - Trust score (0-100)
- `tags` - Campaign tags (comma-separated)
- `allow_anonymous` - Allow anonymous donations
- `allow_comments` - Allow comments
- `withdrawn_amount` - Total withdrawn amount

### Donation Table Extensions:
- `tip_amount` - Platform tip/fee amount
- `payment_method` - Payment method used
- `receipt_sent` - Receipt sent flag

---

## Testing the Features

To test all features, restart your backend server:

```bash
node server.js
```

The server will automatically create all new database tables and columns on startup.

### Example Test Flow:

1. **Create a campaign** → Use existing POST /api/campaigns
2. **Add beneficiary** → POST /api/campaigns/1/beneficiary
3. **Invite team member** → POST /api/campaigns/1/team
4. **Make donation with tip** → POST /api/donations
5. **Send thank you** → POST /api/donations/1/thank-you
6. **Add bank account** → POST /api/users/1/bank-accounts
7. **Request withdrawal** → POST /api/campaigns/1/withdrawals
8. **Get trending campaigns** → GET /api/campaigns/trending
9. **Get embed code** → GET /api/campaigns/1/embed
10. **View embed widget** → GET /embed/campaign/1

---

## Frontend Integration Notes

To integrate these features into your frontend:

1. **Team Management** - Add team management UI in organizer dashboard
2. **Withdrawal System** - Create withdrawal request form with bank account selection
3. **Donation Flow** - Add tip option to donation form (suggest 10%, 15%, 20%)
4. **Receipt Download** - Add receipt download button in donor's donation history
5. **Embed Widget** - Add "Share" section with embed code generator
6. **Trending Section** - Display trending campaigns on homepage
7. **Beneficiary Info** - Add beneficiary form in campaign creation wizard
8. **Verification Badge** - Display verification status badge on campaigns

All endpoints return JSON with `success: true/false` for easy error handling.
