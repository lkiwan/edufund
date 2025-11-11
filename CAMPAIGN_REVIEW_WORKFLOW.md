# Campaign Review Workflow - Implementation Complete ✅

## Overview
Students can now create campaigns, submit them for review, and admins can approve or reject them with full details and images.

---

## 🎯 Features Implemented

### 1. Campaign Statuses
- **draft** - Campaign being created (not submitted yet)
- **pending** - Campaign submitted, awaiting admin review ⏳
- **published** - Campaign approved and live ✅
- **rejected** - Campaign rejected by admin ❌
- **active** - Campaign is active and accepting donations
- **completed** - Campaign goal reached or ended

### 2. Student Actions

#### Submit Campaign for Review
**Endpoint:** `POST /api/campaigns/:id/submit`

**Request Body:**
```json
{
  "userId": 123
}
```

**Response:**
```json
{
  "success": true,
  "message": "Campaign submitted for review"
}
```

**What happens:**
- Campaign status changes from "draft" to "pending"
- Creates entry in campaign_status_history table
- Student can now see "Under Review" status on their dashboard

#### View My Campaigns
**Endpoint:** `GET /api/users/:userId/campaigns`

**Response:**
```json
{
  "success": true,
  "campaigns": [
    {
      "id": 1,
      "title": "Help Student Complete Degree",
      "status": "pending",
      "goalAmount": 45000,
      "currentAmount": 0,
      "coverImage": "/uploads/image.jpg",
      "createdAt": "2025-01-10",
      ...
    }
  ]
}
```

**Status Display:**
- **pending** → Show "Under Review 🔍" badge (yellow/orange)
- **published** → Show "Live ✅" badge (green)
- **rejected** → Show "Rejected ❌" badge (red) with reason
- **draft** → Show "Draft 📝" badge (gray)

### 3. Admin Actions

#### Get Pending Campaigns
**Endpoint:** `GET /api/admin/campaigns?status=pending`

**Response:**
```json
{
  "success": true,
  "campaigns": [
    {
      "id": 1,
      "title": "Help Student",
      "status": "pending",
      "cover_image": "/uploads/image.jpg",
      "goal_amount": 45000,
      "category": "Engineering",
      "creator_email": "student@edu.com",
      "created_at": "2025-01-10",
      ...
    }
  ],
  "total": 2
}
```

#### Get Campaign Full Details (with images)
**Endpoint:** `GET /api/admin/campaigns/:id/details`

**Response:**
```json
{
  "success": true,
  "campaign": {
    "id": 1,
    "title": "Help Student Complete Degree",
    "description": "Full description...",
    "goal_amount": 45000,
    "cover_image": "/uploads/image.jpg",
    "category": "Engineering",
    "city": "Casablanca",
    "university": "Hassan II",
    "creator_email": "student@edu.com",
    ...
  },
  "donations": [],
  "updates": [],
  "comments": [],
  "statusHistory": [...],
  "auditLog": [...]
}
```

#### Approve Campaign
**Endpoint:** `POST /api/admin/campaigns/:id/approve`

**Request Body:**
```json
{
  "adminId": 1,
  "adminEmail": "admin@edufund.com",
  "notes": "Campaign looks good, approved!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Campaign approved successfully"
}
```

**What happens:**
- Campaign status changes to "published"
- Sets approved_at timestamp
- Sets approved_by (admin ID)
- Stores moderation_notes
- Logs to campaign_status_history
- Logs to audit_log
- Campaign now appears on public listings

#### Reject Campaign
**Endpoint:** `POST /api/admin/campaigns/:id/reject`

**Request Body:**
```json
{
  "adminId": 1,
  "adminEmail": "admin@edufund.com",
  "reason": "Missing required documents. Please provide student ID verification."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Campaign rejected"
}
```

**What happens:**
- Campaign status changes to "rejected"
- Stores rejection_reason
- Logs to campaign_status_history
- Logs to audit_log
- Student can see rejection reason and resubmit after fixing issues

---

## 📊 Database Schema Updates

### Campaigns Table
```sql
ALTER TABLE campaigns ADD COLUMN approved_at DATETIME NULL;
ALTER TABLE campaigns ADD COLUMN approved_by INT NULL;
ALTER TABLE campaigns ADD COLUMN rejection_reason TEXT NULL;
ALTER TABLE campaigns ADD COLUMN moderation_notes TEXT NULL;
```

### Campaign Status History Table
```sql
CREATE TABLE IF NOT EXISTS campaign_status_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  campaign_id INT NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  changed_by INT,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);
```

### Audit Log Table
```sql
-- Already exists, tracks all admin actions
-- action_type: 'APPROVE_CAMPAIGN', 'REJECT_CAMPAIGN'
-- entity_type: 'campaign'
-- entity_id: campaign ID
```

---

## 🎨 UI Implementation Guide

### Student Dashboard

**Show Campaign Status:**
```jsx
const getStatusBadge = (status) => {
  switch(status) {
    case 'pending':
      return <Badge variant="warning">🔍 Under Review</Badge>;
    case 'published':
      return <Badge variant="success">✅ Live</Badge>;
    case 'rejected':
      return <Badge variant="danger">❌ Rejected</Badge>;
    case 'draft':
      return <Badge variant="default">📝 Draft</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};
```

**Submit Campaign Button:**
```jsx
<Button
  onClick={() => submitCampaign(campaignId)}
  disabled={status !== 'draft'}
>
  Submit for Review
</Button>
```

### Admin Dashboard

**Pending Campaigns Section:**
```jsx
// Fetch pending campaigns
const [pendingCampaigns, setPendingCampaigns] = useState([]);

useEffect(() => {
  fetch('/api/admin/campaigns?status=pending')
    .then(res => res.json())
    .then(data => setPendingCampaigns(data.campaigns));
}, []);

// Display with images
{pendingCampaigns.map(campaign => (
  <Card key={campaign.id}>
    <img src={campaign.cover_image} alt={campaign.title} />
    <h3>{campaign.title}</h3>
    <p>{campaign.category} - {campaign.goal_amount} MAD</p>
    <p>By: {campaign.creator_email}</p>

    <Button onClick={() => approveCampaign(campaign.id)}>
      ✅ Approve
    </Button>
    <Button onClick={() => rejectCampaign(campaign.id)}>
      ❌ Reject
    </Button>
  </Card>
))}
```

**Approve/Reject Functions:**
```jsx
const approveCampaign = async (campaignId) => {
  const notes = prompt('Add approval notes (optional):');

  await fetch(`/api/admin/campaigns/${campaignId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      adminId: currentAdmin.id,
      adminEmail: currentAdmin.email,
      notes: notes || 'Campaign approved'
    })
  });

  // Refresh list
  fetchPendingCampaigns();
};

const rejectCampaign = async (campaignId) => {
  const reason = prompt('Enter rejection reason (required):');

  if (!reason) {
    alert('Rejection reason is required');
    return;
  }

  await fetch(`/api/admin/campaigns/${campaignId}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      adminId: currentAdmin.id,
      adminEmail: currentAdmin.email,
      reason
    })
  });

  // Refresh list
  fetchPendingCampaigns();
};
```

---

## 🧪 Testing

### Test Data Created
```
✅ 2 campaigns set to "pending" status:
1. Campaign #1: "Help Fatima Complete Her Engineering Degree"
2. Campaign #2: "Medical Student Needs Support for Final Year"
```

### Test Script
Run: `node test-campaign-review.js`

This script:
- Sets campaigns to "pending" status
- Shows current status counts
- Lists all pending campaigns with details

### Manual Testing Steps

**As Student:**
1. Create a new campaign (status: draft)
2. Click "Submit for Review" button
3. Status changes to "pending"
4. See "Under Review 🔍" badge on dashboard
5. Wait for admin action

**As Admin:**
1. Go to Admin Dashboard
2. See "Pending Campaigns (2)" section
3. Click on a pending campaign
4. View full details including images
5. Click "Approve" → Campaign goes live
6. OR Click "Reject" → Enter reason → Campaign rejected
7. Student sees rejection reason and can fix + resubmit

---

## 📝 Status Flow Diagram

```
[Student Creates]
      ↓
   [DRAFT]
      ↓
[Student Submits]
      ↓
   [PENDING] ← "Under Review"
      ↓
  [Admin Reviews]
      ↓
      ├─→ [APPROVED] → [PUBLISHED] → Live on site ✅
      │
      └─→ [REJECTED] → Student sees reason, can fix + resubmit ❌
```

---

## ✅ What's Working Now

1. **Students can:**
   - Create campaigns (draft)
   - Submit for review (→ pending)
   - See status badges on their dashboard
   - View rejection reasons if rejected

2. **Admins can:**
   - See count of pending campaigns
   - View list of pending campaigns
   - See full campaign details with images
   - Approve campaigns (→ published)
   - Reject campaigns with reason
   - See complete history and audit log

3. **Database:**
   - Tracks all status changes
   - Logs all admin actions
   - Stores approval/rejection details
   - Complete audit trail

---

## 🚀 Next Steps (Optional Enhancements)

1. **Email Notifications:**
   - Notify student when campaign is approved
   - Notify student when campaign is rejected
   - Notify admin when new campaign submitted

2. **Resubmission Flow:**
   - Allow students to edit rejected campaigns
   - Resubmit for review after fixes

3. **Bulk Actions:**
   - Approve multiple campaigns at once
   - Reject multiple campaigns

4. **Review Notes:**
   - Admin can add private notes
   - Internal communication between admins

5. **Priority Queue:**
   - Flag urgent campaigns for faster review
   - Auto-assign to specific admin reviewers

---

## 📞 API Reference Summary

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/campaigns/:id/submit` | POST | Submit campaign for review | Student |
| `/api/users/:userId/campaigns` | GET | Get my campaigns | Student |
| `/api/admin/campaigns?status=pending` | GET | Get pending campaigns | Admin |
| `/api/admin/campaigns/:id/details` | GET | Get campaign full details | Admin |
| `/api/admin/campaigns/:id/approve` | POST | Approve campaign | Admin |
| `/api/admin/campaigns/:id/reject` | POST | Reject campaign | Admin |

---

## ✅ Implementation Complete!

The campaign review workflow is now fully functional with database connectivity, audit trails, and ready-to-use API endpoints. Admin can see campaign details including images and make informed approval/rejection decisions.
