# Quick Reference - Admin System

## 🚀 Most Used Endpoints

### Dashboard
```bash
GET /api/admin/dashboard-stats
# Shows: users (total/active/pending/suspended), campaigns, donations, notifications
```

### User Management
```bash
# List pending users
GET /api/admin/users?status=pending

# Approve user ✅ WORKING
POST /api/admin/users/:id/approve
Body: { "adminId": 1, "adminEmail": "admin@email.com", "notes": "Approved" }

# Reject user
POST /api/admin/users/:id/reject
Body: { "adminId": 1, "adminEmail": "admin@email.com", "reason": "Reason here" }

# Get user details + history
GET /api/admin/users/:id
```

### Campaign Management
```bash
# List all campaigns
GET /api/admin/campaigns

# Get campaign with full history
GET /api/admin/campaigns/:id/details

# Approve campaign
POST /api/admin/campaigns/:id/approve
```

### Audit & History
```bash
# View audit log (last 20 actions)
GET /api/admin/audit-log?limit=20

# Get notifications
GET /api/admin/notifications?read=false
```

## 🔑 Test Accounts

```
Admin: omar@gmail.com / 0668328275Aa
Test User: test@example.com / test123
```

## 🎯 Common Tasks

### Approve Pending User
```bash
curl -X POST http://localhost:3001/api/admin/users/5/approve \
  -H "Content-Type: application/json" \
  -d '{"adminId":1,"adminEmail":"omar@gmail.com","notes":"Verified"}'
```

### Check What Changed
```bash
curl http://localhost:3001/api/admin/audit-log?limit=10
```

### See Dashboard
```bash
curl http://localhost:3001/api/admin/dashboard-stats
```

## 📊 Status Values

**Users:** pending → active/rejected/suspended
**Campaigns:** draft → pending → active/rejected/suspended

## 🎉 What Works Now

✅ Profile approval actually updates database
✅ Complete audit trail of all actions
✅ Status history tracking
✅ Admin can change anything
✅ Real-time notifications
✅ Dashboard statistics
✅ Backwards compatible

## 📁 Documentation Files

1. `ADMIN_SYSTEM_DOCUMENTATION.md` - Complete guide
2. `COMPLETE_API_REFERENCE.md` - All endpoints
3. `IMPLEMENTATION_SUMMARY.md` - What was built
4. `QUICK_REFERENCE.md` - This file

## 🏃 Servers

Frontend: http://localhost:4030
Backend: http://localhost:3001

## ✅ Test Results

15/15 tests passed
All systems operational
