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

เปิด Terminal (Command Prompt / PowerShell) แล้วรันคำสั่งตามลำดับ:

#### 4.1 ติดตั้ง Backend dependencies

```bash
cd C:\AppServ\www\PJWEB
npm install
```

**แพ็กเกจที่จะถูกติดตั้ง (4 ตัว):**

| แพ็กเกจ | เวอร์ชัน | หน้าที่ |
|---------|---------|--------|
| `express` | ^4.18.2 | Web framework สำหรับสร้าง API |
| `cors` | ^2.8.5 | อนุญาต Cross-Origin requests (Frontend → Backend) |
| `multer` | ^1.4.5-lts.1 | จัดการอัปโหลดไฟล์รูปภาพ |
| `mysql2` | ^3.18.0 | เชื่อมต่อกับฐานข้อมูล MySQL |

> ✅ `npm install` จะอ่าน `package.json` แล้วติดตั้งอัตโนมัติ **ไม่มีคำถาม Yes/No** ใดๆ  
> รอจนแสดง `added XX packages` แปลว่าเสร็จเรียบร้อย

**ตัวอย่างผลลัพธ์ที่ควรเห็น:**
```
added 68 packages, and audited 69 packages in 5s

12 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

---

#### 4.2 ติดตั้ง Frontend dependencies

```bash
cd client
npm install
```

**แพ็กเกจที่จะถูกติดตั้ง:**

| ประเภท | แพ็กเกจ | เวอร์ชัน | หน้าที่ |
|--------|---------|---------|--------|
| dependencies | `react` | ^19.2.0 | ไลบรารีหลักสำหรับ UI |
| dependencies | `react-dom` | ^19.2.0 | เชื่อม React กับ DOM (เบราว์เซอร์) |
| dependencies | `react-router-dom` | ^7.13.1 | จัดการเส้นทาง URL (Routing) |
| dependencies | `axios` | ^1.13.5 | เรียก API จาก Backend |
| dependencies | `tailwindcss` | ^4.2.1 | CSS Framework สำหรับจัดรูปแบบ |
| dependencies | `@tailwindcss/vite` | ^4.2.1 | Plugin เชื่อม Tailwind กับ Vite |
| dependencies | `lucide-react` | ^0.575.0 | ชุดไอคอน (เช่น Wrench, Users, Sun, Moon) |
| devDependencies | `vite` | ^7.3.1 | Build tool / Dev server |
| devDependencies | `@vitejs/plugin-react` | ^5.1.1 | Plugin ให้ Vite รองรับ React |
| devDependencies | `eslint` | ^9.39.1 | ตรวจสอบคุณภาพโค้ด |
| devDependencies | `eslint-plugin-react-hooks` | ^7.0.1 | ตรวจสอบการใช้ React Hooks |
| devDependencies | `eslint-plugin-react-refresh` | ^0.4.24 | ตรวจสอบ React Refresh |
| devDependencies | `globals` | ^16.5.0 | กำหนดตัวแปร global สำหรับ ESLint |
| devDependencies | `@eslint/js` | ^9.39.1 | ESLint config สำหรับ JavaScript |
| devDependencies | `@types/react` | ^19.2.7 | TypeScript types (สำหรับ IDE) |
| devDependencies | `@types/react-dom` | ^19.2.3 | TypeScript types (สำหรับ IDE) |

> ✅ เช่นเดียวกันกับ Backend — **ไม่มีคำถาม Yes/No** ใดๆ  
> รอจนแสดง `added XX packages` แปลว่าเสร็จเรียบร้อย

**ตัวอย่างผลลัพธ์ที่ควรเห็น:**
```
added 288 packages, and audited 289 packages in 15s

102 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
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
    │   │   ├── AuthContext.jsx ← จัดการ Login state
    │   │   └── ThemeContext.jsx← จัดการธีม (มืด/สว่าง)
    │   ├── hooks/
    │   │   └── useThemeClasses.js ← Hook สำหรับ class ธีม
    │   ├── components/
    │   │   ├── Navbar.jsx     ← แถบนำทาง + ปุ่มเปลี่ยนธีม
    │   │   ├── StarRating.jsx ← ดาวให้คะแนน
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
- 🌗 สลับธีมมืด/สว่าง (Dark/Light Mode) พร้อมจดจำค่าที่เลือกไว้
