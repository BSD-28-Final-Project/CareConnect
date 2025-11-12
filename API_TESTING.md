# Authentication API Testing Guide

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### 1. Register User
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

**Error Responses:**
- 400: Email already exists
- 400: Validation errors (missing fields, invalid email, weak password)

---

### 2. Login User
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

**Error Responses:**
- 400: Email and password are required
- 404: User not found
- 400: Invalid password

---

### 3. Get User Profile (Own Profile)
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

**Error Responses:**
- 401: No token provided / Invalid token
- 404: User not found

---

### 4. Update User Profile
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
    "point": 0,
    "createdAt": "2025-11-12T00:00:00.000Z",
    "updatedAt": "2025-11-12T01:00:00.000Z"
  }
}
```

**Error Responses:**
- 401: No token provided / Invalid token
- 400: Invalid name / Invalid email format / Email already in use
- 400: Current password is required to change password
- 400: Current password is incorrect
- 400: New password must be at least 5 characters long

---

### 5. Get User by ID
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
    "point": 0,
    "createdAt": "2025-11-12T00:00:00.000Z",
    "updatedAt": "2025-11-12T00:00:00.000Z"
  }
}
```

**Error Responses:**
- 401: No token provided / Invalid token
- 400: Invalid user ID format
- 403: Access denied (can only view own profile unless admin)
- 404: User not found

---

## Testing with cURL

### Register
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

### Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

### Get Profile
```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Update Profile (Update Name)
```bash
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Smith\"}"
```

### Update Profile (Change Password)
```bash
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"currentPassword\":\"password123\",\"newPassword\":\"newpassword456\"}"
```

### Get User by ID
```bash
curl -X GET http://localhost:3000/api/users/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Testing with Postman

### Setup Steps:

1. **Register User:**
   - Method: POST
   - URL: `http://localhost:3000/api/users/register`
   - Headers: Content-Type: application/json
   - Body: raw JSON
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "password123"
   }
   ```

2. **Login User:**
   - Method: POST
   - URL: `http://localhost:3000/api/users/login`
   - Headers: Content-Type: application/json
   - Body: raw JSON
   ```json
   {
     "email": "john@example.com",
     "password": "password123"
   }
   ```
   - **Copy the `token` from response!**

3. **Get Profile:**
   - Method: GET
   - URL: `http://localhost:3000/api/users/profile`
   - Headers: 
     - Authorization: `Bearer <paste_token_here>`

4. **Update Profile (Name & Email):**
   - Method: PUT
   - URL: `http://localhost:3000/api/users/profile`
   - Headers: 
     - Authorization: `Bearer <paste_token_here>`
     - Content-Type: application/json
   - Body: raw JSON
   ```json
   {
     "name": "John Smith",
     "email": "johnsmith@example.com"
   }
   ```

5. **Update Password:**
   - Method: PUT
   - URL: `http://localhost:3000/api/users/profile`
   - Headers: 
     - Authorization: `Bearer <paste_token_here>`
     - Content-Type: application/json
   - Body: raw JSON
   ```json
   {
     "currentPassword": "password123",
     "newPassword": "newpassword456"
   }
   ```

6. **Get User by ID:**
   - Method: GET
   - URL: `http://localhost:3000/api/users/<user_id>`
   - Headers: 
     - Authorization: `Bearer <paste_token_here>`

---

## Environment Variables Required

Make sure your `.env` file contains:
```
PORT=3000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
```

---

## Password Requirements
- Minimum 5 characters

## Email Requirements
- Valid email format (user@domain.com)

---

## Authentication Middleware Usage

To protect routes, import and use the authentication middleware:

```javascript
import { authenticate, isAdmin, isAuthorized } from "../middlewares/authentication.js";

// Protect a route (any authenticated user)
router.get("/profile", authenticate, getProfile);

// Admin only route
router.delete("/users/:id", authenticate, isAdmin, deleteUser);

// User or Admin can access their own resource
router.put("/users/:id", authenticate, isAuthorized, updateUser);
```
