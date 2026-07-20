const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

// MySQL Connection Configuration for XAMPP (default: host localhost, user root, no password)
const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ima_therapy_center',
  port: parseInt(process.env.DB_PORT || '3306'),
  multipleStatements: true
};

let pool;

async function initDatabase() {
  try {
    // 1. Ensure database exists
    const tempConn = await mysql.createConnection({
      host: DB_CONFIG.host,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      port: DB_CONFIG.port
    });
    await tempConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await tempConn.end();

    // 2. Create main connection pool
    pool = mysql.createPool(DB_CONFIG);

    // 3. Clean up any extra users beyond the 5 core accounts
    try {
      await pool.query('DELETE FROM users WHERE id > 5;');
    } catch (e) {}

    // 4. Ensure students table exists (migrate children table to students if needed)
    try {
      await pool.query('RENAME TABLE children TO students;');
    } catch (e) {}

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS \`students\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`branch_id\` INT NOT NULL DEFAULT 1,
          \`therapy_type_id\` INT NOT NULL,
          \`full_name\` VARCHAR(100) NOT NULL,
          \`dob\` DATE NOT NULL,
          \`gender\` ENUM('male', 'female', 'other') NOT NULL,
          \`enrollment_date\` DATE NOT NULL,
          \`status\` ENUM('active', 'inactive', 'graduated') NOT NULL DEFAULT 'active',
          \`father_name\` VARCHAR(100) DEFAULT '',
          \`father_phone\` VARCHAR(30) DEFAULT '',
          \`mother_name\` VARCHAR(100) DEFAULT '',
          \`mother_phone\` VARCHAR(30) DEFAULT '',
          \`emergency_contact_name\` VARCHAR(100) DEFAULT '',
          \`emergency_contact_phone\` VARCHAR(30) DEFAULT ''
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
      await pool.query(`
        INSERT IGNORE INTO \`students\` (\`id\`, \`branch_id\`, \`therapy_type_id\`, \`full_name\`, \`dob\`, \`gender\`, \`enrollment_date\`, \`status\`, \`father_name\`, \`father_phone\`, \`mother_name\`, \`mother_phone\`, \`emergency_contact_name\`, \`emergency_contact_phone\`) VALUES
        (1, 1, 1, 'Ethan Wijesinghe', '2019-04-12', 'male', '2025-01-15', 'active', 'Sunil Wijesinghe', '0776789012', 'Malkanthi Wijesinghe', '0776789013', 'Sunil Wijesinghe', '0776789012'),
        (2, 1, 2, 'Kavinya Perera', '2020-08-22', 'female', '2025-02-01', 'active', 'Nimal Perera', '0712345678', 'Kamani Perera', '0712345679', 'Nimal Perera', '0712345678');
      `);
    } catch (e) {}

    console.log(`🚀 Connected to XAMPP MySQL Database '${DB_CONFIG.database}' at ${DB_CONFIG.host}:${DB_CONFIG.port}`);
  } catch (error) {
    console.error("❌ XAMPP MySQL Connection Error:", error.message);
  }
}

// API Health check
app.get('/api/status', async (req, res) => {
  try {
    if (!pool) return res.status(500).json({ status: 'offline', message: 'Database pool not initialized' });
    const [rows] = await pool.query('SELECT 1');
    res.json({ status: 'online', database: DB_CONFIG.database, mode: 'XAMPP Local MySQL' });
  } catch (err) {
    res.status(500).json({ status: 'offline', error: err.message });
  }
});

// GET Users
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, branch_id, role_id, role, name, email, phone, status, username FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Create User
app.post('/api/users', async (req, res) => {
  try {
    const { role, name, email, phone, username, password, relationship, childId } = req.body;
    let role_id = 4;
    if (role === 'super_admin') role_id = 1;
    else if (role === 'admin') role_id = 2;
    else if (role === 'principal') role_id = 3;
    else if (role === 'parent') role_id = 5;

    const passToStore = password || 'defaultpassword';
    const user_name = username || name.toLowerCase().replace(/\s+/g, '');

    const [result] = await pool.query(
      'INSERT INTO users (branch_id, role_id, role, name, email, phone, status, username, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [1, role_id, role, name, email, phone, 'active', user_name, passToStore]
    );

    const newUserId = result.insertId;

    if (role === 'parent' && childId && relationship) {
      await pool.query(
        'INSERT INTO parent_child_links (parent_user_id, child_id, relationship) VALUES (?, ?, ?)',
        [newUserId, childId, relationship]
      );
    }

    res.json({ success: true, id: newUserId, username: user_name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Children
app.get('/api/children', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM children');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Parent-Child Links
app.get('/api/parent_child_links', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM parent_child_links');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Therapy Types
app.get('/api/therapy_types', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM therapy_types');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Therapy Type
app.post('/api/therapy_types', async (req, res) => {
  try {
    const { name, description, color_tag } = req.body;
    const [result] = await pool.query(
      'INSERT INTO therapy_types (branch_id, name, description, color_tag) VALUES (?, ?, ?, ?)',
      [1, name, description || '', color_tag || '#8B5CF6']
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Sessions
app.get('/api/sessions', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sessions');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Sessions
app.post('/api/sessions', async (req, res) => {
  try {
    const { child_id, trainer_id, therapy_type_id, session_date, start_time, end_time, is_recurring, recurrence_rule } = req.body;
    const [result] = await pool.query(
      'INSERT INTO sessions (branch_id, child_id, trainer_id, therapy_type_id, session_date, start_time, end_time, is_recurring, recurrence_rule, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [1, child_id, trainer_id, therapy_type_id, session_date, start_time, end_time, is_recurring ? 1 : 0, recurrence_rule || 'NONE', 'scheduled']
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Attendance
app.get('/api/attendance', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM attendance');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Progress Reports
app.get('/api/progress_reports', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM progress_reports');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Progress Report
app.post('/api/progress_reports', async (req, res) => {
  try {
    const { child_id, trainer_id, session_id, report_date, notes, visible_to_parent } = req.body;
    const [result] = await pool.query(
      'INSERT INTO progress_reports (child_id, trainer_id, session_id, report_date, notes, visible_to_parent) VALUES (?, ?, ?, ?, ?, ?)',
      [child_id, trainer_id || 1, session_id || null, report_date, notes, visible_to_parent ? 1 : 0]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Behavior Reports
app.get('/api/behavior_reports', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM behavior_reports');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Behavior Report
app.post('/api/behavior_reports', async (req, res) => {
  try {
    const { child_id, trainer_id, report_date, nature_of_incident, triggers_causes, actions_taken, follow_up_observations } = req.body;
    const [result] = await pool.query(
      'INSERT INTO behavior_reports (child_id, trainer_id, report_date, nature_of_incident, triggers_causes, actions_taken, follow_up_observations, status, visibility) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [child_id, trainer_id || 1, report_date, nature_of_incident, triggers_causes || '', actions_taken || '', follow_up_observations || '', 'pending_review', 'public']
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Academic Calendar Events
app.get('/api/academic_calendar_events', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM academic_calendar_events');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Student (also aliased as /api/children)
const postStudentHandler = async (req, res) => {
  try {
    const { therapy_type_id, full_name, dob, gender, status, father_name, father_phone, mother_name, mother_phone, emergency_contact_name, emergency_contact_phone } = req.body;
    const [result] = await pool.query(
      'INSERT INTO students (branch_id, therapy_type_id, full_name, dob, gender, enrollment_date, status, father_name, father_phone, mother_name, mother_phone, emergency_contact_name, emergency_contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [1, therapy_type_id || 1, full_name, dob || '2020-01-01', gender || 'male', new Date().toISOString().split('T')[0], status || 'active', father_name || '', father_phone || '', mother_name || '', mother_phone || '', emergency_contact_name || '', emergency_contact_phone || '']
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
app.post('/api/students', postStudentHandler);
app.post('/api/children', postStudentHandler);

// POST Attendance Mark
app.post('/api/attendance', async (req, res) => {
  try {
    const { session_id, marked_by_trainer_id, marked_via, notes } = req.body;
    const nowStr = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const [result] = await pool.query(
      'INSERT INTO attendance (session_id, check_in_time, marked_by_trainer_id, marked_via, notes) VALUES (?, ?, ?, ?, ?)',
      [session_id, nowStr, marked_by_trainer_id || 1, marked_via || 'web_manual', notes || '']
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Academic Calendar Event
app.post('/api/academic_calendar_events', async (req, res) => {
  try {
    const { title, description, event_date, end_date, event_type } = req.body;
    const [result] = await pool.query(
      'INSERT INTO academic_calendar_events (branch_id, title, description, event_date, end_date, event_type) VALUES (?, ?, ?, ?, ?, ?)',
      [1, title, description || '', event_date, end_date || null, event_type || 'holiday']
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Review Behavior Report
app.put('/api/behavior_reports/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, principal_comment } = req.body;
    await pool.query(
      'UPDATE behavior_reports SET status = ?, principal_comment = ? WHERE id = ?',
      [status, principal_comment || '', id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Student Status
app.put('/api/students/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query(
      'UPDATE students SET status = ? WHERE id = ?',
      [status, id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Change Password
app.post('/api/change_password', async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    await pool.query(
      'UPDATE users SET password = ? WHERE LOWER(username) = LOWER(?) OR LOWER(role) = LOWER(?)',
      [newPassword, username, username]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET Passwords Map
app.get('/api/passwords', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT username, password, role FROM users');
    const map = {};
    for (const r of rows) {
      if (r.username && r.password) {
        map[r.username.toLowerCase()] = r.password;
      }
      if (r.role) {
        map[r.role.replace('_', '')] = r.password;
      }
    }
    res.json(map);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🌐 Server running on http://localhost:${PORT}`);
  initDatabase();
});
