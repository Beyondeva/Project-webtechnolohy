# 🏠 DormFix — ระบบแจ้งซ่อมหอพัก

ระบบจัดการแจ้งซ่อมสำหรับหอพัก พัฒนาด้วย React + Node.js + MySQL  
รองรับ 3 บทบาท: **ผู้พักอาศัย**, **ช่างซ่อม**, และ **ผู้ดูแลระบบ (Admin)**

---

## 📦 Tech Stack ที่ใช้

| ส่วน | เทคโนโลยี |
|------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Axios, Lucide React, React Router v7 |
| **Backend** | Node.js, Express.js, Multer (อัปโหลดรูป), mysql2/promise |
| **Database** | MySQL (utf8mb4) |
| **Host** | AppServ (Apache + MySQL + phpMyAdmin) |

---

## 🔧 โปรแกรมที่ต้องติดตั้ง

1. **[AppServ](https://www.appservnetwork.com/)** — ใช้สำหรับ MySQL + phpMyAdmin
2. **[Node.js](https://nodejs.org/)** (v18 ขึ้นไป) — ใช้รัน Backend และ Frontend
3. **Git** (ถ้าต้องการ clone จาก GitHub)

---

## 🚀 ขั้นตอนการติดตั้งและใช้งาน

### 1. Clone โปรเจกต์

```bash
cd C:\AppServ\www
git clone https://github.com/Beyondeva/Project-webtechnolohy.git PJWEB
```

> 📁 วางโฟลเดอร์โปรเจกต์ไว้ที่ `C:\AppServ\www\PJWEB`

---

### 2. Import ฐานข้อมูล MySQL ผ่าน phpMyAdmin

1. เปิด AppServ แล้วเข้า **phpMyAdmin**: [http://localhost/phpMyAdmin](http://localhost/phpMyAdmin)
2. Login ด้วย user `root` และรหัสผ่านที่ตั้งไว้ตอนลง AppServ
3. คลิกแท็บ **"Import"** ด้านบน
4. กด **"Choose File"** → เลือกไฟล์ `C:\AppServ\www\PJWEB\database.sql`
5. กดปุ่ม **"Import"** (ด้านล่าง)

> ✅ ระบบจะสร้างฐานข้อมูล `dorm_maintenance` พร้อมตาราง `users`, `tickets` และ demo users 6 คน

---

### 3. แก้ไขการเชื่อมต่อ Database

เปิดไฟล์ `server.js` แก้ไข **บรรทัดที่ 33-41**:

```js
// --------------- MySQL Connection Pool ---------------
const pool = mysql.createPool({
  host: 'localhost',       // ← ที่อยู่ MySQL Server
  user: 'root',            // ← ชื่อผู้ใช้ MySQL
  password: '12345678a',   // ← ⚠️ เปลี่ยนเป็นรหัส MySQL ของคุณ
  database: 'dorm_maintenance',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});
```

> ⚠️ **สำคัญ**: เปลี่ยน `password` ให้ตรงกับรหัสผ่าน root ของ MySQL ที่ตั้งไว้ตอนลง AppServ

---

### 4. ติดตั้ง Dependencies

เปิด Terminal (Command Prompt / PowerShell) แล้วรันคำสั่ง:

```bash
# ติดตั้ง Backend dependencies
cd C:\AppServ\www\PJWEB
npm install

# ติดตั้ง Frontend dependencies
cd client
npm install
```

---

### 5. รันระบบ

เปิด **2 Terminal** พร้อมกัน:

**Terminal 1 — Backend (Port 5000):**
```bash
cd C:\AppServ\www\PJWEB
node server.js
```
> จะแสดง: `🚀 Server running on http://localhost:5000`

**Terminal 2 — Frontend (Port 5173):**
```bash
cd C:\AppServ\www\PJWEB\client
npm run dev
```
> จะแสดง: `➜ Local: http://localhost:5173/`

---

### 6. เปิดใช้งาน

เปิดเบราว์เซอร์แล้วไปที่ **[http://localhost:5173](http://localhost:5173)**

---

## 👤 บัญชีทดลองใช้งาน (Demo Users)

| Username | Password | บทบาท |
|----------|----------|-------|
| `user1` | `pass1` | ผู้พักอาศัย |
| `user2` | `pass2` | ผู้พักอาศัย |
| `user3` | `pass3` | ผู้พักอาศัย |
| `tech1` | `pass1` | ช่างซ่อม |
| `tech2` | `pass2` | ช่างซ่อม |
| `admin` | `admin123` | ผู้ดูแลระบบ |

---

## 📂 โครงสร้างโปรเจกต์

```
PJWEB/
├── server.js          ← Backend API (Express.js)
├── database.sql       ← SQL สร้างฐานข้อมูล
├── package.json       ← Backend dependencies
├── .gitignore
├── uploads/           ← รูปภาพที่อัปโหลด (สร้างอัตโนมัติ)
└── client/            ← Frontend (React + Vite)
    ├── src/
    │   ├── api.js             ← Axios config
    │   ├── App.jsx            ← Routes
    │   ├── index.css          ← Tailwind styles
    │   ├── context/
    │   │   └── AuthContext.jsx ← จัดการ Login state
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── ProtectedRoute.jsx
    │   └── pages/
    │       ├── Login.jsx       ← หน้าเข้าสู่ระบบ
    │       ├── Dashboard.jsx   ← หน้าแดชบอร์ด
    │       ├── CreateTicket.jsx← หน้าแจ้งซ่อม
    │       ├── TicketDetail.jsx← หน้ารายละเอียดคำร้อง
    │       ├── Users.jsx       ← หน้าจัดการผู้ใช้ (Admin)
    │       └── Profile.jsx     ← หน้าโปรไฟล์
    └── package.json    ← Frontend dependencies
```

---

## ✨ ฟีเจอร์หลัก

- 🔐 ระบบ Login 3 บทบาท (ผู้พักอาศัย / ช่างซ่อม / แอดมิน)
- 📝 แจ้งซ่อมพร้อมแนบรูปภาพ
- 🔧 ช่างรับงาน / อัปโหลดรูปหลังซ่อม / ยกเลิกงาน (พร้อมเหตุผล)
- ⭐ ผู้พักอาศัยให้คะแนนและรีวิวช่าง
- 👤 แก้ไขโปรไฟล์ (ชื่อ, รูปภาพ, รหัสผ่าน, ชื่อผู้ใช้)
- 🛡️ แอดมินสร้างบัญชี / แก้ไขข้อมูลผู้ใช้ / ดูรหัสผ่าน
- 🌙 ธีมมืด Glassmorphism สวยงาม
