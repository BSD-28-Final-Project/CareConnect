# 📚 CareConnect API Documentation - Index

Selamat datang di dokumentasi API CareConnect! Berikut panduan untuk menggunakan semua dokumentasi yang tersedia.

---

## 📖 Dokumentasi yang Tersedia

### 1. README.md
**Untuk siapa:** Semua orang (overview project)
**Isi:**
- Overview project CareConnect
- Features lengkap
- Tech stack
- Installation guide
- Project structure
- Database schema
- Deployment guide

**Kapan digunakan:** Pertama kali membaca tentang project atau setup awal

---

### 2. API_QUICK_REFERENCE.md
**Untuk siapa:** Developer yang butuh referensi cepat
**Isi:**
- Quick start (3 langkah)
- Tabel summary semua endpoints
- Sample request bodies
- Testing scenarios pendek
- Query parameters cheat sheet

**Kapan digunakan:** 
- Lupa endpoint atau format request
- Butuh contoh cepat
- Reference saat coding

---

### 3. API_COMPLETE_TESTING.md
**Untuk siapa:** QA, tester, dan developer yang butuh detail lengkap
**Isi:**
- Dokumentasi detail SEMUA endpoints
- Request & response examples lengkap
- Error handling
- cURL commands (PowerShell)
- Postman setup guide
- Complete testing flow
- Data models reference

**Kapan digunakan:**
- Testing API secara menyeluruh
- Butuh contoh request/response detail
- Troubleshooting error
- Onboarding developer baru

---

### 4. USER_API_SUMMARY.md
**Untuk siapa:** Developer fokus user authentication
**Isi:**
- User endpoints detail
- Authentication flow
- Security features
- Validation rules
- Testing scenarios user-specific
- Tips & best practices

**Kapan digunakan:**
- Implementasi user authentication
- Troubleshoot login/register issues
- Understand security implementation

---

### 5. API_TESTING.md (Legacy)
**Untuk siapa:** Original user API documentation
**Isi:**
- Basic user authentication endpoints
- Original testing guide

**Kapan digunakan:**
- Legacy reference
- Basic user API only

---

### 6. CareConnect_Postman_Collection.json
**Untuk siapa:** Pengguna Postman
**Isi:**
- Complete Postman collection
- Pre-configured requests
- Auto-save variables (token, IDs)
- Organized by resource

**Cara pakai:**
1. Import ke Postman
2. Update `base_url` jika perlu
3. Run requests sesuai urutan
4. Token & IDs otomatis tersimpan

---

## 🚀 Panduan Penggunaan

### Scenario 1: First Time Setup
**Ikuti urutan ini:**
1. Baca **README.md** → Understand project & setup
2. Setup environment → Install dependencies
3. Baca **API_QUICK_REFERENCE.md** → Quick overview
4. Import **Postman Collection** → Ready to test
5. Follow testing flow → Start testing!

---

### Scenario 2: Developing New Feature
**Yang perlu:**
1. **API_QUICK_REFERENCE.md** → Lihat endpoint summary
2. **API_COMPLETE_TESTING.md** → Detail implementation
3. Test dengan **Postman Collection**

---

### Scenario 3: Debugging/Troubleshooting
**Yang perlu:**
1. **API_COMPLETE_TESTING.md** → Cek error responses
2. **README.md** → Cek database schema
3. **USER_API_SUMMARY.md** (jika user-related) → Security & validation

---

### Scenario 4: New Team Member Onboarding
**Urutan belajar:**
1. **README.md** → Overview & setup
2. **API_QUICK_REFERENCE.md** → Quick tour
3. **API_COMPLETE_TESTING.md** → Deep dive
4. Import **Postman Collection** → Hands-on practice
5. **USER_API_SUMMARY.md** → Specific topics

---

## 📋 Quick Command Reference

### Start Server
```bash
cd server
node app.js
```

### Quick Test (Register → Login)
```powershell
# Register
curl.exe -X POST http://localhost:3000/api/users/register -H "Content-Type: application/json" -d '{"name":"Test","email":"test@test.com","password":"pass123"}'

# Login
curl.exe -X POST http://localhost:3000/api/users/login -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"pass123"}'
```

---

## 🎯 Cheat Sheet: Pilih Dokumentasi

| Butuh Apa | Baca Ini |
|-----------|----------|
| Setup project | README.md |
| Quick reference endpoint | API_QUICK_REFERENCE.md |
| Detail lengkap API | API_COMPLETE_TESTING.md |
| User auth specific | USER_API_SUMMARY.md |
| Testing dengan Postman | CareConnect_Postman_Collection.json |
| Database schema | README.md |
| Error handling | API_COMPLETE_TESTING.md |
| Security info | USER_API_SUMMARY.md |
| Deployment | README.md |

---

## 📊 API Endpoints Summary

### Total Endpoints: 30

**Users (5):**
- Register, Login, Get Profile, Update Profile, Get by ID

**Activities (8):**
- CRUD + Search + Volunteer (Register/Unregister) + Add Donation

**Donations (3):**
- Create, Get All (with filters), Get by ID

**Expenses (6):**
- CRUD + Get by Activity (History) + Get All (with filters)

**News (7):**
- CRUD + Get Latest + Get by Activity + Get All (with filters)

**Health (1):**
- Health check

---

## 🔥 Most Used Endpoints

### Development:
1. POST `/api/users/register`
2. POST `/api/users/login`
3. GET `/api/activities`
4. POST `/api/activities`
5. POST `/api/donations`
6. GET `/api/news/latest` (Homepage feed)
7. GET `/api/expenses/activity/:id` (Transparency)

### Testing:
1. GET `/health`
2. GET `/api/users/profile`
3. GET `/api/activities?search=...`
4. GET `/api/donations?activityId=...`
5. POST `/api/activities/:id/volunteer`
6. GET `/api/news/activity/:id`
7. GET `/api/expenses?activityId=...`

---

## 💡 Tips

### For Beginners:
- Mulai dari README.md
- Gunakan Postman Collection untuk testing
- Follow testing scenarios di API_COMPLETE_TESTING.md

### For Experienced:
- API_QUICK_REFERENCE.md untuk referensi cepat
- cURL commands untuk automation
- USER_API_SUMMARY.md untuk deep dive authentication

### For QA:
- API_COMPLETE_TESTING.md adalah bible
- Test semua error cases
- Use Postman Collection untuk regression testing

---

## 🔗 File Locations

```
CareConnect/
├── README.md                           ← Start here!
├── API_QUICK_REFERENCE.md              ← Quick lookup
├── API_COMPLETE_TESTING.md             ← Complete guide
├── USER_API_SUMMARY.md                 ← User API focus
├── API_TESTING.md                      ← Legacy (user only)
├── CareConnect_Postman_Collection.json ← Import to Postman
└── server/
    ├── app.js                          ← Entry point
    ├── .env                            ← Config
    └── test-user-api.js                ← Test script
```

---

## 📞 Need Help?

### Check These First:
1. **Common errors** → API_COMPLETE_TESTING.md (Common Errors section)
2. **Validation rules** → USER_API_SUMMARY.md (Validation Rules section)
3. **Environment setup** → README.md (Environment Variables section)

### Still Stuck?
- Check server logs
- Verify MongoDB connection
- Ensure JWT_SECRET is set
- Test with `/health` endpoint first

---

## 🎓 Learning Path

### Level 1: Beginner
1. Read README.md
2. Setup environment
3. Test `/health` endpoint
4. Try Register & Login

### Level 2: Intermediate
5. Read API_QUICK_REFERENCE.md
6. Test all CRUD operations
7. Understand authentication flow
8. Use Postman Collection

### Level 3: Advanced
9. Read API_COMPLETE_TESTING.md
10. Read USER_API_SUMMARY.md
11. Test all scenarios
12. Understand error handling
13. Learn security features

---

## ✅ Before Going to Production

- [ ] Read all documentation
- [ ] Test all endpoints
- [ ] Change JWT_SECRET to strong key
- [ ] Set NODE_ENV=production
- [ ] Setup proper MongoDB cluster
- [ ] Test error scenarios
- [ ] Setup monitoring
- [ ] Review security features

---

**Happy Coding! 🚀**

*Last updated: November 12, 2025*
