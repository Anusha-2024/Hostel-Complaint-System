const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

// @GET /api/users/staff
const getStaffList = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.department, u.is_active,
              COUNT(c.id) as active_complaints
       FROM users u
       LEFT JOIN complaints c ON u.id = c.assigned_to AND c.status NOT IN ('Resolved','Closed')
       WHERE u.role = 'staff'
       GROUP BY u.id ORDER BY u.name`,
    );
    res.json({ success: true, staff: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    let where = ['u.id != ?'];
    let params = [req.user.id];

    if (role) { where.push('u.role = ?'); params.push(role); }
    if (search) { where.push('(u.name LIKE ? OR u.email LIKE ? OR u.reg_no LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT u.id, u.name, u.email, u.reg_no, u.role, u.hostel_block, u.room_no, u.department, u.is_active, u.created_at
       FROM users u WHERE ${where.join(' AND ')} ORDER BY u.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM users u WHERE ${where.join(' AND ')}`, params
    );

    res.json({ success: true, users: rows, total, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/users (admin create staff/user)
const createUser = async (req, res) => {
  const { name, email, password, role, hostel_block, room_no, reg_no, phone, department } = req.body;

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(400).json({ success: false, message: 'Email already exists' });

    const hashed = await bcrypt.hash(password || 'Password@123', 10);
    await pool.query(
      'INSERT INTO users (name, email, password, role, hostel_block, room_no, reg_no, phone, department) VALUES (?,?,?,?,?,?,?,?,?)',
      [name, email, hashed, role || 'student', hostel_block, room_no, reg_no, phone, department]
    );

    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/users/:id/toggle
const toggleUser = async (req, res) => {
  try {
    await pool.query('UPDATE users SET is_active = NOT is_active WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'User status toggled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/users/notifications
const getNotifications = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT n.*, c.complaint_id FROM notifications n
       LEFT JOIN complaints c ON n.complaint_id = c.id
       WHERE n.user_id = ? ORDER BY n.created_at DESC LIMIT 20`,
      [req.user.id]
    );
    const [[{ unread }]] = await pool.query(
      'SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = 0', [req.user.id]
    );
    res.json({ success: true, notifications: rows, unread });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/users/notifications/read
const markNotificationsRead = async (req, res) => {
  try {
    await pool.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ success: true, message: 'Notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/users/sla-config
const getSLAConfig = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sla_config ORDER BY category');
    res.json({ success: true, sla: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/users/sla-config
const updateSLAConfig = async (req, res) => {
  const { category, hours_limit } = req.body;
  try {
    await pool.query('UPDATE sla_config SET hours_limit = ? WHERE category = ?', [hours_limit, category]);
    res.json({ success: true, message: 'SLA config updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/users/staff-category
const assignStaffCategory = async (req, res) => {
  const { staff_id, category } = req.body;
  try {
    await pool.query('INSERT INTO staff_category (staff_id, category) VALUES (?,?)', [staff_id, category]);
    res.status(201).json({ success: true, message: 'Staff assigned to category' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/users/staff-category
const getStaffCategories = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sc.*, u.name as staff_name FROM staff_category sc
       JOIN users u ON sc.staff_id = u.id ORDER BY sc.category`
    );
    res.json({ success: true, staffCategories: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @DELETE /api/users/staff-category/:id
const removeStaffCategory = async (req, res) => {
  try {
    await pool.query('DELETE FROM staff_category WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Mapping removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getStaffList, getAllUsers, createUser, toggleUser, getNotifications, markNotificationsRead,
  getSLAConfig, updateSLAConfig, assignStaffCategory, getStaffCategories, removeStaffCategory,
};
