import { useEffect, useState } from 'react';
import api from '../services/api';

export default function KickCounter() {
  const [kicks, setKicks]       = useState(0);
  const [todayTotal, setToday]  = useState(0);
  const [history, setHistory]   = useState([]);
  const [saving, setSaving]     = useState(false);
  const [flash, setFlash]       = useState(false);

  useEffect(() => {
    api.get('/kicks/today').then(r => setToday(r.data.total_kicks));
    api.get('/kicks').then(r => setHistory(r.data));
  }, []);

  const tap = () => {
    setKicks(k => k + 1);
    setFlash(true);
    setTimeout(() => setFlash(false), 200);
  };

  const save = async () => {
    if (kicks === 0) return;
    setSaving(true);
    try {
      await api.post('/kicks', { kicks, date: new Date().toISOString().split('T')[0] });
      const r = await api.get('/kicks/today');
      setToday(r.data.total_kicks);
      const h = await api.get('/kicks');
      setHistory(h.data);
      setKicks(0);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 pb-24 md:pb-6 text-center">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">🦵 Kick Counter</h1>
      <p className="text-gray-500 text-sm mb-6">Count your baby's movements. 10 kicks in 2 hours is normal.</p>

      {/* Today summary */}
      <div className="card mb-6 bg-bloom-mint border-green-100">
        <p className="text-sm text-gray-500">Total kicks today</p>
        <p className="text-5xl font-bold text-bloom-green">{todayTotal}</p>
        {todayTotal >= 10 && (
          <p className="text-sm text-bloom-green mt-1 font-medium">✅ Great! Baby is active today.</p>
        )}
      </div>

      {/* Session counter */}
      <div className="card mb-4">
        <p className="text-sm text-gray-500 mb-3">This session</p>
        <p className={`text-7xl font-bold transition-all duration-100 ${flash ? 'scale-110 text-bloom-rose' : 'text-gray-800'}`}>
          {kicks}
        </p>
        <button
          onClick={tap}
          className="mt-6 w-48 h-48 rounded-full bg-gradient-to-br from-bloom-pink to-bloom-rose text-white text-5xl
                     shadow-lg hover:shadow-xl active:scale-95 transition-all duration-150 select-none mx-auto block">
          👶
        </button>
        <p className="text-gray-400 text-xs mt-4">Tap the button each time you feel a kick</p>
      </div>

      <div className="flex gap-3 mb-8">
        <button onClick={() => setKicks(0)} className="btn-outline flex-1">Reset</button>
        <button onClick={save} disabled={kicks === 0 || saving} className="btn-primary flex-1">
          {saving ? 'Saving...' : `Save ${kicks} kick${kicks !== 1 ? 's' : ''}`}
        </button>
      </div>

      {/* History */}
      {history.length > 0 && (
        <>
          <h2 className="text-left font-semibold text-gray-700 mb-3">Recent Sessions</h2>
          <div className="space-y-2">
            {history.slice(0, 7).map(h => (
              <div key={h.id} className="card flex justify-between items-center text-sm">
                <span className="text-gray-500">{new Date(h.date).toLocaleDateString()}</span>
                <span className="font-semibold text-bloom-rose">{h.kicks} kicks</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-2xl p-3 text-sm text-yellow-800 text-left">
        ⚠️ If you notice significantly fewer movements than usual, contact your healthcare provider.
      </div>
    </div>
  );
}
