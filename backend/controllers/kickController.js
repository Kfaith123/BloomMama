const db = require('../config/db');

exports.addKickCount = async (req, res) => {
  const { kicks, date, notes } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO kick_counts (user_id, kicks, date, notes) VALUES (?, ?, ?, ?)',
      [req.user.id, kicks, date || new Date().toISOString().split('T')[0], notes || null]
    );
    res.status(201).json({ message: 'Kick count saved', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getKickCounts = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM kick_counts WHERE user_id = ? ORDER BY date DESC LIMIT 30',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getTodayKicks = async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  try {
    const [rows] = await db.query(
      'SELECT SUM(kicks) AS total_kicks FROM kick_counts WHERE user_id = ? AND date = ?',
      [req.user.id, today]
    );
    res.json({ date: today, total_kicks: rows[0].total_kicks || 0 });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
