# User API Endpoints - Summary

## 📋 Available Endpoints

### Public Endpoints (No Authentication Required)

#### 1. Register User
```
POST /api/users/register
```
- **Purpose**: Membuat user baru
- **Body**: `{ name, email, password, role? }`
- **Response**: User ID

#### 2. Login User
```
POST /api/users/login
```
- **Purpose**: Login dan mendapatkan JWT token
- **Body**: `{ email, password }`
- **Response**: Token + User data

---

### Protected Endpoints (Authentication Required)

#### 3. Get Own Profile
```
GET /api/users/profile
Header: Authorization: Bearer <token>
```
- **Purpose**: Melihat profile sendiri
- **Response**: User data (tanpa password)

#### 4. Update Own Profile
```
PUT /api/users/profile
Header: Authorization: Bearer <token>
```
- **Purpose**: Update profile sendiri
- **Body (optional fields)**: 
  ```json
  {
    "name": "New Name",
    "email": "newemail@example.com",
    "currentPassword": "oldpass123",
    "newPassword": "newpass456"
  }
  ```
- **Response**: Updated user data

#### 5. Get User by ID
```
GET /api/users/:id
Header: Authorization: Bearer <token>
```
- **Purpose**: Melihat profile user berdasarkan ID
- **Authorization**: 
  - User bisa lihat profile sendiri
  - Admin bisa lihat semua profile
- **Response**: User data (tanpa password)

---

## 🔐 Authentication Flow

### Normal Flow:
1. **Register** → Dapat User ID
2. **Login** → Dapat Token
3. **Use Token** untuk access protected endpoints

### Token Format:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🛡️ Security Features

✅ Password di-hash dengan bcryptjs (10 salt rounds)
✅ JWT token dengan expiry 1 day
✅ Password tidak pernah dikirim dalam response
✅ Email validation (regex)
✅ Password minimal 5 karakter
✅ Check email duplicate saat register dan update
✅ Verify current password saat ganti password
✅ Authorization check pada protected routes

---

## 📝 Validation Rules

### Name:
- Required saat register
- Harus string dan tidak kosong

### Email:
- Required saat register
- Format valid (user@domain.com)
- Unique (tidak boleh duplicate)

### Password:
- Required saat register
- Minimal 5 karakter
- Di-hash sebelum disimpan

### Update Profile:
- Semua field optional
- Untuk ganti password, harus sertakan currentPassword
- Email baru harus unique

---

## 🧪 Quick Test Scenarios

### Scenario 1: New User Registration & Login
```
1. POST /api/users/register
   Body: { "name": "John", "email": "john@test.com", "password": "pass123" }

2. POST /api/users/login
   Body: { "email": "john@test.com", "password": "pass123" }
   → Save the token!

3. GET /api/users/profile
   Header: Authorization: Bearer <token>
   → See your profile
```

### Scenario 2: Update Profile
```
1. Login first → Get token

2. PUT /api/users/profile
   Header: Authorization: Bearer <token>
   Body: { "name": "John Doe Updated" }
   → Update name only

3. GET /api/users/profile
   Header: Authorization: Bearer <token>
   → Verify updated name
```

### Scenario 3: Change Password
```
1. Login first → Get token

2. PUT /api/users/profile
   Header: Authorization: Bearer <token>
   Body: { 
     "currentPassword": "pass123",
     "newPassword": "newpass456"
   }

3. POST /api/users/login
   Body: { "email": "john@test.com", "password": "newpass456" }
   → Test new password
```

---

## 🚨 Common Errors

### 400 Bad Request
- Missing required fields
- Invalid email format
- Password too short
- Email already exists
- Current password incorrect

### 401 Unauthorized
- No token provided
- Invalid token
- Token expired

### 403 Forbidden
- Trying to access other user's profile (non-admin)

### 404 Not Found
- User not found
- Email not registered

---

## 💡 Tips

1. **Save token setelah login** - Akan digunakan untuk semua protected endpoints
2. **Token expired 1 hari** - Login ulang jika token expired
3. **Update profile partial** - Bisa update hanya field tertentu
4. **Password change requires verification** - Harus kirim currentPassword
5. **Email harus unique** - Tidak bisa gunakan email yang sudah terdaftar

---

## 🔧 Development Notes

- User model fields: `name`, `email`, `password`, `role`, `point`, `createdAt`, `updatedAt`
- Default role: "user"
- Default point: 0
- JWT secret dari environment variable: `JWT_SECRET`
- Database collection: "users"
