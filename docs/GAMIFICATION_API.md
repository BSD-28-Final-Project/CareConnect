# 🎮 Gamification API Documentation

## Overview
CareConnect menggunakan sistem gamification untuk meningkatkan engagement user melalui points, levels, dan achievements.

---

## 🎯 Point System

### Cara Mendapatkan Points:

| Activity | Points | Description |
|----------|--------|-------------|
| Donation | 1 point per Rp 10,000 | Contoh: Donasi Rp 50,000 = 5 points |
| Register as Volunteer | 50 points | Daftar sebagai relawan di activity |
| Unlock Achievement | Varies | Bonus points saat unlock achievement |

### Level System:

| Level | Name | Min Points | Max Points | Badge |
|-------|------|-----------|-----------|-------|
| 1 | Pemula | 0 | 99 | 🌱 |
| 2 | Penolong | 100 | 299 | 🤝 |
| 3 | Pejuang | 300 | 599 | 💪 |
| 4 | Pahlawan | 600 | 999 | ⭐ |
| 5 | Legenda | 1000 | 1999 | 🏆 |
| 6 | Champion | 2000+ | ∞ | 👑 |

---

## 🏆 Achievements

### Available Achievements:

1. **💝 Donatur Pertama** (+10 points)
   - Melakukan donasi pertama kali
   - Unlocked: Saat user donate untuk pertama kalinya

2. **🙋 Relawan Pertama** (+20 points)
   - Mendaftar sebagai relawan pertama kali
   - Unlocked: Saat user register volunteer untuk pertama kalinya

3. **💎 Donatur Dermawan** (+100 points)
   - Total donasi mencapai Rp 1,000,000
   - Unlocked: Ketika totalDonations >= 1,000,000

4. **🔥 Relawan Aktif** (+150 points)
   - Terdaftar di 5 kegiatan
   - Unlocked: Ketika totalVolunteerActivities >= 5

5. **🌟 Super Donatur** (+500 points)
   - Total donasi mencapai Rp 5,000,000
   - Unlocked: Ketika totalDonations >= 5,000,000

---

## 📝 API Endpoints

### 1. Get User Gamification Profile

**GET** `/api/gamification/profile/:userId`

Get complete gamification profile untuk user.

**Response (200 OK):**
```json
{
  "data": {
    "userId": "673abc123def456",
    "name": "John Doe",
    "totalPoints": 285,
    "currentLevel": {
      "level": 2,
      "name": "Penolong",
      "minPoints": 100,
      "maxPoints": 299,
      "badge": "🤝"
    },
    "nextLevel": {
      "level": 3,
      "name": "Pejuang",
      "minPoints": 300,
      "maxPoints": 599,
      "badge": "💪"
    },
    "pointsToNextLevel": 15,
    "progress": "92.50%",
    "stats": {
      "totalDonations": 1250000,
      "totalVolunteerActivities": 3,
      "achievementsUnlocked": 3
    },
    "achievements": [
      {
        "id": "first_donation",
        "name": "Donatur Pertama",
        "description": "Melakukan donasi pertama kali",
        "badge": "💝",
        "points": 10,
        "unlockedAt": "2025-11-15T10:00:00.000Z"
      }
    ],
    "recentActivity": [
      {
        "points": 50,
        "reason": "volunteer_register",
        "metadata": { "points": 50 },
        "timestamp": "2025-11-17T12:00:00.000Z"
      }
    ]
  }
}
```

**Use Case:**
- Profile page untuk display user level & progress
- Homepage untuk show current level badge
- Statistics dashboard

---

### 2. Get Leaderboard

**GET** `/api/gamification/leaderboard`

Get ranking user berdasarkan points, donations, atau volunteer activities.

**Query Parameters:**
- `type` (optional) - `points` | `donations` | `volunteers` (default: `points`)
- `limit` (optional) - Max results (default: 100)

**Examples:**
```
GET /api/gamification/leaderboard
GET /api/gamification/leaderboard?type=donations&limit=50
GET /api/gamification/leaderboard?type=volunteers&limit=10
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "rank": 1,
      "userId": "673abc123def456",
      "name": "John Doe",
      "points": 1285,
      "level": {
        "level": 5,
        "name": "Legenda",
        "minPoints": 1000,
        "maxPoints": 1999,
        "badge": "🏆"
      },
      "totalDonations": 5500000,
      "totalVolunteerActivities": 12,
      "achievementsCount": 5
    },
    {
      "rank": 2,
      "userId": "673def789ghi012",
      "name": "Jane Smith",
      "points": 890,
      "level": {
        "level": 4,
        "name": "Pahlawan",
        "minPoints": 600,
        "maxPoints": 999,
        "badge": "⭐"
      },
      "totalDonations": 3200000,
      "totalVolunteerActivities": 8,
      "achievementsCount": 4
    }
  ],
  "count": 2
}
```

**Use Case:**
- Leaderboard page
- Competition/ranking feature
- Motivate users untuk compete

---

### 3. Get All Achievements

**GET** `/api/gamification/achievements`

Get list semua available achievements.

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "first_donation",
      "name": "Donatur Pertama",
      "description": "Melakukan donasi pertama kali",
      "badge": "💝",
      "points": 10
    },
    {
      "id": "first_volunteer",
      "name": "Relawan Pertama",
      "description": "Mendaftar sebagai relawan pertama kali",
      "badge": "🙋",
      "points": 20
    },
    {
      "id": "generous_donor",
      "name": "Donatur Dermawan",
      "description": "Total donasi mencapai 1 juta rupiah",
      "badge": "💎",
      "points": 100
    },
    {
      "id": "active_volunteer",
      "name": "Relawan Aktif",
      "description": "Terdaftar di 5 kegiatan",
      "badge": "🔥",
      "points": 150
    },
    {
      "id": "super_donor",
      "name": "Super Donatur",
      "description": "Total donasi mencapai 5 juta rupiah",
      "badge": "🌟",
      "points": 500
    }
  ],
  "count": 5
}
```

**Use Case:**
- Achievement gallery page
- Show all possible achievements
- Motivate users to unlock

---

### 4. Get User Achievements Status

**GET** `/api/gamification/achievements/:userId`

Get status semua achievements untuk user (locked/unlocked).

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "first_donation",
      "name": "Donatur Pertama",
      "description": "Melakukan donasi pertama kali",
      "badge": "💝",
      "points": 10,
      "unlocked": true,
      "unlockedAt": "2025-11-15T10:00:00.000Z"
    },
    {
      "id": "first_volunteer",
      "name": "Relawan Pertama",
      "description": "Mendaftar sebagai relawan pertama kali",
      "badge": "🙋",
      "points": 20,
      "unlocked": true,
      "unlockedAt": "2025-11-16T14:30:00.000Z"
    },
    {
      "id": "generous_donor",
      "name": "Donatur Dermawan",
      "description": "Total donasi mencapai 1 juta rupiah",
      "badge": "💎",
      "points": 100,
      "unlocked": false,
      "unlockedAt": null
    }
  ],
  "unlockedCount": 2,
  "totalCount": 5
}
```

**Use Case:**
- User achievement page
- Show progress towards locked achievements
- Notification saat unlock achievement baru

---

## 🔄 Automatic Point Processing

### Donation Flow:
1. User complete payment via Xendit
2. Webhook triggered → donation status = `success`
3. **Auto process:**
   - Calculate points: `amount / 10000`
   - Add points to user
   - Update `totalDonations`
   - Check & unlock achievements
   - Log activity

### Volunteer Flow:
1. User register as volunteer
2. **Auto process:**
   - Add 50 points to user
   - Update `totalVolunteerActivities`
   - Check & unlock achievements
   - Log activity

---

## 📊 Database Schema Updates

### Users Collection - New Fields:

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String,
  role: String,
  point: Number,                        // Total points
  totalDonations: Number,               // Total amount donated (Rp)
  totalVolunteerActivities: Number,     // Count volunteer registrations
  achievements: [{                      // Array of unlocked achievements
    id: String,
    name: String,
    description: String,
    badge: String,
    points: Number,
    unlockedAt: Date
  }],
  activityLog: [{                       // Point activity history
    points: Number,
    reason: String,                     // "donation" | "volunteer_register"
    metadata: Object,                   // Additional data
    timestamp: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Testing Flow

### Test Scenario 1: First Donation
```bash
# 1. Create donation
POST /api/donations
{
  "userId": "673abc123",
  "activityId": "673def456",
  "amount": 100000,
  "payerEmail": "test@example.com"
}

# 2. Simulate payment (webhook)
POST /api/donations/webhook/xendit
{
  "external_id": "donation_id",
  "status": "PAID",
  "paid_amount": 100000
}

# 3. Check profile
GET /api/gamification/profile/673abc123

# Expected:
# - points: 10 (donation) + 10 (first_donation achievement) = 20
# - totalDonations: 100000
# - achievements: ["first_donation"]
```

### Test Scenario 2: Become Volunteer
```bash
# 1. Register volunteer
POST /api/activities/673def456/volunteer
{
  "userId": "673abc123",
  "name": "John",
  "phone": "08123456789"
}

# 2. Check profile
GET /api/gamification/profile/673abc123

# Expected:
# - points: +50 (volunteer) + 20 (first_volunteer) = +70 total
# - totalVolunteerActivities: 1
# - achievements: ["first_donation", "first_volunteer"]
```

### Test Scenario 3: Leaderboard
```bash
# Get top 10 by points
GET /api/gamification/leaderboard?limit=10

# Get top donors
GET /api/gamification/leaderboard?type=donations&limit=10

# Get most active volunteers
GET /api/gamification/leaderboard?type=volunteers&limit=10
```

---

## 💡 Frontend Integration Tips

### Display User Badge:
```javascript
// Get user profile
const profile = await fetch(`/api/gamification/profile/${userId}`);
const { currentLevel } = profile.data;

// Display badge
<div>
  <span>{currentLevel.badge}</span>
  <span>{currentLevel.name}</span>
</div>
```

### Progress Bar:
```javascript
const { progress, pointsToNextLevel, nextLevel } = profile.data;

<div>
  <div className="progress-bar" style={{ width: progress }} />
  <p>{pointsToNextLevel} points to {nextLevel.name}</p>
</div>
```

### Achievement Notification:
```javascript
// After donation/volunteer action, check for new achievements
const before = await getProfile(userId);
// ... user performs action ...
const after = await getProfile(userId);

const newAchievements = after.achievements.filter(
  a => !before.achievements.find(b => b.id === a.id)
);

if (newAchievements.length > 0) {
  showNotification(`🏆 Achievement Unlocked: ${newAchievements[0].name}`);
}
```

---

## 🚀 Future Enhancements

Possible additions:
- Daily login streak bonus
- Referral system points
- Activity completion bonus
- Seasonal events & limited achievements
- Point redemption/rewards
- Team/guild system

---

**Made with ❤️ by BSD-28 Team**
