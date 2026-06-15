import { useEffect, useState } from 'react';
import api from '../services/api';

const typeEmoji = { medicine: '💊', appointment: '🏥', water: '💧', exercise: '🏃', vitamins: '🌿' };
const types = ['medicine', 'appointment', 'water', 'exercise', 'vitamins'];

export default function Reminders() {
  const [reminders, setReminders] = useState([]);
  const [form, setForm] = useState({ type: 'medicine', title: '', time: '', repeat_days: 'daily' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState('');

  const fetch = () => api.get('/reminders').then(r => setReminders(r.data));
  useEffect(() => { fetch(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/reminders', form);
      setForm({ type: 'medicine', title: '', time: '', repeat_days: 'daily' });
      setMsg('Reminder added!');
      fetch();
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('Error adding reminder.');
    } finally {
      setSaving(false);
    }
  };

  const dismiss = async (id) => {
    await api.patch(`/reminders/${id}/status`, { status: 'dismissed' });
    fetch();
  };

  const remove = async (id) => {
    await api.delete(`/reminders/${id}`);
    fetch();
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">🔔 Reminders</h1>
      <p className="text-gray-500 text-sm mb-5">Never miss medicine, water, or an appointment</p>

      {/* Add reminder */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Add Reminder</h2>
        {msg && <p className="text-sm text-bloom-green mb-3">{msg}</p>}
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">Type</label>
            <div className="grid grid-cols-5 gap-2">
              {types.map(t => (
                <button key={t} type="button"
                  onClick={() => setForm({ ...form, type: t })}
                  className={`py-2 rounded-xl border text-center text-xs transition-all
                    ${form.type === t ? 'border-bloom-rose bg-bloom-soft' : 'border-gray-200'}`}>
                  <div className="text-xl">{typeEmoji[t]}</div>
                  <div className="text-gray-600 mt-0.5 capitalize">{t}</div>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Title</label>
            <input className="input" required placeholder="e.g. Iron tablet"
              value={form.title} onChange={set('title')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Time</label>
              <input className="input" type="time" required value={form.time} onChange={set('time')} />
            </div>
            <div>
              <label className="label">Repeat</label>
              <select className="input" value={form.repeat_days} onChange={set('repeat_days')}>
                <option value="daily">Daily</option>
                <option value="Mon,Wed,Fri">Mon / Wed / Fri</option>
                <option value="weekdays">Weekdays</option>
                <option value="once">Once</option>
              </select>
            </div>
          </div>
          <button className="btn-primary w-full" disabled={saving}>
            {saving ? 'Saving...' : 'Add Reminder'}
          </button>
        </form>
      </div>

      {/* List */}
      <h2 className="font-semibold text-gray-700 mb-3">Active Reminders</h2>
      {reminders.length === 0 && <p className="text-gray-400 text-sm">No active reminders.</p>}
      <div className="space-y-3">
        {reminders.map(r => (
          <div key={r.id} className="card flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{typeEmoji[r.type]}</span>
              <div>
                <p className="font-medium text-gray-700">{r.title}</p>
                <p className="text-xs text-gray-400">{r.time} · {r.repeat_days}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => dismiss(r.id)}
                className="text-xs text-gray-400 hover:text-yellow-500 transition-colors">Snooze</button>
              <button onClick={() => remove(r.id)}
                className="text-xs text-red-300 hover:text-red-500 transition-colors">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
