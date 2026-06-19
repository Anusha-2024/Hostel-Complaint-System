import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { PageLoader, EmptyState } from '../components/shared/Loader';
import api from '../utils/api';
import { CATEGORIES } from '../utils/helpers';

const ManageStaff = () => {
  const [staff, setStaff] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
  const [mapForm, setMapForm] = useState({ staff_id: '', category: '' });
  const [error, setError] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [s, m] = await Promise.all([
        api.get('/users/staff'),
        api.get('/users/staff-category'),
      ]);
      setStaff(s.data.staff);
      setMappings(m.data.staffCategories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/users', { ...form, role: 'staff' });
      setForm({ name: '', email: '', password: '', department: '' });
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create staff');
    }
  };

  const handleMapCategory = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/users/staff-category', mapForm);
      setMapForm({ staff_id: '', category: '' });
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to map category');
    }
  };

  const removeMapping = async (id) => {
    await api.delete(`/users/staff-category/${id}`);
    fetchAll();
  };

  const toggleStaff = async (id) => {
    await api.put(`/users/${id}/toggle`);
    fetchAll();
  };

  if (loading) return <AppLayout title="Manage Staff"><PageLoader /></AppLayout>;

  return (
    <AppLayout title="Manage Staff" actions={
      <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : '+ Add Staff'}
      </button>
    }>
      {showForm && (
        <form onSubmit={handleCreateStaff} className="card card-padded mb-5">
          <h3 className="mb-4">New Maintenance Staff</h3>
          <div className="grid-2">
            <div className="field-group">
              <label className="field-label">Name</label>
              <input className="field-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="field-group">
              <label className="field-label">Email</label>
              <input type="email" className="field-input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="field-group">
              <label className="field-label">Department</label>
              <select className="field-select" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                <option value="">Select department</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="field-group">
              <label className="field-label">Temporary Password</label>
              <input className="field-input" required placeholder="Staff@123" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
          </div>
          {error && <div className="field-error mb-3">{error}</div>}
          <button className="btn btn-primary btn-sm">Create Staff Account</button>
        </form>
      )}

      <div className="grid-2 mb-6" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}><h3>Staff Directory</h3></div>
          {staff.length === 0 ? <EmptyState icon="👷" title="No staff added yet" /> : (
            <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead><tr><th>Name</th><th>Dept</th><th>Active</th><th>Status</th></tr></thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s.id} style={{ cursor: 'default' }}>
                      <td>{s.name}<div className="text-xs text-faint">{s.email}</div></td>
                      <td>{s.department || '—'}</td>
                      <td>{s.active_complaints}</td>
                      <td>
                        <button className={`btn btn-sm ${s.is_active ? 'btn-secondary' : 'btn-danger'}`} onClick={() => toggleStaff(s.id)}>
                          {s.is_active ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card card-padded">
          <h3 className="mb-3">Auto-Assignment Rules</h3>
          <p className="text-sm text-muted mb-4">Map a category to staff so new complaints auto-assign to them.</p>
          <form onSubmit={handleMapCategory} className="flex gap-2 mb-4" style={{ flexWrap: 'wrap' }}>
            <select className="field-select" style={{ flex: 1, minWidth: 140 }} required value={mapForm.staff_id} onChange={(e) => setMapForm({ ...mapForm, staff_id: e.target.value })}>
              <option value="">Select staff</option>
              {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select className="field-select" style={{ flex: 1, minWidth: 140 }} required value={mapForm.category} onChange={(e) => setMapForm({ ...mapForm, category: e.target.value })}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="btn btn-primary btn-sm">Map</button>
          </form>

          {mappings.map((m) => (
            <div key={m.id} className="flex justify-between items-center" style={{ padding: '8px 0', borderTop: '1px solid var(--color-border)' }}>
              <span className="text-sm">{m.category} → <strong>{m.staff_name}</strong></span>
              <button className="btn btn-ghost btn-sm" onClick={() => removeMapping(m.id)}>Remove</button>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default ManageStaff;
