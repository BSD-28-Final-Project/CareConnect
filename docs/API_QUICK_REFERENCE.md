# CareConnect API - Quick Reference

## 🚀 Quick Start

```powershell
# 1. Start Server
cd server
node app.js

# 2. Register User
curl.exe -X POST http://localhost:3000/api/users/register `
  -H "Content-Type: application/json" `
  -d '{"name":"John","email":"john@test.com","password":"pass123"}'

# 3. Login
curl.exe -X POST http://localhost:3000/api/users/login `
  -H "Content-Type: application/json" `
  -d '{"email":"john@test.com","password":"pass123"}'
```

---

## 📋 All Endpoints Summary

### Users (Authentication)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/users/register` | ❌ | Register new user |
| POST | `/api/users/login` | ❌ | Login & get token |
| GET | `/api/users/profile` | ✅ | Get own profile |
| PUT | `/api/users/profile` | ✅ | Update own profile |
| GET | `/api/users/:id` | ✅ | Get user by ID |

### Activities
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/activities` | ❌ | Get all activities |
| POST | `/api/activities` | ❌ | Create activity |
| GET | `/api/activities/:id` | ❌ | Get activity by ID |
| PUT | `/api/activities/:id` | ❌ | Update activity |
| DELETE | `/api/activities/:id` | ❌ | Delete activity |
| POST | `/api/activities/:id/volunteer` | ❌ | Register as volunteer |
| DELETE | `/api/activities/:id/volunteer/:volunteerId` | ❌ | Unregister volunteer |
| POST | `/api/activities/:id/donation` | ❌ | Add donation |

### Donations
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/donations` | ❌ | Create donation |
| GET | `/api/donations` | ❌ | Get all donations |
| GET | `/api/donations/:id` | ❌ | Get donation by ID |

### Expenses
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/expenses` | ❌ | Create expense |
| GET | `/api/expenses` | ❌ | Get all expenses |
| GET | `/api/expenses/activity/:activityId` | ❌ | Get expense history by activity |
| GET | `/api/expenses/:id` | ❌ | Get expense by ID |
| PUT | `/api/expenses/:id` | ❌ | Update expense |
| DELETE | `/api/expenses/:id` | ❌ | Delete expense |

### News
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/news` | ❌ | Create news |
| GET | `/api/news` | ❌ | Get all news |
| GET | `/api/news/latest` | ❌ | Get latest news (homepage) |
| GET | `/api/news/activity/:activityId` | ❌ | Get news by activity |
| GET | `/api/news/:id` | ❌ | Get news by ID |
| PUT | `/api/news/:id` | ❌ | Update news |
| DELETE | `/api/news/:id` | ❌ | Delete news |

---

## 🔍 Query Parameters

### Activities
```
GET /api/activities?search=bantuan
GET /api/activities?category=Education
GET /api/activities?location=Jakarta
GET /api/activities?search=donasi&category=Health
```

### Donations
```
GET /api/donations?activityId=507f1f77bcf86cd799439011
GET /api/donations?userId=507f1f77bcf86cd799439013
GET /api/donations?activityId=xxx&userId=yyy
```

---

## 📦 Sample Request Bodies

### Register User
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Update Profile
```json
{
  "name": "New Name",
  "email": "newemail@example.com"
}
```

### Change Password
```json
{
  "currentPassword": "oldpass123",
  "newPassword": "newpass456"
}
```

### Create Activity
```json
{
  "title": "Bantuan Pendidikan",
  "description": "Program bantuan pendidikan",
  "location": "Jakarta",
  "category": "Education",
  "targetMoney": 10000000,
  "images": ["image1.jpg", "image2.jpg"]
}
```

### Update Activity
```json
{
  "title": "Updated Title",
  "location": "Surabaya"
}
```

### Register Volunteer
```json
{
  "userId": "507f1f77bcf86cd799439013",
  "name": "Jane Doe",
  "phone": "08123456789",
  "note": "Saya ingin membantu"
}
```

### Add Donation (via Activity)
```json
{
  "amount": 500000
}
```

### Create Donation
```json
{
  "userId": "507f1f77bcf86cd799439013",
  "activityId": "507f1f77bcf86cd799439011",
  "amount": 1000000
}
```

---

## 🧪 Testing Scenarios

### Scenario 1: Complete User Journey
```powershell
# 1. Register
curl.exe -X POST http://localhost:3000/api/users/register -H "Content-Type: application/json" -d '{"name":"Test","email":"test@test.com","password":"pass123"}'

# 2. Login (save token!)
curl.exe -X POST http://localhost:3000/api/users/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"pass123"}'

# 3. Get Profile
curl.exe -X GET http://localhost:3000/api/users/profile -H "Authorization: Bearer YOUR_TOKEN"

# 4. Update Profile
curl.exe -X PUT http://localhost:3000/api/users/profile -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d '{"name":"Updated Name"}'
```

### Scenario 2: Activity Management
```powershell
# 1. Create Activity
curl.exe -X POST http://localhost:3000/api/activities -H "Content-Type: application/json" -d '{"title":"Test Activity","description":"Test desc","location":"Jakarta","category":"Education","targetMoney":5000000}'

# 2. Get All Activities
curl.exe -X GET http://localhost:3000/api/activities

# 3. Get Activity by ID (use ID from step 1)
curl.exe -X GET http://localhost:3000/api/activities/ACTIVITY_ID

# 4. Update Activity
curl.exe -X PUT http://localhost:3000/api/activities/ACTIVITY_ID -H "Content-Type: application/json" -d '{"title":"Updated Title"}'

# 5. Search Activities
curl.exe -X GET "http://localhost:3000/api/activities?search=test"
```

### Scenario 3: Volunteer & Donation
```powershell
# 1. Register as Volunteer
curl.exe -X POST http://localhost:3000/api/activities/ACTIVITY_ID/volunteer -H "Content-Type: application/json" -d '{"userId":"USER_ID","name":"Volunteer Name","phone":"081234567890"}'

# 2. Create Donation
curl.exe -X POST http://localhost:3000/api/donations -H "Content-Type: application/json" -d '{"userId":"USER_ID","activityId":"ACTIVITY_ID","amount":1000000}'

# 3. Verify Activity Updated
curl.exe -X GET http://localhost:3000/api/activities/ACTIVITY_ID

# 4. Get All Donations for Activity
curl.exe -X GET "http://localhost:3000/api/donations?activityId=ACTIVITY_ID"
```

---

## 🔐 Authentication

### Get Token:
```powershell
curl.exe -X POST http://localhost:3000/api/users/login -H "Content-Type: application/json" -d '{"email":"user@test.com","password":"pass123"}'
```

### Use Token in Headers:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Example with Token:
```powershell
curl.exe -X GET http://localhost:3000/api/users/profile -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## ⚠️ Common Errors

| Status | Message | Solution |
|--------|---------|----------|
| 400 | Invalid id | Check ObjectId format (24 hex chars) |
| 400 | Validation error | Check required fields |
| 401 | No token provided | Add Authorization header |
| 404 | Not found | Check resource exists |
| 409 | Already exists | User/volunteer already registered |
| 500 | Server error | Check server logs |

---

## 📊 Response Formats

### Success Response:
```json
{
  "message": "Success message",
  "data": { /* resource data */ }
}
```

### Error Response:
```json
{
  "message": "Error message",
  "error": "Error details (optional)"
}
```

### List Response:
```json
{
  "data": [ /* array of resources */ ],
  "total": 10
}
```

---

## 🎯 Key Features

### Activities:
✅ Search by keyword (title/description)
✅ Filter by category
✅ Filter by location
✅ Track collected money & volunteers
✅ Manage volunteer list
✅ Add donations

### Donations:
✅ Auto-update activity's collectedMoney
✅ Filter by activity or user
✅ Track donation history

### Users:
✅ Secure authentication (JWT)
✅ Password hashing (bcryptjs)
✅ Profile management
✅ Password change with verification

---

## 💾 Database Collections

### users
- name, email, password, role, point

### activities
- title, description, location, category
- targetMoney, collectedMoney, collectedVolunteer
- listVolunteer[], images[]

### donations
- userId, activityId, amount, status

---

## 🛠️ Development Tools

### Test Server Running:
```powershell
curl.exe -X GET http://localhost:3000/health
```

### Expected Response:
```json
{
  "status": "OK",
  "timestamp": "2025-11-12T00:00:00.000Z"
}
```

---

## 📝 Notes

- Token expires in 24 hours
- Password minimum 5 characters
- Email must be unique
- Amount must be > 0 for donations
- Volunteer can only register once per activity
- All ObjectIds are 24 hex characters

---

## 🔗 Related Files

- `API_COMPLETE_TESTING.md` - Detailed API documentation
- `USER_API_SUMMARY.md` - User API specific guide
- `API_TESTING.md` - Original user testing guide

---

**Made with ❤️ for CareConnect**
