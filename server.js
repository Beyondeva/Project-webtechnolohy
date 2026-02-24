const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 5000;

// --------------- Middleware ---------------
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --------------- Multer Config ---------------
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});
const upload = multer({ storage });

// --------------- MySQL Connection Pool ---------------
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '12345678a',
  database: 'dorm_maintenance',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
});

// --------------- API Routes ---------------

// --- Login ---
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน' });
    }
    const [rows] = await pool.execute(
      'SELECT id, username, role, name, avatar FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
  }
});

// --- Get Tickets (role-based) ---
app.get('/api/tickets', async (req, res) => {
  try {
    const { role, userId } = req.query;

    let query = `
      SELECT t.*, 
        u1.name as creator_name, 
        u2.name as technician_name
      FROM tickets t
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.technician_id = u2.id
    `;
    let params = [];

    if (role === 'user') {
      query += ' WHERE t.created_by = ?';
      params.push(userId);
    } else if (role === 'technician') {
      query += ' WHERE t.technician_id = ? OR t.technician_id IS NULL';
      params.push(userId);
    }
    // admin sees all — no WHERE clause

    query += ' ORDER BY t.created_at DESC';

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
  }
});

// --- Get Single Ticket ---
app.get('/api/tickets/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT t.*, 
        u1.name as creator_name, 
        u2.name as technician_name
      FROM tickets t
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.technician_id = u2.id
      WHERE t.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'ไม่พบคำร้องนี้' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
  }
});

// --- Create Ticket ---
app.post('/api/tickets', upload.single('image_before'), async (req, res) => {
  try {
    const { title, description, room_number, created_by } = req.body;
    if (!title || !created_by) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }
    const imageBefore = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.execute(
      `INSERT INTO tickets (title, description, room_number, created_by, image_before)
       VALUES (?, ?, ?, ?, ?)`,
      [title, description || null, room_number || null, created_by, imageBefore]
    );

    const [newRows] = await pool.execute('SELECT * FROM tickets WHERE id = ?', [result.insertId]);
    res.status(201).json(newRows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
  }
});

// --- Update Ticket ---
app.put('/api/tickets/:id', upload.single('image_after'), async (req, res) => {
  try {
    const [existing] = await pool.execute('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'ไม่พบคำร้องนี้' });
    }
    const ticket = existing[0];

    const { status, technician_id, rating, review } = req.body;
    const imageAfter = req.file ? `/uploads/${req.file.filename}` : ticket.image_after;

    // Build dynamic update
    let updates = [];
    let params = [];

    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (technician_id !== undefined) {
      updates.push('technician_id = ?');
      params.push(technician_id === 'null' || technician_id === null ? null : technician_id);
    }
    if (imageAfter !== ticket.image_after) {
      updates.push('image_after = ?');
      params.push(imageAfter);
    }
    if (rating !== undefined) {
      updates.push('rating = ?');
      params.push(parseInt(rating));
    }
    if (review !== undefined) {
      updates.push('review = ?');
      params.push(review);
    }
    if (req.body.cancel_reason !== undefined) {
      updates.push('cancel_reason = ?');
      params.push(req.body.cancel_reason);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'ไม่มีข้อมูลที่ต้องอัปเดต' });
    }

    params.push(req.params.id);
    await pool.execute(
      `UPDATE tickets SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const [updatedRows] = await pool.execute(
      `SELECT t.*, 
        u1.name as creator_name, 
        u2.name as technician_name
      FROM tickets t
      LEFT JOIN users u1 ON t.created_by = u1.id
      LEFT JOIN users u2 ON t.technician_id = u2.id
      WHERE t.id = ?`,
      [req.params.id]
    );
    res.json(updatedRows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
  }
});

// --- Delete Ticket ---
app.delete('/api/tickets/:id', async (req, res) => {
  try {
    const { role, userId } = req.query;
    const [existing] = await pool.execute('SELECT * FROM tickets WHERE id = ?', [req.params.id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'ไม่พบคำร้องนี้' });
    }
    const ticket = existing[0];

    // Admin can delete any; User can delete own if Pending
    if (role === 'admin') {
      // allowed
    } else if (
      role === 'user' &&
      ticket.created_by === parseInt(userId) &&
      ticket.status === 'Pending'
    ) {
      // allowed
    } else {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์ลบคำร้องนี้' });
    }

    await pool.execute('DELETE FROM tickets WHERE id = ?', [req.params.id]);
    res.json({ message: 'ลบคำร้องเรียบร้อยแล้ว' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
  }
});

// --- Get Users (Admin) ---
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, username, password, role, name, avatar FROM users ORDER BY role, name'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
  }
});

// --- Create User (Admin) ---
app.post('/api/users', async (req, res) => {
  try {
    const { username, password, role, name } = req.body;
    if (!username || !password || !role || !name) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }
    if (!['user', 'technician'].includes(role)) {
      return res.status(400).json({ error: 'สามารถสร้างได้เฉพาะผู้พักอาศัยหรือช่างซ่อมเท่านั้น' });
    }

    // Check duplicate username
    const [existing] = await pool.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' });
    }

    const [result] = await pool.execute(
      'INSERT INTO users (username, password, role, name) VALUES (?, ?, ?, ?)',
      [username, password, role, name]
    );

    res.status(201).json({ id: result.insertId, username, role, name });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
  }
});

// --- Update User Profile ---
app.put('/api/users/:id', upload.single('avatar'), async (req, res) => {
  try {
    const targetId = req.params.id;
    const { requesterId, requesterRole } = req.body;

    // Get target user
    const [targets] = await pool.execute('SELECT * FROM users WHERE id = ?', [targetId]);
    if (targets.length === 0) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้นี้' });
    }
    const targetUser = targets[0];

    const isSelf = String(requesterId) === String(targetId);
    const isAdmin = requesterRole === 'admin';

    // Permission check
    if (!isSelf && !isAdmin) {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์แก้ไขข้อมูลผู้ใช้นี้' });
    }

    // Admin editing themselves: can only change avatar
    // Admin editing others (user/tech): can change username, name, password, avatar
    // User/Tech editing themselves: can change username, name, password, avatar

    let updates = [];
    let params = [];

    const { username, name, password } = req.body;
    const avatar = req.file ? `/uploads/${req.file.filename}` : undefined;

    // Check duplicate username if changing
    if (username && username !== targetUser.username) {
      const [dup] = await pool.execute('SELECT id FROM users WHERE username = ? AND id != ?', [username, targetId]);
      if (dup.length > 0) {
        return res.status(409).json({ error: 'ชื่อผู้ใช้นี้ถูกใช้งานแล้ว' });
      }
    }

    if (isSelf && isAdmin) {
      // Admin self: only avatar
      if (avatar) {
        updates.push('avatar = ?');
        params.push(avatar);
      }
    } else if (isAdmin && !isSelf) {
      // Admin editing user/tech: username, name, password, avatar
      if (targetUser.role === 'admin') {
        return res.status(403).json({ error: 'ไม่สามารถแก้ไขข้อมูลแอดมินคนอื่นได้' });
      }
      if (username && username !== targetUser.username) { updates.push('username = ?'); params.push(username); }
      if (name) { updates.push('name = ?'); params.push(name); }
      if (password) { updates.push('password = ?'); params.push(password); }
      if (avatar) { updates.push('avatar = ?'); params.push(avatar); }
    } else {
      // User/Tech editing self: username, name, password, avatar
      if (username && username !== targetUser.username) { updates.push('username = ?'); params.push(username); }
      if (name) { updates.push('name = ?'); params.push(name); }
      if (password) { updates.push('password = ?'); params.push(password); }
      if (avatar) { updates.push('avatar = ?'); params.push(avatar); }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'ไม่มีข้อมูลที่ต้องอัปเดต' });
    }

    params.push(targetId);
    await pool.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

    const [updated] = await pool.execute(
      'SELECT id, username, role, name, avatar FROM users WHERE id = ?',
      [targetId]
    );
    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
  }
});

// --- Get Technicians ---
app.get('/api/technicians', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, username, name FROM users WHERE role = 'technician' ORDER BY name"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
  }
});

// --- Get Technician Ratings (Admin dashboard) ---
app.get('/api/technician-ratings', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        u.id,
        u.name,
        COUNT(t.rating) as total_ratings,
        ROUND(AVG(t.rating), 1) as avg_rating,
        COUNT(t.id) as total_tickets
      FROM users u
      LEFT JOIN tickets t ON t.technician_id = u.id
      WHERE u.role = 'technician'
      GROUP BY u.id
      ORDER BY avg_rating DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดบนเซิร์ฟเวอร์' });
  }
});

// --------------- Start Server ---------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
