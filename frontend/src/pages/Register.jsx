import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', language: 'en' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-bloom-soft">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌸</div>
          <h1 className="text-3xl font-bold text-bloom-rose">BloomMama</h1>
          <p className="text-gray-500 mt-1">Start your pregnancy journey</p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-700 mb-6">Create your account</h2>
          {error && <div className="bg-red-50 text-red-600 text-sm rounded-xl p-3 mb-4">{error}</div>}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" required value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className="label">Phone (optional)</label>
              <input className="input" type="tel" value={form.phone} onChange={set('phone')} />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" required minLength={6} value={form.password} onChange={set('password')} />
            </div>
            <div>
              <label className="label">Preferred Language</label>
              <select className="input" value={form.language} onChange={set('language')}>
                <option value="en">English</option>
                <option value="rw">Kinyarwanda</option>
              </select>
            </div>
            <button className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account? <Link to="/login" className="text-bloom-rose font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
