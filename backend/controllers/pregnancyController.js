const db = require('../config/db');

const calcWeek = (dueDate) => {
  const now    = new Date();
  const due    = new Date(dueDate);
  const diffMs = due - now;
  const weeksLeft = Math.ceil(diffMs / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, Math.min(40, 40 - weeksLeft));
};

exports.createProfile = async (req, res) => {
  const { due_date, first_pregnancy, last_period_date, doctor_name, clinic_name } = req.body;
  const userId = req.user.id;
  try {
    const week = calcWeek(due_date);
    const [result] = await db.query(
      `INSERT INTO pregnancy_profiles
         (user_id, due_date, pregnancy_week, first_pregnancy, last_period_date, doctor_name, clinic_name)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, due_date, week, first_pregnancy || false, last_period_date || null, doctor_name || null, clinic_name || null]
    );
    res.status(201).json({ message: 'Profile created', profileId: result.insertId, pregnancy_week: week });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM pregnancy_profiles WHERE user_id = ?',
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'No pregnancy profile found' });

    // Refresh week dynamically
    const profile = rows[0];
    profile.pregnancy_week = calcWeek(profile.due_date);
    await db.query('UPDATE pregnancy_profiles SET pregnancy_week = ? WHERE id = ?',
      [profile.pregnancy_week, profile.id]);

    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  const { due_date, first_pregnancy, last_period_date, doctor_name, clinic_name } = req.body;
  try {
    const week = due_date ? calcWeek(due_date) : undefined;
    await db.query(
      `UPDATE pregnancy_profiles SET
         due_date = COALESCE(?, due_date),
         pregnancy_week = COALESCE(?, pregnancy_week),
         first_pregnancy = COALESCE(?, first_pregnancy),
         last_period_date = COALESCE(?, last_period_date),
         doctor_name = COALESCE(?, doctor_name),
         clinic_name = COALESCE(?, clinic_name)
       WHERE user_id = ?`,
      [due_date || null, week || null, first_pregnancy ?? null, last_period_date || null,
       doctor_name || null, clinic_name || null, req.user.id]
    );
    res.json({ message: 'Profile updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getWeeklyContent = async (req, res) => {
  const { week } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM weekly_content WHERE week = ?', [week]);
    if (!rows.length) return res.status(404).json({ message: 'Week not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
