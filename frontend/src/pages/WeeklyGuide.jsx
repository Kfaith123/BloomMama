import { useEffect, useState } from 'react';
import api from '../services/api';

export default function WeeklyGuide() {
  const [profile, setProfile]   = useState(null);
  const [week, setWeek]         = useState(1);
  const [content, setContent]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [lang, setLang]         = useState('en');
  const [setupForm, setSetupForm] = useState({ due_date: '', first_pregnancy: false });
  const [saving, setSaving]     = useState(false);
  const [msg, setMsg]           = useState('');

  useEffect(() => {
    api.get('/pregnancy').then(r => {
      setProfile(r.data);
      setWeek(r.data.pregnancy_week);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!week) return;
    setLoading(true);
    api.get(`/pregnancy/week/${week}`)
      .then(r => setContent(r.data))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [week]);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (profile) {
        await api.put('/pregnancy', setupForm);
      } else {
        await api.post('/pregnancy', setupForm);
      }
      const r = await api.get('/pregnancy');
      setProfile(r.data);
      setWeek(r.data.pregnancy_week);
      setMsg('Profile saved!');
    } catch {
      setMsg('Error saving profile.');
    } finally {
      setSaving(false);
    }
  };

  const d = (key) => lang === 'en' ? content?.[`${key}_en`] : content?.[`${key}_rw`];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">👶 Weekly Guide</h1>
      <p className="text-gray-500 text-sm mb-5">Follow your baby's growth week by week</p>

      {/* Profile setup */}
      {!profile && (
        <div className="card mb-5 border-dashed border-bloom-pink">
          <h2 className="font-semibold text-gray-700 mb-3">Set Your Due Date</h2>
          {msg && <p className="text-sm text-bloom-green mb-2">{msg}</p>}
          <form onSubmit={saveProfile} className="space-y-3">
            <div>
              <label className="label">Due Date</label>
              <input type="date" className="input" required
                value={setupForm.due_date}
                onChange={e => setSetupForm({ ...setupForm, due_date: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" checked={setupForm.first_pregnancy}
                onChange={e => setSetupForm({ ...setupForm, first_pregnancy: e.target.checked })} />
              This is my first pregnancy
            </label>
            <button className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </form>
        </div>
      )}

      {/* Week selector */}
      <div className="card mb-5">
        <div className="flex items-center justify-between mb-3">
          <label className="label mb-0">Select Week</label>
          <div className="flex gap-2">
            {['en', 'rw'].map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`text-xs px-3 py-1 rounded-full font-medium border transition-colors
                  ${lang === l ? 'bg-bloom-rose text-white border-bloom-rose' : 'border-pink-200 text-gray-500'}`}>
                {l === 'en' ? 'English' : 'Kinyarwanda'}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setWeek(w => Math.max(1, w - 1))}
            className="btn-outline py-1 px-4 text-lg">‹</button>
          <div className="flex-1">
            <input type="range" min="1" max="40" value={week}
              onChange={e => setWeek(Number(e.target.value))}
              className="w-full accent-pink-500" />
          </div>
          <button onClick={() => setWeek(w => Math.min(40, w + 1))}
            className="btn-outline py-1 px-4 text-lg">›</button>
        </div>
        <p className="text-center text-bloom-rose font-bold text-lg mt-1">Week {week}</p>
      </div>

      {/* Week content */}
      {loading && <div className="text-center py-10 text-gray-400">Loading...</div>}
      {!loading && content && (
        <div className="space-y-4">
          <div className="card bg-gradient-to-br from-pink-50 to-bloom-soft">
            <div className="flex items-center gap-4">
              <div className="text-5xl">🍼</div>
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Baby's size</p>
                <p className="text-xl font-bold text-bloom-rose capitalize">{content.baby_size}</p>
                {content.baby_weight_g > 0 && (
                  <p className="text-sm text-gray-500">{content.baby_weight_g}g · {content.baby_length_cm}cm</p>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-700 mb-2">🧠 Development</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{d('development')}</p>
          </div>

          <div className="card bg-bloom-mint border-green-100">
            <h3 className="font-semibold text-gray-700 mb-2">💡 Tips for Week {week}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{d('tips')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
