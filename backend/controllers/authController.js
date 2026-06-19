const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

// @POST /api/auth/register
const register = async (req, res) => {
  const { name, email, password, reg_no, hostel_block, room_no, phone } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password are required' });
  }

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, reg_no, hostel_block, room_no, phone, role) VALUES (?,?,?,?,?,?,?,?)',
      [name, email, hashed, reg_no || null, hostel_block || null, room_no || null, phone || null, 'student']
    );

    const token = generateToken(result.insertId);
    res.status(201).json({
      success: true,
      token,
      user: { id: result.insertId, name, email, role: 'student', hostel_block, room_no },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND is_active = 1', [email]);
    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user.id);
    const { password: _, ...userData } = user;
    res.json({ success: true, token, user: userData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, reg_no, role, hostel_block, room_no, phone, department, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/auth/profile
const updateProfile = async (req, res) => {
  const { name, phone, hostel_block, room_no } = req.body;
  try {
    await pool.query(
      'UPDATE users SET name=?, phone=?, hostel_block=?, room_no=? WHERE id=?',
      [name, phone, hostel_block, room_no, req.user.id]
    );
    res.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @PUT /api/auth/change-password
const changePassword = async (req, res) => {
  const { current_password, new_password } = req.body;
  try {
    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    const match = await bcrypt.compare(current_password, rows[0].password);
    if (!match) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
