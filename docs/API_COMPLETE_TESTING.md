# CareConnect API - Complete Testing Guide

## 📋 Table of Contents
1. [User Authentication APIs](#user-authentication-apis)
2. [Activity APIs](#activity-apis)
3. [Donation APIs](#donation-apis)
4. [Expenses APIs](#expenses-apis)
5. [News APIs](#news-apis)
6. [Testing Tools](#testing-tools)

---

## Base URL
```
http://localhost:3000/api
```

---

# User Authentication APIs

## 1. Register User
**POST** `/api/users/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "userId": "507f1f77bcf86cd799439011"
}
```

---

## 2. Login User
**POST** `/api/users/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "point": 0
  }
}
```

---

## 3. Get User Profile
**GET** `/api/users/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Profile retrieved successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "point": 0,
    "createdAt": "2025-11-12T00:00:00.000Z",
    "updatedAt": "2025-11-12T00:00:00.000Z"
  }
}
```

---

## 4. Update User Profile
**PUT** `/api/users/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (all fields optional):**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

**Response (200 OK):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Smith",
    "email": "johnsmith@example.com",
    "role": "user",
    "point": 0
  }
}
```

---

## 5. Get User by ID
**GET** `/api/users/:id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "User retrieved successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "point": 0
  }
}
```

---

# Activity APIs

## 1. Get All Activities
**GET** `/api/activities`

**Query Parameters (optional):**
- `search` - Search in title and description
- `category` - Filter by category
- `location` - Filter by location (partial match)

**Examples:**
```
GET /api/activities
GET /api/activities?search=donasi
GET /api/activities?category=Education
GET /api/activities?location=Jakarta
GET /api/activities?search=bantuan&category=Health
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Bantuan Pendidikan Anak",
      "description": "Program bantuan pendidikan untuk anak-anak kurang mampu",
      "location": "Jakarta",
      "images": ["url1.jpg", "url2.jpg"],
      "collectedMoney": 5000000,
      "collectedVolunteer": 15,
      "category": "Education",
      "targetMoney": 10000000,
      "listVolunteer": [],
      "createdAt": "2025-11-12T00:00:00.000Z",
      "updatedAt": "2025-11-12T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

## 2. Create Activity
**POST** `/api/activities`

**Request Body:**
```json
{
  "title": "Bantuan Bencana Alam",
  "description": "Penggalangan dana untuk korban bencana alam",
  "location": "Bandung",
  "images": ["image1.jpg", "image2.jpg"],
  "category": "Disaster Relief",
  "targetMoney": 50000000
}
```

**Response (201 Created):**
```json
{
  "message": "Activity created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Bantuan Bencana Alam",
    "description": "Penggalangan dana untuk korban bencana alam",
    "location": "Bandung",
    "images": ["image1.jpg", "image2.jpg"],
    "collectedMoney": 0,
    "collectedVolunteer": 0,
    "category": "Disaster Relief",
    "targetMoney": 50000000,
    "listVolunteer": [],
    "createdAt": "2025-11-12T00:00:00.000Z",
    "updatedAt": "2025-11-12T00:00:00.000Z"
  }
}
```

---

## 3. Get Activity by ID
**GET** `/api/activities/:id`

**Example:**
```
GET /api/activities/507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Bantuan Pendidikan Anak",
    "description": "Program bantuan pendidikan untuk anak-anak kurang mampu",
    "location": "Jakarta",
    "images": ["url1.jpg"],
    "collectedMoney": 5000000,
    "collectedVolunteer": 15,
    "category": "Education",
    "targetMoney": 10000000,
    "listVolunteer": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "userId": "507f1f77bcf86cd799439013",
        "name": "Jane Doe",
        "phone": "08123456789",
        "note": "Saya ingin membantu",
        "status": "registered",
        "createdAt": "2025-11-12T00:00:00.000Z"
      }
    ]
  }
}
```

---

## 4. Update Activity
**PUT** `/api/activities/:id`

**Request Body (all fields optional):**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "location": "Surabaya",
  "category": "Health",
  "targetMoney": 75000000,
  "images": ["newimage.jpg"]
}
```

**Response (200 OK):**
```json
{
  "message": "Activity updated",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Updated Title",
    "description": "Updated description",
    "updatedAt": "2025-11-12T01:00:00.000Z"
  }
}
```

---

## 5. Delete Activity
**DELETE** `/api/activities/:id`

**Example:**
```
DELETE /api/activities/507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "message": "Activity deleted"
}
```

---

## 6. Register as Volunteer
**POST** `/api/activities/:id/volunteer`

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439013",
  "name": "Jane Doe",
  "phone": "08123456789",
  "note": "Saya bersedia membantu sebagai volunteer"
}
```

**Response (201 Created):**
```json
{
  "message": "Registered as volunteer",
  "volunteer": {
    "_id": "507f1f77bcf86cd799439014",
    "userId": "507f1f77bcf86cd799439013",
    "name": "Jane Doe",
    "phone": "08123456789",
    "note": "Saya bersedia membantu sebagai volunteer",
    "status": "registered",
    "createdAt": "2025-11-12T00:00:00.000Z"
  }
}
```

**Error Response (409 Conflict):**
```json
{
  "message": "User already registered as volunteer"
}
```

---

## 7. Unregister Volunteer
**DELETE** `/api/activities/:id/volunteer/:volunteerId`

**Example:**
```
DELETE /api/activities/507f1f77bcf86cd799439011/volunteer/507f1f77bcf86cd799439014
```

**Response (200 OK):**
```json
{
  "message": "Volunteer unregistered",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "collectedVolunteer": 14,
    "updatedAt": "2025-11-12T01:00:00.000Z"
  }
}
```

---

## 8. Add Donation to Activity
**POST** `/api/activities/:id/donation`

**Request Body:**
```json
{
  "amount": 500000
}
```

**Response (200 OK):**
```json
{
  "message": "Donation added",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "collectedMoney": 5500000,
    "updatedAt": "2025-11-12T01:00:00.000Z"
  }
}
```

---

# Donation APIs

## 1. Create Donation
**POST** `/api/donations`

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439013",
  "activityId": "507f1f77bcf86cd799439011",
  "amount": 1000000
}
```

**Response (201 Created):**
```json
{
  "message": "Donation successfully added",
  "donationId": "507f1f77bcf86cd799439015"
}
```

**Note:** This will also automatically update the `collectedMoney` in the related activity.

---

## 2. Get All Donations
**GET** `/api/donations`

**Query Parameters (optional):**
- `activityId` - Filter by activity ID
- `userId` - Filter by user ID

**Examples:**
```
GET /api/donations
GET /api/donations?activityId=507f1f77bcf86cd799439011
GET /api/donations?userId=507f1f77bcf86cd799439013
GET /api/donations?activityId=507f1f77bcf86cd799439011&userId=507f1f77bcf86cd799439013
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "userId": "507f1f77bcf86cd799439013",
      "activityId": "507f1f77bcf86cd799439011",
      "amount": 1000000,
      "status": "success",
      "createdAt": "2025-11-12T00:00:00.000Z",
      "updatedAt": "2025-11-12T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

## 3. Get Donation by ID
**GET** `/api/donations/:id`

**Example:**
```
GET /api/donations/507f1f77bcf86cd799439015
```

**Response (200 OK):**
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "userId": "507f1f77bcf86cd799439013",
    "activityId": "507f1f77bcf86cd799439011",
    "amount": 1000000,
    "status": "success",
    "createdAt": "2025-11-12T00:00:00.000Z",
    "updatedAt": "2025-11-12T00:00:00.000Z"
  }
}
```

---

# Expenses APIs

## 1. Create Expense
**POST** `/api/expenses`

Create new expense record for an activity.

**Request Body:**
```json
{
  "activityId": "507f1f77bcf86cd799439011",
  "title": "Pembelian Buku Pelajaran",
  "amount": 5000000
}
```

**Response (201 Created):**
```json
{
  "message": "Expense created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "activityId": "507f1f77bcf86cd799439011",
    "title": "Pembelian Buku Pelajaran",
    "amount": 5000000,
    "createdAt": "2025-11-12T00:00:00.000Z",
    "updatedAt": "2025-11-12T00:00:00.000Z"
  }
}
```

---

## 2. Get All Expenses
**GET** `/api/expenses`

Get all expenses with optional filter by activity.

**Query Parameters:**
- `activityId` (optional) - Filter by activity ID

**Examples:**
```
GET /api/expenses
GET /api/expenses?activityId=507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "activityId": "507f1f77bcf86cd799439011",
      "title": "Pembelian Buku Pelajaran",
      "amount": 5000000,
      "createdAt": "2025-11-12T00:00:00.000Z",
      "updatedAt": "2025-11-12T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

## 3. Get Expenses by Activity (History)
**GET** `/api/expenses/activity/:activityId`

Get expense history for specific activity with total calculation.

**Example:**
```
GET /api/expenses/activity/507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "activityId": "507f1f77bcf86cd799439011",
      "title": "Pembelian Buku Pelajaran",
      "amount": 5000000,
      "createdAt": "2025-11-12T00:00:00.000Z",
      "updatedAt": "2025-11-12T00:00:00.000Z"
    }
  ],
  "total": 1,
  "totalAmount": 5000000
}
```

**Use Case:** Show transparency of fund usage to donors

---

## 4. Get Expense by ID
**GET** `/api/expenses/:id`

**Example:**
```
GET /api/expenses/507f1f77bcf86cd799439012
```

**Response (200 OK):**
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "activityId": "507f1f77bcf86cd799439011",
    "title": "Pembelian Buku Pelajaran",
    "amount": 5000000,
    "createdAt": "2025-11-12T00:00:00.000Z",
    "updatedAt": "2025-11-12T00:00:00.000Z"
  }
}
```

---

## 5. Update Expense
**PUT** `/api/expenses/:id`

**Request Body (all fields optional):**
```json
{
  "title": "Pembelian Buku dan Alat Tulis",
  "amount": 6000000
}
```

**Response (200 OK):**
```json
{
  "message": "Expense updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "activityId": "507f1f77bcf86cd799439011",
    "title": "Pembelian Buku dan Alat Tulis",
    "amount": 6000000,
    "updatedAt": "2025-11-12T02:00:00.000Z"
  }
}
```

---

## 6. Delete Expense
**DELETE** `/api/expenses/:id`

**Response (200 OK):**
```json
{
  "message": "Expense deleted successfully"
}
```

---

# News APIs

## 1. Create News
**POST** `/api/news`

Create new news/update for an activity.

**Request Body:**
```json
{
  "activityId": "507f1f77bcf86cd799439011",
  "title": "Update Distribusi Buku",
  "content": "Hari ini kami telah mendistribusikan 500 buku ke 10 sekolah",
  "images": ["image1.jpg", "image2.jpg"]
}
```

**Response (201 Created):**
```json
{
  "message": "News created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "activityId": "507f1f77bcf86cd799439011",
    "title": "Update Distribusi Buku",
    "content": "Hari ini kami telah mendistribusikan 500 buku ke 10 sekolah",
    "images": ["image1.jpg", "image2.jpg"],
    "createdAt": "2025-11-12T00:00:00.000Z",
    "updatedAt": "2025-11-12T00:00:00.000Z"
  }
}
```

---

## 2. Get All News
**GET** `/api/news`

Get all news with optional filter by activity.

**Query Parameters:**
- `activityId` (optional) - Filter by activity ID

**Examples:**
```
GET /api/news
GET /api/news?activityId=507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "activityId": "507f1f77bcf86cd799439011",
      "title": "Update Distribusi Buku",
      "content": "Hari ini kami telah mendistribusikan 500 buku...",
      "images": ["image1.jpg"],
      "createdAt": "2025-11-12T00:00:00.000Z",
      "updatedAt": "2025-11-12T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

## 3. Get Latest News
**GET** `/api/news/latest`

Get most recent news across all activities.

**Query Parameters:**
- `limit` (optional) - Number of news to return (default: 10)

**Example:**
```
GET /api/news/latest?limit=5
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "activityId": "507f1f77bcf86cd799439011",
      "title": "Update Distribusi Buku",
      "content": "Hari ini kami telah mendistribusikan 500 buku...",
      "images": ["image1.jpg"],
      "createdAt": "2025-11-12T00:00:00.000Z",
      "updatedAt": "2025-11-12T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

**Use Case:** Homepage feed showing latest updates

---

## 4. Get News by Activity
**GET** `/api/news/activity/:activityId`

Get all news/updates for specific activity.

**Example:**
```
GET /api/news/activity/507f1f77bcf86cd799439011
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "activityId": "507f1f77bcf86cd799439011",
      "title": "Update Distribusi Buku",
      "content": "Hari ini kami telah mendistribusikan 500 buku...",
      "images": ["image1.jpg"],
      "createdAt": "2025-11-12T00:00:00.000Z",
      "updatedAt": "2025-11-12T00:00:00.000Z"
    }
  ],
  "total": 1
}
```

**Use Case:** Activity timeline/updates

---

## 5. Get News by ID
**GET** `/api/news/:id`

**Example:**
```
GET /api/news/507f1f77bcf86cd799439014
```

**Response (200 OK):**
```json
{
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "activityId": "507f1f77bcf86cd799439011",
    "title": "Update Distribusi Buku",
    "content": "Hari ini kami telah mendistribusikan 500 buku ke 10 sekolah",
    "images": ["image1.jpg", "image2.jpg"],
    "createdAt": "2025-11-12T00:00:00.000Z",
    "updatedAt": "2025-11-12T00:00:00.000Z"
  }
}
```

---

## 6. Update News
**PUT** `/api/news/:id`

**Request Body (all fields optional):**
```json
{
  "title": "Update Distribusi Buku - Minggu 2",
  "content": "Updated content with more details...",
  "images": ["image1.jpg", "image2.jpg", "image3.jpg"]
}
```

**Response (200 OK):**
```json
{
  "message": "News updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "activityId": "507f1f77bcf86cd799439011",
    "title": "Update Distribusi Buku - Minggu 2",
    "content": "Updated content with more details...",
    "images": ["image1.jpg", "image2.jpg", "image3.jpg"],
    "updatedAt": "2025-11-12T02:00:00.000Z"
  }
}
```

---

## 7. Delete News
**DELETE** `/api/news/:id`

**Response (200 OK):**
```json
{
  "message": "News deleted successfully"
}
```

---

# Testing Tools

## Testing with cURL (PowerShell)

### Users

#### Register
```powershell
curl.exe -X POST http://localhost:3000/api/users/register `
  -H "Content-Type: application/json" `
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

#### Login
```powershell
curl.exe -X POST http://localhost:3000/api/users/login `
  -H "Content-Type: application/json" `
  -d '{"email":"john@example.com","password":"password123"}'
```

### Activities

#### Get All Activities
```powershell
curl.exe -X GET http://localhost:3000/api/activities
```

#### Get Activities with Search
```powershell
curl.exe -X GET "http://localhost:3000/api/activities?search=pendidikan"
```

#### Create Activity
```powershell
curl.exe -X POST http://localhost:3000/api/activities `
  -H "Content-Type: application/json" `
  -d '{"title":"Bantuan Bencana","description":"Penggalangan dana","location":"Jakarta","category":"Disaster Relief","targetMoney":50000000}'
```

#### Get Activity by ID
```powershell
curl.exe -X GET http://localhost:3000/api/activities/507f1f77bcf86cd799439011
```

#### Update Activity
```powershell
curl.exe -X PUT http://localhost:3000/api/activities/507f1f77bcf86cd799439011 `
  -H "Content-Type: application/json" `
  -d '{"title":"Updated Title","description":"Updated description"}'
```

#### Delete Activity
```powershell
curl.exe -X DELETE http://localhost:3000/api/activities/507f1f77bcf86cd799439011
```

#### Register as Volunteer
```powershell
curl.exe -X POST http://localhost:3000/api/activities/507f1f77bcf86cd799439011/volunteer `
  -H "Content-Type: application/json" `
  -d '{"userId":"507f1f77bcf86cd799439013","name":"Jane Doe","phone":"08123456789"}'
```

#### Unregister Volunteer
```powershell
curl.exe -X DELETE http://localhost:3000/api/activities/507f1f77bcf86cd799439011/volunteer/507f1f77bcf86cd799439014
```

#### Add Donation to Activity
```powershell
curl.exe -X POST http://localhost:3000/api/activities/507f1f77bcf86cd799439011/donation `
  -H "Content-Type: application/json" `
  -d '{"amount":500000}'
```

### Donations

#### Create Donation
```powershell
curl.exe -X POST http://localhost:3000/api/donations `
  -H "Content-Type: application/json" `
  -d '{"userId":"507f1f77bcf86cd799439013","activityId":"507f1f77bcf86cd799439011","amount":1000000}'
```

#### Get All Donations
```powershell
curl.exe -X GET http://localhost:3000/api/donations
```

#### Get Donations by Activity
```powershell
curl.exe -X GET "http://localhost:3000/api/donations?activityId=507f1f77bcf86cd799439011"
```

#### Get Donation by ID
```powershell
curl.exe -X GET http://localhost:3000/api/donations/507f1f77bcf86cd799439015
```

---

## Testing with Postman

### Quick Setup Guide:

1. **Import Collection Variables:**
   - `base_url`: `http://localhost:3000/api`
   - `token`: (save after login)

2. **Create Requests:**

#### Users Collection:
- POST Register: `{{base_url}}/users/register`
- POST Login: `{{base_url}}/users/login`
- GET Profile: `{{base_url}}/users/profile` (add Bearer token)
- PUT Update Profile: `{{base_url}}/users/profile` (add Bearer token)

#### Activities Collection:
- GET All Activities: `{{base_url}}/activities`
- POST Create Activity: `{{base_url}}/activities`
- GET Activity by ID: `{{base_url}}/activities/:id`
- PUT Update Activity: `{{base_url}}/activities/:id`
- DELETE Activity: `{{base_url}}/activities/:id`
- POST Register Volunteer: `{{base_url}}/activities/:id/volunteer`
- DELETE Unregister Volunteer: `{{base_url}}/activities/:id/volunteer/:volunteerId`
- POST Add Donation: `{{base_url}}/activities/:id/donation`

#### Donations Collection:
- POST Create Donation: `{{base_url}}/donations`
- GET All Donations: `{{base_url}}/donations`
- GET Donation by ID: `{{base_url}}/donations/:id`

---

## Common Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "No token provided / Invalid token"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "message": "Resource already exists"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error message",
  "error": "Error details"
}
```

---

## Complete Testing Flow Example

### 1. Setup User
```powershell
# Register
curl.exe -X POST http://localhost:3000/api/users/register `
  -H "Content-Type: application/json" `
  -d '{"name":"Test User","email":"test@example.com","password":"pass123"}'

# Login & Save Token
curl.exe -X POST http://localhost:3000/api/users/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"pass123"}'
```

### 2. Create Activity
```powershell
curl.exe -X POST http://localhost:3000/api/activities `
  -H "Content-Type: application/json" `
  -d '{"title":"Bantuan Pendidikan","description":"Program bantuan","location":"Jakarta","category":"Education","targetMoney":10000000}'
```

### 3. Register as Volunteer
```powershell
# Use activity ID and user ID from previous steps
curl.exe -X POST http://localhost:3000/api/activities/ACTIVITY_ID/volunteer `
  -H "Content-Type: application/json" `
  -d '{"userId":"USER_ID","name":"Test User","phone":"08123456789"}'
```

### 4. Create Donation
```powershell
curl.exe -X POST http://localhost:3000/api/donations `
  -H "Content-Type: application/json" `
  -d '{"userId":"USER_ID","activityId":"ACTIVITY_ID","amount":500000}'
```

### 5. Verify Results
```powershell
# Check activity with updated data
curl.exe -X GET http://localhost:3000/api/activities/ACTIVITY_ID

# Check all donations
curl.exe -X GET http://localhost:3000/api/donations?activityId=ACTIVITY_ID
```

---

## Environment Variables Required

Make sure your `.env` file contains:
```env
PORT=3000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
```

---

## Data Models Reference

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (default: "user"),
  point: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Activity Model
```javascript
{
  title: String (required),
  description: String (required),
  location: String,
  images: Array<String>,
  collectedMoney: Number (default: 0),
  collectedVolunteer: Number (default: 0),
  category: String,
  targetMoney: Number,
  listVolunteer: Array<Volunteer>,
  createdAt: Date,
  updatedAt: Date
}
```

### Volunteer Object (embedded in Activity)
```javascript
{
  _id: ObjectId,
  userId: String,
  name: String (required),
  phone: String,
  note: String,
  status: String (default: "registered"),
  createdAt: Date
}
```

### Donation Model
```javascript
{
  userId: ObjectId,
  activityId: ObjectId,
  amount: Number (required, > 0),
  status: String (default: "success"),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Tips & Best Practices

- ✅ Always save the JWT token after login for protected routes
- ✅ Use query parameters for filtering and searching
- ✅ Validate ObjectId format before making requests
- ✅ Check activity exists before registering as volunteer or making donation
- ✅ Handle duplicate volunteer registration (returns 409)
- ✅ Donations automatically update activity's collectedMoney
- ✅ Unregistering volunteer automatically decrements collectedVolunteer

---

## Support

For issues or questions, contact the development team.

**Happy Testing! 🚀**
