import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar       from './components/Navbar';
import Login        from './pages/Login';
import Register     from './pages/Register';
import Dashboard    from './pages/Dashboard';
import WeeklyGuide  from './pages/WeeklyGuide';
import HealthLog    from './pages/HealthLog';
import KickCounter  from './pages/KickCounter';
import Reminders    from './pages/Reminders';
import AIChat       from './pages/AIChat';
import Nutrition    from './pages/Nutrition';
import Profile      from './pages/Profile';

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-bloom-rose">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login"    element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
        <Route path="/"         element={<Protected><Dashboard /></Protected>} />
        <Route path="/weekly"   element={<Protected><WeeklyGuide /></Protected>} />
        <Route path="/health"   element={<Protected><HealthLog /></Protected>} />
        <Route path="/kicks"    element={<Protected><KickCounter /></Protected>} />
        <Route path="/reminders"  element={<Protected><Reminders /></Protected>} />
        <Route path="/chat"       element={<Protected><AIChat /></Protected>} />
        <Route path="/nutrition"  element={<Protected><Nutrition /></Protected>} />
        <Route path="/profile"    element={<Protected><Profile /></Protected>} />
        <Route path="*"           element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
