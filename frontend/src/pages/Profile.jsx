import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Profile() {
  const { user, refreshUser } = useAuth();

  const [userForm, setUserForm]   = useState({ name: '', phone: '', language: 'en' });
  const [pregForm, setPregForm]   = useState({ due_date: '', first_pregnancy: false, doctor_name: '', clinic_name: '' });
  const [pwdForm, setPwdForm]     = useState({ current_password: '', new_password: '', confirm: '' });

  const [userMsg, setUserMsg]     = useState('');
  const [pregMsg, setPregMsg]     = useState('');
  const [pwdMsg, setPwdMsg]       = useState('');
  const [savingUser, setSavingUser] = useState(false);
  const [savingPreg, setSavingPreg] = useState(false);
  const [savingPwd, setSavingPwd]   = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    api.get('/auth/me').then(r => {
      setUserForm({ name: r.data.name || '', phone: r.data.phone || '', language: r.data.language || 'en' });
    }).catch(() => {});

    api.get('/pregnancy').then(r => {
      setHasProfile(true);
      setPregForm({
        due_date: r.data.due_date ? r.data.due_date.split('T')[0] : '',
        first_pregnancy: r.data.first_pregnancy || false,
        doctor_name: r.data.doctor_name || '',
        clinic_name: r.data.clinic_name || '',
      });
    }).catch(() => setHasProfile(false));
  }, []);

  const flash = (setter, msg, ms = 3000) => {
    setter(msg);
    setTimeout(() => setter(''), ms);
  };

  const saveUser = async (e) => {
    e.preventDefault();
    setSavingUser(true);
    try {
      await api.put('/auth/me', userForm);
      await refreshUser();
      flash(setUserMsg, '✅ Profile updated!');
    } catch (err) {
      flash(setUserMsg, '❌ ' + (err.response?.data?.message || 'Error saving profile.'));
    } finally {
      setSavingUser(false);
    }
  };

  const savePreg = async (e) => {
    e.preventDefault();
    setSavingPreg(true);
    try {
      if (hasProfile) {
        await api.put('/pregnancy', pregForm);
      } else {
        await api.post('/pregnancy', pregForm);
        setHasProfile(true);
      }
      flash(setPregMsg, '✅ Pregnancy details updated!');
    } catch (err) {
      flash(setPregMsg, '❌ ' + (err.response?.data?.message || 'Error saving details.'));
    } finally {
      setSavingPreg(false);
    }
  };

  const changePwd = async (e) => {
    e.preventDefault();
    if (pwdForm.new_password !== pwdForm.confirm) {
      return flash(setPwdMsg, '❌ New passwords do not match.');
    }
    setSavingPwd(true);
    try {
      await api.post('/auth/me/change-password', {
        current_password: pwdForm.current_password,
        new_password: pwdForm.new_password,
      });
      setPwdForm({ current_password: '', new_password: '', confirm: '' });
      flash(setPwdMsg, '✅ Password changed successfully!');
    } catch (err) {
      flash(setPwdMsg, '❌ ' + (err.response?.data?.message || 'Error changing password.'));
    } finally {
      setSavingPwd(false);
    }
  };

  const setU = (k) => (e) => setUserForm({ ...userForm, [k]: e.target.value });
  const setP = (k) => (e) => setPregForm({ ...pregForm, [k]: e.target.value });
  const setPw = (k) => (e) => setPwdForm({ ...pwdForm, [k]: e.target.value });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">👤 My Profile</h1>
      <p className="text-gray-500 text-sm mb-6">Update your personal information and pregnancy details</p>

      {/* User info */}
      <div className="card mb-5">
        <h2 className="font-semibold text-gray-700 mb-4">Personal Information</h2>
        {userMsg && (
          <p className={`text-sm mb-3 ${userMsg.startsWith('✅') ? 'text-bloom-green' : 'text-red-500'}`}>
            {userMsg}
          </p>
        )}
        <form onSubmit={saveUser} className="space-y-3">
          <div>
            <label className="label">Full Name</label>
            <input className="input" required value={userForm.name} onChange={setU('name')} placeholder="Your name" />
          </div>
          <div>
            <label className="label">Phone Number</label>
            <input className="input" type="tel" value={userForm.phone} onChange={setU('phone')} placeholder="+250 700 000 000" />
          </div>
          <div>
            <label className="label">Preferred Language</label>
            <select className="input" value={userForm.language} onChange={setU('language')}>
              <option value="en">English</option>
              <option value="rw">Kinyarwanda</option>
            </select>
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input bg-gray-50 text-gray-400 cursor-not-allowed" value={user?.email || ''} disabled />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <button className="btn-primary" disabled={savingUser}>
            {savingUser ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Pregnancy details */}
      <div className="card mb-5">
        <h2 className="font-semibold text-gray-700 mb-4">Pregnancy Details</h2>
        {pregMsg && (
          <p className={`text-sm mb-3 ${pregMsg.startsWith('✅') ? 'text-bloom-green' : 'text-red-500'}`}>
            {pregMsg}
          </p>
        )}
        <form onSubmit={savePreg} className="space-y-3">
          <div>
            <label className="label">Due Date</label>
            <input className="input" type="date" required value={pregForm.due_date} onChange={setP('due_date')} />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={pregForm.first_pregnancy}
              onChange={e => setPregForm({ ...pregForm, first_pregnancy: e.target.checked })} />
            This is my first pregnancy
          </label>
          <div>
            <label className="label">Doctor / Midwife Name</label>
            <input className="input" value={pregForm.doctor_name} onChange={setP('doctor_name')} placeholder="e.g. Dr. Uwimana" />
          </div>
          <div>
            <label className="label">Health Center / Hospital</label>
            <input className="input" value={pregForm.clinic_name} onChange={setP('clinic_name')} placeholder="e.g. Kigali Health Center" />
          </div>
          <button className="btn-primary" disabled={savingPreg}>
            {savingPreg ? 'Saving...' : hasProfile ? 'Update Pregnancy Details' : 'Save Pregnancy Details'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4">Change Password</h2>
        {pwdMsg && (
          <p className={`text-sm mb-3 ${pwdMsg.startsWith('✅') ? 'text-bloom-green' : 'text-red-500'}`}>
            {pwdMsg}
          </p>
        )}
        <form onSubmit={changePwd} className="space-y-3">
          <div>
            <label className="label">Current Password</label>
            <input className="input" type="password" required value={pwdForm.current_password}
              onChange={setPw('current_password')} placeholder="Enter current password" />
          </div>
          <div>
            <label className="label">New Password</label>
            <input className="input" type="password" required minLength={6} value={pwdForm.new_password}
              onChange={setPw('new_password')} placeholder="At least 6 characters" />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input className="input" type="password" required value={pwdForm.confirm}
              onChange={setPw('confirm')} placeholder="Repeat new password" />
          </div>
          <button className="btn-primary" disabled={savingPwd}>
            {savingPwd ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
