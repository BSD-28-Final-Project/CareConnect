# Subscription Flow Diagram (CareConnect)

## Overview
Dokumentasi ini menjelaskan alur lengkap fitur Subscription pada CareConnect, termasuk:
- User subscribe
- Sistem menentukan activity dengan collectedMoney terendah
- Auto-charge bulanan via Xendit
- Webhook penerimaan dana
- Update distribusi donasi

---

## 1. User Subscribe Flow

```mermaid
flowchart TD
    A[User Membuka App] --> B[User Login]
    B --> C[User pilih 'Subscribe']
    C --> D[User input amount bulanan]
    D --> E[Backend: Cari Activity dengan collectedMoney paling rendah]
    E --> F[Xendit: Create Recurring Payment]
    F --> G[Return subscriptionId ke Backend]
    G --> H[Simpan subscription ke DB]
    H --> I[Return sukses ke User]
```

---

## 2. Auto-Charge Monthly Flow (Xendit Recurring)

```mermaid
flowchart TD
    A[Xendit Menjalankan Auto-Charge Bulanan] --> B[Charge attempt]
    B --> C{Charge Success?}

    C -->|YES| D[Xendit kirim webhook ke /subscription/webhook]
    D --> E[Backend verifikasi signature]
    E --> F[Update donation record ke Activity terkait]
    F --> G[Tambah collectedMoney activity]
    G --> H[Simpan log pembayaran]

    C -->|NO| X[Store failed charge + notify user]
```

---

## 3. Cancel Subscription Flow

```mermaid
flowchart TD
    A[User buka profile] --> B[Klik Cancel Subscription]
    B --> C[Backend: Hit Xendit Cancel Recurring]
    C --> D[Xendit confirm cancellation]
    D --> E[Backend update subscription.isActive = false]
    E --> F[Return sukses]
```

---

## 4. Distribution Logic (Activity Dengan Dana Terkumpul Terendah)

```mermaid
flowchart TD
    A[User subscribe] --> B[Backend ambil semua activity]
    B --> C[Sort by collectedMoney ASC]
    C --> D[Ambil activity dengan collectedMoney terendah]
    D --> E[Assign subscription ke activity tersebut]
```

---

## 5. Webhook Flow Detail

```mermaid
sequenceDiagram
    participant X as Xendit
    participant API as Backend API
    participant DB as MongoDB

    X->>API: Send recurring.charge.success webhook
    API->>API: Verify signature XENDIT_WEBHOOK_TOKEN
    API->>DB: Save transaction log
    API->>DB: Update selected activity collectedMoney += amount
    API-->>X: 200 OK
```

---

## 6. Data Model Interaksi

### Collections yang terlibat:
- `users`
- `subscriptions`
- `activities`
- `donations`
- `payment_logs`

---

## End of Flow
