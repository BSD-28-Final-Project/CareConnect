# 🎮 Gamification Quick Reference

## 🎯 Point Rules

| Action | Points |
|--------|--------|
| Donate Rp 10,000 | 1 point |
| Donate Rp 50,000 | 5 points |
| Donate Rp 100,000 | 10 points |
| Volunteer Register | 50 points |
| First Donation Achievement | +10 bonus |
| First Volunteer Achievement | +20 bonus |
| Generous Donor Achievement (1M) | +100 bonus |
| Active Volunteer Achievement (5x) | +150 bonus |
| Super Donor Achievement (5M) | +500 bonus |

---

## 📊 Levels

| Level | Name | Points | Badge |
|-------|------|--------|-------|
| 1 | Pemula | 0-99 | 🌱 |
| 2 | Penolong | 100-299 | 🤝 |
| 3 | Pejuang | 300-599 | 💪 |
| 4 | Pahlawan | 600-999 | ⭐ |
| 5 | Legenda | 1000-1999 | 🏆 |
| 6 | Champion | 2000+ | 👑 |

---

## 🏆 Achievements

| Badge | Name | Requirement | Bonus |
|-------|------|-------------|-------|
| 💝 | Donatur Pertama | First donation | +10 pts |
| 🙋 | Relawan Pertama | First volunteer | +20 pts |
| 💎 | Donatur Dermawan | Total Rp 1,000,000 | +100 pts |
| 🔥 | Relawan Aktif | 5 activities | +150 pts |
| 🌟 | Super Donatur | Total Rp 5,000,000 | +500 pts |

---

## 📝 API Endpoints

```bash
# User Profile
GET /api/gamification/profile/:userId

# Leaderboard
GET /api/gamification/leaderboard?type=points&limit=10
GET /api/gamification/leaderboard?type=donations&limit=10
GET /api/gamification/leaderboard?type=volunteers&limit=10

# Achievements
GET /api/gamification/achievements
GET /api/gamification/achievements/:userId
```

---

## 🧪 Test Flow

### Complete Flow Example:

```bash
# 1. Register user
POST /api/users/register
{
  "name": "John Doe",
  "email": "john@test.com",
  "password": "pass123"
}
# Points: 0, Level: 1 (Pemula 🌱)

# 2. Create donation Rp 50,000
POST /api/donations
{
  "userId": "673abc123",
  "activityId": "673def456",
  "amount": 50000,
  "payerEmail": "john@test.com"
}

# 3. Complete payment
POST /api/donations/webhook/xendit
{
  "external_id": "donation_id",
  "status": "PAID",
  "paid_amount": 50000
}
# Points: 5 (donation) + 10 (first donation) = 15
# Level: 1 (Pemula 🌱)
# Achievement unlocked: 💝 Donatur Pertama

# 4. Register as volunteer
POST /api/activities/673def456/volunteer
{
  "userId": "673abc123",
  "name": "John",
  "phone": "08123456789"
}
# Points: 15 + 50 (volunteer) + 20 (first volunteer) = 85
# Level: 1 (Pemula 🌱) - need 15 more for level 2
# Achievements: 💝 Donatur Pertama, 🙋 Relawan Pertama

# 5. Donate Rp 100,000
POST /api/donations + webhook
# Points: 85 + 10 = 95
# Still level 1, need 5 more points

# 6. Donate Rp 50,000
POST /api/donations + webhook
# Points: 95 + 5 = 100
# 🎉 LEVEL UP! Level: 2 (Penolong 🤝)

# 7. Check profile
GET /api/gamification/profile/673abc123
# Response:
{
  "totalPoints": 100,
  "currentLevel": {
    "level": 2,
    "name": "Penolong",
    "badge": "🤝"
  },
  "pointsToNextLevel": 200,
  "progress": "0%",
  "stats": {
    "totalDonations": 200000,
    "totalVolunteerActivities": 1,
    "achievementsUnlocked": 2
  }
}

# 8. Check leaderboard
GET /api/gamification/leaderboard?limit=10
# See ranking position

# 9. Continue donating until Rp 1,000,000 total
# 🏆 Achievement unlocked: 💎 Donatur Dermawan (+100 pts)

# 10. Register volunteer at 4 more activities
# 🏆 Achievement unlocked: 🔥 Relawan Aktif (+150 pts)
```

---

## 💡 Frontend Integration Examples

### Display User Badge:
```jsx
const { currentLevel } = gamificationProfile;
<span>{currentLevel.badge} {currentLevel.name}</span>
```

### Progress Bar:
```jsx
const { progress, pointsToNextLevel } = gamificationProfile;
<div className="progress" style={{ width: progress }} />
<span>{pointsToNextLevel} points to level up</span>
```

### Achievement Notification:
```jsx
// Show toast when achievement unlocked
if (newAchievement) {
  toast.success(`🏆 ${newAchievement.badge} ${newAchievement.name} unlocked! +${newAchievement.points} points`);
}
```

---

## 🔥 Motivational Scenarios

### Scenario 1: Close to Level Up
```
User has 95 points (Level 1)
Next level at 100 points
→ Show: "Only 5 points to level up! 🎯"
```

### Scenario 2: Close to Achievement
```
User donated Rp 950,000
Generous Donor achievement at Rp 1,000,000
→ Show: "Donate Rp 50,000 more to unlock 💎 Donatur Dermawan!"
```

### Scenario 3: Leaderboard Position
```
User is rank #11
Top 10 get featured
→ Show: "You're so close! Beat 1 more person to enter Top 10! 🏆"
```

---

**Made with ❤️ by BSD-28 Team**
