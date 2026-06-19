import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { PageLoader, EmptyState } from '../components/shared/Loader';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users', { params: { search, role } });
      setUsers(data.users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [search, role]);

  const toggle = async (id) => {
    await api.put(`/users/${id}/toggle`);
    fetchUsers();
  };

  return (
    <AppLayout title="Manage Users">
      <div className="card card-padded mb-4">
        <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
          <input className="field-input" placeholder="Search by name, email, reg no…" style={{ maxWidth: 280 }} value={search} onChange={(e) => setSearch(e.target.value)} />
          <select className="field-select" style={{ maxWidth: 160 }} value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All roles</option>
            <option value="student">Student</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {loading ? <PageLoader /> : users.length === 0 ? (
        <div className="card"><EmptyState icon="👥" title="No users found" /></div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Reg No.</th><th>Role</th><th>Hostel</th><th>Joined</th><th>Status</th></tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ cursor: 'default' }}>
                  <td>{u.name}</td>
                  <td className="text-sm text-muted">{u.email}</td>
                  <td className="font-mono text-xs">{u.reg_no || '—'}</td>
                  <td style={{ textTransform: 'capitalize' }}>{u.role}</td>
                  <td>{u.hostel_block ? `${u.hostel_block} / ${u.room_no}` : '—'}</td>
                  <td className="text-sm text-muted">{formatDate(u.created_at)}</td>
                  <td>
                    <button className={`btn btn-sm ${u.is_active ? 'btn-secondary' : 'btn-danger'}`} onClick={() => toggle(u.id)}>
                      {u.is_active ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppLayout>
  );
};

export default ManageUsers;
