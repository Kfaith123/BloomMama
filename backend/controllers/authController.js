const db      = require('../config/db');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

exports.register = async (req, res) => {
  const { name, email, phone, password, language } = req.body;
  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO users (name, email, phone, password, language) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, hashed, language || 'en']
    );

    const token = signToken(result.insertId);
    res.status(201).json({ message: 'Account created', token, userId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length) return res.status(401).json({ message: 'Invalid email or password' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' });

    const token = signToken(user.id);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, language: user.language },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, phone, language, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateMe = async (req, res) => {
  const { name, phone, language } = req.body;
  try {
    await db.query(
      'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), language = COALESCE(?, language) WHERE id = ?',
      [name || null, phone || null, language || null, req.user.id]
    );
    const [rows] = await db.query(
      'SELECT id, name, email, phone, language, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    return res.status(400).json({ message: 'Both current and new password are required' });
  }
  if (new_password.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  }
  try {
    const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(current_password, rows[0].password);
    if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(new_password, 12);
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
