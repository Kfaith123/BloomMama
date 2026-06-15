const db = require('../config/db');

exports.createReminder = async (req, res) => {
  const { type, title, time, repeat_days } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO reminders (user_id, type, title, time, repeat_days) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, type, title, time, repeat_days || null]
    );
    res.status(201).json({ message: 'Reminder created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getReminders = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM reminders WHERE user_id = ? AND status = "active" ORDER BY time ASC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateReminderStatus = async (req, res) => {
  const { status } = req.body;
  const allowed = ['active', 'snoozed', 'dismissed'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  try {
    await db.query(
      'UPDATE reminders SET status = ? WHERE id = ? AND user_id = ?',
      [status, req.params.id, req.user.id]
    );
    res.json({ message: 'Reminder updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteReminder = async (req, res) => {
  try {
    await db.query('DELETE FROM reminders WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Reminder deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
