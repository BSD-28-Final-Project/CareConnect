# CareConnect 🤝

Platform untuk menghubungkan relawan dan donatur dengan kegiatan sosial yang membutuhkan bantuan.

---

## 📋 Table of Contents
1. [Features](#user-management)
2. [Tech Stack](#️tech-stack)
3. [Installation](#prerequisites)
4. [API Documentation](#quick-reference)
5. [Project Structure](#project-structure)
6. [Environment Variables](#-environment-variables)
7. [Usage](#-usage)
8. [API Endpoints Summary](#-api-endpoints-summary)
9. [Testing](#-testing)
10. [Security Features](#-security-features)
11. [Database Schema](#-database-schema)
12. [Deployment](#-deployment)
13. [Contributing](#-contributing)

---

## ✨ Features

### User Management
- ✅ User registration & authentication
- ✅ JWT-based authorization
- ✅ Profile management
- ✅ Password change with verification
- ✅ Secure password hashing

### Activity Management
- ✅ Create, read, update, delete activities
- ✅ Search activities by keyword
- ✅ Filter by category and location
- ✅ Track collected money and volunteers
- ✅ Upload activity images

### Volunteer Management
- ✅ Register as volunteer for activities
- ✅ Unregister from activities
- ✅ Track volunteer list per activity
- ✅ Prevent duplicate registrations

### Donation System
- ✅ Create donations
- ✅ Auto-update activity collected money
- ✅ Track donation history
- ✅ Filter donations by activity or user

### Expense Tracking (Transparency)
- ✅ Record activity expenses
- ✅ Track expense history per activity
- ✅ Calculate total expenses
- ✅ CRUD operations for expenses
- ✅ Transparency for donors

### News & Updates (Engagement)
- ✅ Post activity updates
- ✅ Latest news feed for homepage
- ✅ Activity timeline/updates
- ✅ Image support for news
- ✅ CRUD operations for news

---

### 🛠️ Tech Stack

**Backend:**
- Node.js
- Express.js
- MongoDB (with native driver)
- JWT for authentication
- bcryptjs for password hashing

**Development:**
- Nodemon for hot reload
- dotenv for environment management

---

## 📥 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account or local MongoDB
- Git

### Setup Steps

1. **Clone Repository**
```bash
git clone https://github.com/BSD-28-Final-Project/CareConnect.git
cd CareConnect/server
```

2. **Install Dependencies**
```bash
npm install
```

3. **Configure Environment**
Create `.env` file in `server` directory:
```env
PORT=3000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
```

4. **Start Server**
```bash
# Development mode (with nodemon)
npm run dev

# Production mode
node app.js
```

5. **Verify Server Running**
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2025-11-12T00:00:00.000Z"
}
```

---

## 📚 API Documentation

### Quick Reference
See [API_QUICK_REFERENCE.md](./documentation/API_QUICK_REFERENCE.md) for:
- Quick start guide
- All endpoints summary
- Sample requests
- Common testing scenarios

### Complete Documentation
See [API_COMPLETE_TESTING.md](./documentation/API_COMPLETE_TESTING.md) for:
- Detailed endpoint documentation
- Request/response examples
- Error handling
- cURL and Postman examples
- Data models reference

### Expenses & News Documentation
See [EXPENSES_NEWS_API.md](./EXPENSES_NEWS_API.md) for:
- Complete Expenses API documentation
- Complete News API documentation
- Transparency features
- Engagement features

---

## 📁 Project Structure

```
CareConnect/
├── server/
│   ├── app.js                      # Main application entry
│   ├── package.json                # Dependencies
│   ├── .env                        # Environment variables
│   │
│   ├── config/
│   │   └── database.js             # MongoDB connection
│   │
│   ├── models/
│   │   ├── userModel.js            # User collection
│   │   ├── activityModel.js        # Activity collection
│   │   ├── donationModel.js        # Donation collection
│   │   ├── expenseModel.js         # Expense collection
│   │   └── newsModel.js            # Activity News collection
│   │
│   ├── controllers/
│   │   ├── userController.js       # User logic
│   │   ├── activityController.js   # Activity logic
│   │   ├── donationController.js   # Donation logic
│   │   ├── expenseController.js    # Expense tracking logic
│   │   └── newsController.js       # News/updates logic
│   │
│   ├── routes/
│   │   ├── index.js                # Main router
│   │   ├── userRoutes.js           # User endpoints
│   │   ├── activityRoutes.js       # Activity endpoints
│   │   ├── donationRoutes.js       # Donation endpoints
│   │   ├── expensesRoutes.js       # Expense endpoints
│   │   └── newsRouter.js           # News endpoints
│   │
│   ├── middlewares/
│   │   ├── authentication.js       # JWT verification
│   │   └── errorhandler.js         # Error handling & validation
│   │
│   └── seeds/
│       └── seedActivities.js       # Seed data for testing
│
├── documentation/
│   ├── API_COMPLETE_TESTING.md     # Complete API docs
│   ├── API_QUICK_REFERENCE.md      # Quick reference
│   ├── USER_API_SUMMARY.md         # User API guide
│   ├── EXPENSES_NEWS_API.md        # Expenses & News docs
│   ├── EXPENSES_NEWS_QUICK.md      # Quick reference
│   ├── DOCUMENTATION_INDEX.md      # Documentation index
│   └── CareConnect_Postman_Collection.json
│
├── EXPENSES_NEWS_API.md            # Expenses & News API docs (root)
├── EXPENSES_NEWS_QUICK.md          # Expenses & News Quick (root)
└── README.md                        # This file
```

---

## 🔧 Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=3000

# Database
MONGO_URL=mongodb+srv://username:password@cluster.mongodb.net/database_name

# Authentication
JWT_SECRET=your_super_secret_key_min_32_characters

# Optional
NODE_ENV=development
```

---

## 💻 Usage

### 1. Register a User
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"pass123"}'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'
```

### 3. Create Activity
```bash
curl -X POST http://localhost:3000/api/activities \
  -H "Content-Type: application/json" \
  -d '{"title":"Bantuan Bencana","description":"Penggalangan dana","location":"Jakarta","category":"Disaster Relief","targetMoney":10000000}'
```

### 4. Get All Activities
```bash
curl -X GET http://localhost:3000/api/activities
```

### 5. Register as Volunteer
```bash
curl -X POST http://localhost:3000/api/activities/{activityId}/volunteer \
  -H "Content-Type: application/json" \
  -d '{"userId":"userId","name":"Volunteer Name","phone":"08123456789"}'
```

### 6. Create Donation
```bash
curl -X POST http://localhost:3000/api/donations \
  -H "Content-Type: application/json" \
  -d '{"userId":"userId","activityId":"activityId","amount":500000}'
```

---

## 🎯 API Endpoints Summary

### Users (5 endpoints)
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get own profile (auth required)
- `PUT /api/users/profile` - Update profile (auth required)
- `GET /api/users/:id` - Get user by ID (auth required)

### Activities (8 endpoints)
- `GET /api/activities` - Get all activities (with search & filters)
- `POST /api/activities` - Create activity
- `GET /api/activities/:id` - Get activity by ID
- `PUT /api/activities/:id` - Update activity
- `DELETE /api/activities/:id` - Delete activity
- `POST /api/activities/:id/volunteer` - Register volunteer
- `DELETE /api/activities/:id/volunteer/:volunteerId` - Unregister
- `POST /api/activities/:id/donation` - Add donation

### Donations (3 endpoints)
- `POST /api/donations` - Create donation
- `GET /api/donations` - Get all donations (with filters)
- `GET /api/donations/:id` - Get donation by ID

### Expenses (6 endpoints)
- `POST /api/expenses` - Create expense
- `GET /api/expenses` - Get all expenses (with filters)
- `GET /api/expenses/activity/:activityId` - Get expense history
- `GET /api/expenses/:id` - Get expense by ID
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### News (7 endpoints)
- `POST /api/news` - Create news
- `GET /api/news` - Get all news (with filters)
- `GET /api/news/latest` - Get latest news
- `GET /api/news/activity/:activityId` - Get news by activity
- `GET /api/news/:id` - Get news by ID
- `PUT /api/news/:id` - Update news
- `DELETE /api/news/:id` - Delete news

**Total: 29 endpoints + 1 health check = 30 endpoints**

---

## 🧪 Testing

### Run Test Script
```bash
node test-user-api.js
```

### Using Postman
1. Import the API endpoints
2. Set up environment variables
3. Test each endpoint following the documentation

### Using cURL
See [API_COMPLETE_TESTING.md](./documentation/API_COMPLETE_TESTING.md) for all cURL examples

---

## 🔐 Security Features

- ✅ Password hashing with bcryptjs (10 salt rounds)
- ✅ JWT token authentication (24-hour expiry)
- ✅ Password never sent in responses
- ✅ Email validation
- ✅ Password strength requirements (min 5 chars)
- ✅ Duplicate email prevention
- ✅ Current password verification for password changes

---

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (default: "user"),
  point: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Activities Collection
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  location: String,
  images: Array<String>,
  collectedMoney: Number,
  collectedVolunteer: Number,
  category: String,
  targetMoney: Number,
  listVolunteer: Array<{
    _id: ObjectId,
    userId: String,
    name: String,
    phone: String,
    note: String,
    status: String,
    createdAt: Date
  }>,
  createdAt: Date,
  updatedAt: Date
}
```

### Donations Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  activityId: ObjectId,
  amount: Number,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Expenses Collection
```javascript
{
  _id: ObjectId,
  activityId: ObjectId,
  title: String,
  amount: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### ActivityNews Collection
```javascript
{
  _id: ObjectId,
  activityId: ObjectId,
  title: String,
  content: String,
  images: Array<String>,
  createdAt: Date,
  updatedAt: Date
}
```

1. Connect your GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the ISC License.

---

## 👥 Team

BSD-28 Final Project Team

---

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Contact: [Your Contact Info]

---

## 🎉 Acknowledgments

- MongoDB Atlas for database hosting
- Express.js team for the amazing framework
- All contributors and testers

---

**Made with ❤️ by BSD-28 Team**

