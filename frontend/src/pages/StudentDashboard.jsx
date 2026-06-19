import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { StatusBadge, PriorityBadge } from '../components/shared/Badge';
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

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/student').then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLayout title="Dashboard"><PageLoader /></AppLayout>;

  const { stats, recentComplaints } = data;

  return (
    <AppLayout title="Dashboard" actions={<Link to="/complaints/new" className="btn btn-primary btn-sm">+ New Complaint</Link>}>
      <p className="text-sm text-muted mb-5">Welcome back, {user.name.split(' ')[0]}. Here's an overview of your complaints.</p>

      <div className="stat-grid mb-6">
        <StatCard label="Total Complaints" value={stats.total} accent="navy" />
        <StatCard label="Submitted" value={stats.submitted} accent="navy" />
        <StatCard label="In Progress" value={stats.in_progress} accent="amber" />
        <StatCard label="Resolved" value={stats.resolved} accent="success" />
      </div>

      <div className="card">
        <div className="flex justify-between items-center" style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
          <h3>Recent Complaints</h3>
          <Link to="/complaints" className="text-sm" style={{ color: 'var(--color-navy)', fontWeight: 600 }}>View all →</Link>
        </div>

        {recentComplaints.length === 0 ? (
          <EmptyState icon="📋" title="No complaints yet" subtitle="Raise your first complaint to get started" />
        ) : (
          <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead>
                <tr><th>ID</th><th>Category</th><th>Title</th><th>Priority</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {recentComplaints.map((c) => (
                  <tr key={c.id} onClick={() => window.location.href = `/complaints/${c.id}`}>
                    <td className="font-mono text-xs">{c.complaint_id}</td>
                    <td>{categoryIcon(c.category)} {c.category}</td>
                    <td>{c.title}</td>
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td><StatusBadge status={c.status} /></td>
                    <td className="text-sm text-muted">{formatDate(c.created_at)}</td>
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

export default StudentDashboard;
