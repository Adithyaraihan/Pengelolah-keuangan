# Transaction API

Backend API untuk mengelola **transaksi keuangan** (pemasukan, pengeluaran, dan saldo bersih) dengan pendekatan **RESTful** dan **query-based time filtering**.

API ini dirancang agar **scalable, clean, dan sesuai praktik industri**, dengan satu endpoint per resource dan pemilihan dimensi waktu melalui query parameter.

---
## Stack Teknologi

* **Server:** Node.js, Express
* **Database:** MySQL
* **ORM:** Prisma
* **Validasi:** Yup
* **Keamanan:** JSON Web Tokens (JWT)

---

## Autentikasi dan Manajemen Pengguna

Base URL: `/api/auth`

### A. Pengaturan Token dan Keamanan

Sistem menggunakan Access Token (15 menit) dan Refresh Token (1 hari, disimpan dalam *HTTP-Only Cookie*).

* **Rotating Refresh Token:** Setelah Refresh Token digunakan untuk mendapatkan Access Token baru, token lama akan di-*invalidate* dan token baru akan diterbitkan, meningkatkan keamanan terhadap serangan *token hijacking*. 
* **Cookie Security:** Refresh Token diatur dengan `HttpOnly: true`, `secure: true` (di production), dan `SameSite: strict` untuk mitigasi XSS dan CSRF.

### B. Endpoint Autentikasi

| Metode | Endpoint | Deskripsi |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Mendaftarkan pengguna baru. | 
| `GET` | `/verify?code={...}` | Mengaktifkan akun pengguna melalui kode dari email. | 
| `POST` | `/login` | Melakukan otentikasi. Mengembalikan Access Token (Body) dan Refresh Token (Cookie). | 
| `POST` | `/refresh-token` | Memperbarui Access Token. | 

### C. Endpoint Terproteksi

Semua *endpoint* di bawah ini memerlukan *Access Token* di *header* `Authorization: Bearer <token>`.

| Metode | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/me` | Mengambil data profil pengguna yang sedang *login*. |
| `POST` | `/logout` | Mengakhiri sesi dan menghapus Refresh Token di *database* dan *cookie*. |
| `POST` | `/reset-password` | Mengubah *password*. **Catatan Penting:** Setelah berhasil, semua sesi/Refresh Token lama harus di-*invalidate* di lapisan *Service*. |

---

##  Manajemen Transaksi Keuangan

## Resource

Base URL:

```
/api/transaction
```

Resource utama:

- `transaction` → data transaksi
- `income` → total pemasukan
- `expense` → total pengeluaran
- `balance` → saldo bersih (income - expense)

---

## Create Transaction

### Endpoint

```
POST /api/transaction
```

### Request Body

```json
{
  "amount": 50000,
  "description": "Gaji freelance",
  "transactionDate": "2025-01-15",
  "paymentMethod": "Transfer",
  "category": "Gaji"
}
```

### Response

```json
{
  "message": "successfully added data",
  "data": { ... }
}
```

---

## Get Income

### Endpoint

```
GET /api/transaction/income
```

### Query Parameter (pilih salah satu)

| Scope   | Query           | Contoh               |
| ------- | --------------- | -------------------- |
| Harian  | `date`          | `?date=2025-01-15`   |
| Bulanan | `year`, `month` | `?year=2025&month=1` |
| Tahunan | `year`          | `?year=2025`         |

### Contoh Response

```json
{
  "total_income": 1500000
}
```

---

## Get Expense

### Endpoint

```
GET /api/transaction/expense
```

### Query Parameter

Sama dengan endpoint income:

- `?date=YYYY-MM-DD`
- `?year=YYYY&month=MM`
- `?year=YYYY`

### Contoh Response

```json
{
  "total_expense": 750000
}
```

---

## Get Net Balance

Saldo bersih dihitung dari:

```
net_balance = total_income - total_expense
```

### Endpoint

```
GET /api/transaction/balance
```

### Query Parameter

| Scope   | Query           | Contoh               |
| ------- | --------------- | -------------------- |
| Harian  | `date`          | `?date=2025-01-15`   |
| Bulanan | `year`, `month` | `?year=2025&month=1` |
| Tahunan | `year`          | `?year=2025`         |

### Contoh Response

```json
{
  "net_balance": 750000
}
```

---

## Aturan Prioritas Query

Jika beberapa query dikirim bersamaan, API akan memproses dengan urutan:

1. `date`
2. `year + month`
3. `year`

Contoh:

```
GET /income?year=2025&month=1&date=2025-01-01
```

➡️ **Akan dianggap sebagai data harian (date)**

---

## Error Handling

### Invalid Query

```json
{
  "error": "Provide date OR year/month OR year"
}
```

### Validation Error (Create Transaction)

```json
{
  "error": "amount is required"
}
```

---

## Arsitektur Layer

```
Controller
   ↓
Service
   ↓
Repository (Prisma)
```

### Controller

- Mengambil query & body
- Validasi request
- Menentukan scope waktu

### Service

- Business logic
- Perhitungan saldo
- Komposisi data income & expense

### Repository

- Query database
- Tidak mengandung logika bisnis

---


## Update & Delete Transaction

### Update Transaction

`PUT /api/transaction/:id`

**URL Params**

- `id` : ID transaksi yang ingin diubah

**Request Body (partial)**

```json
{
  "amount": 500000,
  "description": "Update bonus",
  "transactionDate": "2025-01-02T00:00:00.000Z",
  "paymentMethod": "CASH",
  "category": "Gaji"
}
```

**Response**

```json
{
  "message": "Transaction updated successfully",
  "data": {
    /* updated transaction */
  }
}
```

---

### Delete Transaction

`DELETE /api/transaction/:id`

**URL Params**

- `id` : ID transaksi yang ingin dihapus

**Response**

```json
{
  "message": "Transaction deleted successfully"
}
```
