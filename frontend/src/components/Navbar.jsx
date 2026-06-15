import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/',          label: '🏠 Home' },
  { to: '/weekly',    label: '👶 Weekly' },
  { to: '/health',    label: '❤️ Health' },
  { to: '/kicks',     label: '🦵 Kicks' },
  { to: '/reminders', label: '🔔 Reminders' },
  { to: '/chat',      label: '💬 AI Chat' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  if (!user) return null;

  return (
    <nav className="bg-white border-b border-pink-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <Link to="/" className="text-bloom-rose font-bold text-xl tracking-tight">
          🌸 BloomMama
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${pathname === l.to
                  ? 'bg-bloom-soft text-bloom-rose'
                  : 'text-gray-500 hover:text-bloom-rose hover:bg-bloom-soft'}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <button onClick={logout} className="text-sm text-gray-400 hover:text-bloom-rose transition-colors">
          Logout
        </button>
      </div>
      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-pink-100 flex justify-around py-2 z-50">
        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            className={`flex flex-col items-center text-xs gap-0.5 px-2
              ${pathname === l.to ? 'text-bloom-rose' : 'text-gray-400'}`}
          >
            <span className="text-lg">{l.label.split(' ')[0]}</span>
            <span>{l.label.split(' ')[1]}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
