const db = require('../config/db');

exports.addLog = async (req, res) => {
  const { weight, blood_pressure, temperature, mood, notes } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO health_logs (user_id, weight, blood_pressure, temperature, mood, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, weight || null, blood_pressure || null, temperature || null, mood || null, notes || null]
    );
    res.status(201).json({ message: 'Health log saved', logId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getLogs = async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page  = parseInt(req.query.page)  || 1;
  const offset = (page - 1) * limit;
  try {
    const [rows] = await db.query(
      'SELECT * FROM health_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [req.user.id, limit, offset]
    );
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) AS total FROM health_logs WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ logs: rows, total, page, limit });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteLog = async (req, res) => {
  try {
    await db.query('DELETE FROM health_logs WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Log deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
