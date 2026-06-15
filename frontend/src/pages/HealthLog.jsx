import { useEffect, useState } from 'react';
import api from '../services/api';

const moods = ['great', 'good', 'okay', 'low', 'bad'];
const moodEmoji = { great: '😄', good: '🙂', okay: '😐', low: '😔', bad: '😢' };

export default function HealthLog() {
  const [logs, setLogs]     = useState([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ weight: '', blood_pressure: '', temperature: '', mood: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg]       = useState('');

  const fetchLogs = async (p = 1) => {
    setLoading(true);
    try {
      const r = await api.get(`/health?page=${p}&limit=5`);
      setLogs(r.data.logs);
      setTotal(r.data.total);
      setPage(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/health', form);
      setForm({ weight: '', blood_pressure: '', temperature: '', mood: '', notes: '' });
      setMsg('Log saved!');
      fetchLogs(1);
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('Error saving log.');
    } finally {
      setSaving(false);
    }
  };

  const deleteLog = async (id) => {
    await api.delete(`/health/${id}`);
    fetchLogs(page);
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">❤️ Health Log</h1>
      <p className="text-gray-500 text-sm mb-5">Track your weight, blood pressure, and how you feel</p>

      {/* Add log form */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-700 mb-4">Add Today's Log</h2>
        {msg && <p className="text-sm text-bloom-green mb-3">{msg}</p>}
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Weight (kg)</label>
              <input className="input" type="number" step="0.1" placeholder="65.5"
                value={form.weight} onChange={set('weight')} />
            </div>
            <div>
              <label className="label">Blood Pressure</label>
              <input className="input" placeholder="120/80"
                value={form.blood_pressure} onChange={set('blood_pressure')} />
            </div>
          </div>
          <div>
            <label className="label">Temperature (°C)</label>
            <input className="input" type="number" step="0.1" placeholder="36.5"
              value={form.temperature} onChange={set('temperature')} />
          </div>
          <div>
            <label className="label">Mood</label>
            <div className="flex gap-2">
              {moods.map(m => (
                <button key={m} type="button"
                  onClick={() => setForm({ ...form, mood: m })}
                  className={`flex-1 py-2 rounded-xl border text-lg transition-all
                    ${form.mood === m ? 'border-bloom-rose bg-bloom-soft scale-105' : 'border-gray-200'}`}>
                  {moodEmoji[m]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea className="input" rows={2} placeholder="How are you feeling?"
              value={form.notes} onChange={set('notes')} />
          </div>
          <button className="btn-primary w-full" disabled={saving}>
            {saving ? 'Saving...' : 'Save Log'}
          </button>
        </form>
      </div>

      {/* Log history */}
      <h2 className="font-semibold text-gray-700 mb-3">Recent Logs</h2>
      {loading && <div className="text-center py-6 text-gray-400">Loading...</div>}
      <div className="space-y-3">
        {logs.map(log => (
          <div key={log.id} className="card flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-xs text-gray-400">{new Date(log.created_at).toLocaleDateString()}</p>
              <div className="flex flex-wrap gap-3 text-sm">
                {log.weight && <span>⚖️ {log.weight} kg</span>}
                {log.blood_pressure && <span>💉 {log.blood_pressure}</span>}
                {log.temperature && <span>🌡️ {log.temperature}°C</span>}
                {log.mood && <span>{moodEmoji[log.mood]} {log.mood}</span>}
              </div>
              {log.notes && <p className="text-sm text-gray-500">{log.notes}</p>}
            </div>
            <button onClick={() => deleteLog(log.id)} className="text-red-300 hover:text-red-500 text-lg ml-2">×</button>
          </div>
        ))}
      </div>
      {total > 5 && (
        <div className="flex justify-center gap-3 mt-4">
          <button disabled={page === 1} onClick={() => fetchLogs(page - 1)} className="btn-outline py-1 px-4">‹ Prev</button>
          <button disabled={page * 5 >= total} onClick={() => fetchLogs(page + 1)} className="btn-outline py-1 px-4">Next ›</button>
        </div>
      )}
    </div>
  );
}
