import { useState, useEffect } from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Legend,
} from 'chart.js';
import AppLayout from '../components/layout/AppLayout';
import { StatusBadge, PriorityBadge } from '../components/shared/Badge';
import { PageLoader } from '../components/shared/Loader';
import api from '../utils/api';
import { formatDate, categoryIcon } from '../utils/helpers';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const COLORS = ['#1B2A4A', '#C8732A', '#2563AC', '#1F7A4D', '#B8860B', '#B3261E', '#5C5F6B'];

const StatCard = ({ label, value, accent, sub }) => (
  <div className={`stat-card stat-accent-${accent}`}>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value ?? 0}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard').then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <AppLayout title="Analytics"><PageLoader /></AppLayout>;

  const { totals, categoryStats, priorityStats, blockStats, monthlyTrend, avgResolutionHours, staffPerformance, recentComplaints } = data;

  const pieData = {
    labels: categoryStats.map((c) => c.category),
    datasets: [{ data: categoryStats.map((c) => c.count), backgroundColor: COLORS, borderWidth: 0 }],
  };

  const barData = {
    labels: blockStats.map((b) => b.hostel_block),
    datasets: [{ label: 'Complaints', data: blockStats.map((b) => b.count), backgroundColor: '#1B2A4A', borderRadius: 4 }],
  };

  const trendData = {
    labels: monthlyTrend.map((m) => m.month),
    datasets: [
      { label: 'Total', data: monthlyTrend.map((m) => m.total), borderColor: '#1B2A4A', backgroundColor: '#1B2A4A', tension: 0.35 },
      { label: 'Resolved', data: monthlyTrend.map((m) => m.resolved), borderColor: '#1F7A4D', backgroundColor: '#1F7A4D', tension: 0.35 },
    ],
  };

  const chartOpts = { responsive: true, plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11.5 } } } } };

  return (
    <AppLayout title="Analytics Dashboard">
      <div className="stat-grid mb-6">
        <StatCard label="Total Complaints" value={totals.total} accent="navy" />
        <StatCard label="Open" value={totals.submitted + totals.assigned + totals.in_progress} accent="amber" />
        <StatCard label="Resolved" value={totals.resolved + totals.closed} accent="success" />
        <StatCard label="SLA Breached" value={totals.sla_breached} accent="danger" />
        <StatCard label="Avg Resolution" value={`${Math.round(avgResolutionHours || 0)}h`} accent="navy" />
      </div>

      <div className="grid-2 mb-6" style={{ gridTemplateColumns: '1fr 1.3fr' }}>
        <div className="card card-padded">
          <h3 className="mb-4">Category-wise Distribution</h3>
          <Pie data={pieData} options={chartOpts} />
        </div>
        <div className="card card-padded">
          <h3 className="mb-4">Hostel Block-wise Complaints</h3>
          <Bar data={barData} options={{ ...chartOpts, plugins: { legend: { display: false } } }} />
        </div>
      </div>

      <div className="card card-padded mb-6">
        <h3 className="mb-4">Monthly Trend</h3>
        <Line data={trendData} options={chartOpts} />
      </div>

      <div className="grid-2 mb-6" style={{ gridTemplateColumns: '1fr 1fr', alignItems: 'start' }}>
        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}><h3>Staff Performance</h3></div>
          <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
            <table>
              <thead><tr><th>Staff</th><th>Assigned</th><th>Resolved</th><th>Avg Rating</th></tr></thead>
              <tbody>
                {staffPerformance.map((s) => (
                  <tr key={s.id} style={{ cursor: 'default' }}>
                    <td>{s.name}</td>
                    <td>{s.assigned_complaints}</td>
                    <td>{s.resolved_count}</td>
                    <td>{s.avg_rating ? `${parseFloat(s.avg_rating).toFixed(1)} ★` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}><h3>Priority Breakdown</h3></div>
          <div style={{ padding: 20 }}>
            {priorityStats.map((p) => (
              <div key={p.priority} className="flex justify-between items-center mb-3">
                <PriorityBadge priority={p.priority} />
                <div style={{ flex: 1, margin: '0 12px', height: 8, background: 'var(--color-navy-soft)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(p.count / totals.total) * 100}%`, background: 'var(--color-navy)' }} />
                </div>
                <span className="text-sm font-mono">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}><h3>Recent Complaints</h3></div>
        <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead><tr><th>ID</th><th>Category</th><th>Title</th><th>Student</th><th>Block</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {recentComplaints.map((c) => (
                <tr key={c.complaint_id} style={{ cursor: 'default' }}>
                  <td className="font-mono text-xs">{c.complaint_id}</td>
                  <td>{categoryIcon(c.category)} {c.category}</td>
                  <td>{c.title}</td>
                  <td>{c.student_name}</td>
                  <td>{c.hostel_block}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td className="text-sm text-muted">{formatDate(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
