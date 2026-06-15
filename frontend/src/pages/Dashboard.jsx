import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const quickLinks = [
  { to: '/weekly',    icon: '👶', label: 'Weekly Guide',  color: 'bg-pink-50 border-pink-200' },
  { to: '/health',    icon: '❤️', label: 'Health Log',    color: 'bg-red-50 border-red-200' },
  { to: '/kicks',     icon: '🦵', label: 'Kick Counter',  color: 'bg-orange-50 border-orange-200' },
  { to: '/reminders', icon: '🔔', label: 'Reminders',     color: 'bg-yellow-50 border-yellow-200' },
  { to: '/chat',      icon: '💬', label: 'Ask AI',        color: 'bg-purple-50 border-purple-200' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [weekInfo, setWeekInfo] = useState(null);
  const [todayKicks, setTodayKicks] = useState(0);

  useEffect(() => {
    api.get('/pregnancy').then(r => {
      setProfile(r.data);
      return api.get(`/pregnancy/week/${r.data.pregnancy_week}`);
    }).then(r => setWeekInfo(r.data)).catch(() => {});

    api.get('/kicks/today').then(r => setTodayKicks(r.data.total_kicks)).catch(() => {});
  }, []);

  const daysLeft = profile
    ? Math.max(0, Math.ceil((new Date(profile.due_date) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Hello, {user?.name?.split(' ')[0]} 🌸
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">How are you feeling today?</p>
      </div>

      {/* Pregnancy summary card */}
      {profile ? (
        <div className="card bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200 mb-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Current Week</p>
              <p className="text-4xl font-bold text-bloom-rose">Week {profile.pregnancy_week}</p>
              <p className="text-sm text-gray-500 mt-1">{daysLeft} days until due date</p>
            </div>
            <div className="text-6xl">{weekInfo?.baby_size ? '🍋' : '👶'}</div>
          </div>
          {weekInfo && (
            <div className="mt-4 pt-4 border-t border-pink-100">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Baby is the size of a {weekInfo.baby_size}</span>
                {weekInfo.baby_weight_g > 0 && ` · ${weekInfo.baby_weight_g}g · ${weekInfo.baby_length_cm}cm`}
              </p>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{weekInfo.development_en}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="card border-dashed border-pink-300 mb-5 text-center">
          <p className="text-gray-500 mb-3">Set up your pregnancy profile to get started</p>
          <Link to="/weekly" className="btn-primary inline-block">Set Up Profile</Link>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="card text-center">
          <p className="text-3xl font-bold text-bloom-green">{todayKicks}</p>
          <p className="text-sm text-gray-500">Kicks Today</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-bloom-purple">{daysLeft ?? '—'}</p>
          <p className="text-sm text-gray-500">Days to Due Date</p>
        </div>
      </div>

      {/* Quick links */}
      <h2 className="text-base font-semibold text-gray-600 mb-3">Quick Access</h2>
      <div className="grid grid-cols-2 gap-3">
        {quickLinks.map(l => (
          <Link key={l.to} to={l.to}
            className={`card flex items-center gap-3 border ${l.color} hover:shadow-md transition-shadow`}>
            <span className="text-3xl">{l.icon}</span>
            <span className="font-medium text-gray-700">{l.label}</span>
          </Link>
        ))}
      </div>

      {/* Safety reminder */}
      <div className="mt-5 bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
        <span className="font-semibold">⚠️ Emergency:</span> If you experience heavy bleeding, severe pain, or no baby movement — seek medical care immediately.
      </div>
    </div>
  );
}
