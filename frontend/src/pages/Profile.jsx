import { useState } from 'react';
import AppLayout from '../components/layout/AppLayout';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name, phone: user.phone || '', hostel_block: user.hostel_block || '', room_no: user.room_no || '',
  });
  const [pwForm, setPwForm] = useState({ current_password: '', new_password: '' });
  const [msg, setMsg] = useState('');
  const [pwMsg, setPwMsg] = useState('');

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await api.put('/auth/profile', form);
      const updated = { ...user, ...form };
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setMsg('✓ Profile updated successfully');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Update failed');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwMsg('');
    try {
      await api.put('/auth/change-password', pwForm);
      setPwForm({ current_password: '', new_password: '' });
      setPwMsg('✓ Password changed successfully');
    } catch (err) {
      setPwMsg(err.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <AppLayout title="Profile">
      <div className="grid-2" style={{ maxWidth: 800 }}>
        <form onSubmit={handleProfileUpdate} className="card card-padded">
          <h3 className="mb-4">Personal Details</h3>
          <div className="field-group">
            <label className="field-label">Full Name</label>
            <input className="field-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field-group">
            <label className="field-label">Email</label>
            <input className="field-input" value={user.email} disabled style={{ background: 'var(--color-bg)', color: 'var(--color-ink-faint)' }} />
          </div>
          <div className="field-group">
            <label className="field-label">Phone</label>
            <input className="field-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          {user.role === 'student' && (
            <div className="grid-2">
              <div className="field-group">
                <label className="field-label">Hostel Block</label>
                <input className="field-input" value={form.hostel_block} onChange={(e) => setForm({ ...form, hostel_block: e.target.value })} />
              </div>
              <div className="field-group">
                <label className="field-label">Room No.</label>
                <input className="field-input" value={form.room_no} onChange={(e) => setForm({ ...form, room_no: e.target.value })} />
              </div>
            </div>
          )}
          {msg && <p className="text-sm mb-3" style={{ color: msg.startsWith('✓') ? 'var(--color-success)' : 'var(--color-danger)' }}>{msg}</p>}
          <button className="btn btn-primary btn-sm">Save Changes</button>
        </form>

        <form onSubmit={handlePasswordChange} className="card card-padded">
          <h3 className="mb-4">Change Password</h3>
          <div className="field-group">
            <label className="field-label">Current Password</label>
            <input type="password" className="field-input" required value={pwForm.current_password} onChange={(e) => setPwForm({ ...pwForm, current_password: e.target.value })} />
          </div>
          <div className="field-group">
            <label className="field-label">New Password</label>
            <input type="password" className="field-input" required minLength={6} value={pwForm.new_password} onChange={(e) => setPwForm({ ...pwForm, new_password: e.target.value })} />
          </div>
          {pwMsg && <p className="text-sm mb-3" style={{ color: pwMsg.startsWith('✓') ? 'var(--color-success)' : 'var(--color-danger)' }}>{pwMsg}</p>}
          <button className="btn btn-secondary btn-sm">Update Password</button>
        </form>
      </div>
    </AppLayout>
  );
};

export default Profile;
