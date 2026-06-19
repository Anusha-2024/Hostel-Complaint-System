import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { StatusBadge, PriorityBadge, SLABadge } from '../components/shared/Badge';
import { PageLoader, EmptyState } from '../components/shared/Loader';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, categoryIcon } from '../utils/helpers';

const StatCard = ({ label, value, accent }) => (
  <div className={`stat-card stat-accent-${accent}`}>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value ?? 0}</div>
  </div>
);

const StaffDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/staff').then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLayout title="Dashboard"><PageLoader /></AppLayout>;

  const { stats, pendingComplaints } = data;

  return (
    <AppLayout title="Dashboard">
      <p className="text-sm text-muted mb-5">Welcome back, {user.name.split(' ')[0]}. Here are your assigned tasks.</p>

      <div className="stat-grid mb-6">
        <StatCard label="Total Assigned" value={stats.total} accent="navy" />
        <StatCard label="Newly Assigned" value={stats.assigned} accent="amber" />
        <StatCard label="In Progress" value={stats.in_progress} accent="amber" />
        <StatCard label="Resolved" value={stats.resolved} accent="success" />
      </div>

      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <h3>Pending Work</h3>
        </div>

        {pendingComplaints.length === 0 ? (
          <EmptyState icon="✅" title="All caught up" subtitle="No pending complaints assigned to you" />
        ) : (
          <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr><th>ID</th><th>Category</th><th>Title</th><th>Room</th><th>Priority</th><th>Status</th><th>SLA</th></tr>
              </thead>
              <tbody>
                {pendingComplaints.map((c) => (
                  <tr key={c.id} onClick={() => window.location.href = `/complaints/${c.id}`}>
                    <td className="font-mono text-xs">{c.complaint_id}</td>
                    <td>{categoryIcon(c.category)} {c.category}</td>
                    <td>{c.title}</td>
                    <td>{c.hostel_block}, {c.room_no}</td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td><SLABadge breached={new Date(c.sla_deadline) < new Date()} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default StaffDashboard;
