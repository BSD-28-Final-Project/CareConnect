# Subscription System Documentation

## Overview
Sistem subscription CareConnect memungkinkan user untuk berlangganan donasi bulanan yang akan **otomatis disalurkan ke activity dengan collected money terendah** setiap bulannya.

---

## Flow Subscription

### 1. User Subscribe (Pertama Kali)
```
POST /api/subscriptions
Headers: Authorization: Bearer {token}
Body: {
  "amount": 100000  // Jumlah donasi per bulan
}
```

**Proses:**
1. System cek apakah user sudah add payment method
2. System cari activity dengan `collectedMoney` paling rendah
3. Buat Xendit recurring payment (charge otomatis tiap bulan)
4. Simpan subscription ke database dengan:
   - `userId`: ID user yang subscribe
   - `amount`: Jumlah donasi per bulan
   - `targetActivityId`: Activity target saat subscription dibuat (untuk referensi)
   - `active`: true
   - `subscriptionId`: ID dari Xendit

**Response:**
```json
{
  "message": "Subscription created successfully",
  "amount": 100000,
  "targetActivity": {
    "id": "...",
    "title": "Bersih-bersih Pantai",
    "collectedMoney": 500000
  },
  "subscriptionId": "xnd_recurring_...",
  "nextChargeDate": "2025-12-17"
}
```

---

### 2. Recurring Payment Terjadi (Setiap Bulan)

**Xendit** otomatis charge payment method user setiap bulan, lalu kirim webhook ke:
```
POST /api/subscriptions/webhook/xendit
```

**Webhook Payload dari Xendit:**
```json
{
  "id": "payment_123",
  "subscription_id": "xnd_recurring_...",
  "status": "SUCCEEDED",
  "amount": 100000,
  "event": "recurring_payment.succeeded"
}
```

**Proses di Webhook Handler:**
1. **Validate** webhook data
2. **Cari subscription** berdasarkan `subscription_id`
3. **Cari activity dengan collected money terendah** (DINAMIS setiap bulan!)
   ```javascript
   const targetActivity = await activities.findOne(
     {},
     { sort: { collectedMoney: 1 } } // Ascending = yang paling rendah duluan
   );
   ```
4. **Create donation record**:
   ```javascript
   {
     userId: subscription.userId,
     activityId: targetActivity._id,  // Bisa beda setiap bulan!
     amount: 100000,
     status: "paid",
     paymentMethod: "xendit_recurring",
     subscriptionId: subscription._id
   }
   ```
5. **Update activity's collected money**:
   ```javascript
   activity.collectedMoney += 100000
   ```
6. **Update subscription**:
   ```javascript
   {
     lastPaymentDate: new Date(),
     lastPaymentAmount: 100000,
     lastTargetActivityId: targetActivity._id
   }
   ```

---

## API Endpoints

### 1. Add Payment Method
```
POST /api/subscriptions/payment-method
Headers: Authorization: Bearer {token}
Body: {
  "type": "CARD",
  "tokenId": "token_dari_xendit_js"
}
```

### 2. Create Subscription
```
POST /api/subscriptions
Headers: Authorization: Bearer {token}
Body: {
  "amount": 100000
}
```

### 3. Get Subscription Details
```
GET /api/subscriptions/details
Headers: Authorization: Bearer {token}
```

Response:
```json
{
  "userId": "...",
  "subscriptionId": "xnd_recurring_...",
  "amount": 100000,
  "active": true,
  "targetActivityId": "...",
  "lastPaymentDate": "2025-11-17",
  "lastTargetActivityId": "...",
  "createdAt": "2025-10-17"
}
```

### 4. Update Subscription Amount
```
PATCH /api/subscriptions/update
Headers: Authorization: Bearer {token}
Body: {
  "newAmount": 150000
}
```

### 5. Cancel Subscription
```
DELETE /api/subscriptions/cancel
Headers: Authorization: Bearer {token}
```

### 6. Get Subscription History
```
GET /api/subscriptions/history
Headers: Authorization: Bearer {token}
```

### 7. Get Subscription Donations
```
GET /api/subscriptions/donations
Headers: Authorization: Bearer {token}
```

Response:
```json
{
  "subscription": {
    "amount": 100000,
    "active": true,
    "createdAt": "2025-10-17"
  },
  "totalDonations": 2,
  "totalAmount": 200000,
  "donations": [
    {
      "_id": "...",
      "amount": 100000,
      "status": "paid",
      "createdAt": "2025-11-17",
      "activity": {
        "id": "...",
        "title": "Activity A",
        "category": "environment"
      }
    },
    {
      "_id": "...",
      "amount": 100000,
      "status": "paid",
      "createdAt": "2025-10-17",
      "activity": {
        "id": "...",
        "title": "Activity B",
        "category": "charity"
      }
    }
  ]
}
```

---

## Kenapa Activity Target Bisa Beda Setiap Bulan?

**Contoh Scenario:**

**Bulan Oktober 2025:**
- Activity A: collected = 500,000 ← **TERENDAH**
- Activity B: collected = 1,000,000
- Activity C: collected = 2,000,000

User subscribe 100,000/bulan → Uang masuk ke **Activity A**

**Bulan November 2025:**
- Activity A: collected = 600,000 (sudah naik)
- Activity B: collected = 400,000 ← **TERENDAH** (banyak expense)
- Activity C: collected = 2,000,000

Recurring payment 100,000 → Uang masuk ke **Activity B**

**Bulan Desember 2025:**
- Activity A: collected = 600,000
- Activity B: collected = 500,000
- Activity C: collected = 200,000 ← **TERENDAH** (baru dibuat)

Recurring payment 100,000 → Uang masuk ke **Activity C**

---

## Testing

### Setup Xendit Test Mode
1. Set `XENDIT_SECRET_KEY` dengan test key di `.env`:
   ```
   XENDIT_SECRET_KEY=xnd_development_...
   ```

2. Xendit akan kirim webhook ke URL yang di-set di dashboard

### Simulate Recurring Payment (Testing)
Gunakan Xendit Dashboard atau API untuk trigger manual payment

### Test Webhook Locally (Ngrok)
```bash
ngrok http 3000
```
Lalu set webhook URL di Xendit dashboard:
```
https://your-ngrok-url.ngrok.io/api/subscriptions/webhook/xendit
```

---

## Database Schema

### subscriptions Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  subscriptionId: "xnd_recurring_...",  // Xendit recurring ID
  amount: 100000,
  active: true,
  targetActivityId: ObjectId,  // Activity pertama kali subscribe
  lastPaymentDate: Date,
  lastPaymentAmount: 100000,
  lastTargetActivityId: ObjectId,  // Activity terakhir dapat donasi
  createdAt: Date,
  updatedAt: Date
}
```

### donations Collection (from subscription)
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  activityId: ObjectId,  // Bisa beda-beda setiap bulan!
  amount: 100000,
  status: "paid",
  paymentMethod: "xendit_recurring",
  subscriptionId: ObjectId,  // Reference ke subscription
  xenditPaymentId: "payment_...",
  createdAt: Date,
  updatedAt: Date
}
```

---

## Benefits

✅ **Otomatis**: User tidak perlu donasi manual setiap bulan
✅ **Adil**: Uang otomatis ke activity yang paling membutuhkan
✅ **Transparan**: User bisa lihat history donasi ke activity mana saja
✅ **Flexible**: User bisa update amount atau cancel kapan saja

---

## Frontend Integration Example

```javascript
// 1. Add payment method
const addPaymentMethod = async (tokenId) => {
  const response = await fetch('/api/subscriptions/payment-method', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      type: 'CARD',
      tokenId: tokenId  // Get from Xendit.js tokenization
    })
  });
  return response.json();
};

// 2. Create subscription
const subscribe = async (amount) => {
  const response = await fetch('/api/subscriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ amount })
  });
  return response.json();
};

// 3. Get donation history
const getDonationHistory = async () => {
  const response = await fetch('/api/subscriptions/donations', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

---

## Security Notes

⚠️ **Webhook Endpoint** tidak pakai authentication karena dipanggil dari Xendit
✅ Validate webhook signature jika production (implement Xendit webhook verification)
✅ Log semua webhook events untuk audit trail
✅ Handle idempotency untuk avoid duplicate processing

---

## Troubleshooting

### Subscription tidak create
- Cek apakah user sudah add payment method
- Cek apakah amount > 0
- Cek Xendit API credentials

### Webhook tidak diterima
- Cek URL webhook di Xendit dashboard
- Cek firewall/ngrok configuration
- Cek logs untuk error

### Uang tidak masuk ke activity
- Cek webhook payload status = "SUCCEEDED"
- Cek apakah ada activity di database
- Cek logs untuk error di webhook handler
