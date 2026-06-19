import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { StatusBadge, PriorityBadge, SLABadge } from '../components/shared/Badge';
import { PageLoader, EmptyState } from '../components/shared/Loader';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, STATUSES, formatDate, categoryIcon } from '../utils/helpers';

const Complaints = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', search: '' });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page };
      Object.keys(params).forEach((k) => !params[k] && delete params[k]);
      const { data } = await api.get('/complaints', { params });
      setComplaints(data.complaints);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, [filters, page]);

  const title = user.role === 'student' ? 'My Complaints' : user.role === 'staff' ? 'Assigned Complaints' : 'All Complaints';

  return (
    <AppLayout
      title={title}
      actions={user.role === 'student' && (
        <Link to="/complaints/new" className="btn btn-primary btn-sm">+ New Complaint</Link>
      )}
    >
      {location.state?.newComplaint && (
        <div className="card card-padded mb-4" style={{ background: 'var(--color-success-soft)', border: '1px solid var(--color-success)' }}>
          <strong style={{ color: 'var(--color-success)' }}>✓ Complaint {location.state.newComplaint} submitted successfully.</strong>
          <span className="text-sm text-muted"> You'll receive updates as it progresses.</span>
        </div>
      )}

      <div className="card card-padded mb-4">
        <div className="flex gap-3" style={{ flexWrap: 'wrap' }}>
          <input
            className="field-input" placeholder="Search by title or ID…"
            style={{ maxWidth: 260 }}
            value={filters.search}
            onChange={(e) => { setFilters({ ...filters, search: e.target.value }); setPage(1); }}
          />
          <select
            className="field-select" style={{ maxWidth: 180 }}
            value={filters.status}
            onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setPage(1); }}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            className="field-select" style={{ maxWidth: 180 }}
            value={filters.category}
            onChange={(e) => { setFilters({ ...filters, category: e.target.value }); setPage(1); }}
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {loading ? <PageLoader /> : complaints.length === 0 ? (
        <div className="card">
          <EmptyState icon="📭" title="No complaints found" subtitle="Try adjusting your filters" />
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Category</th>
                  <th>Title</th>
                  {user.role !== 'student' && <th>Student</th>}
                  {user.role === 'admin' && <th>Assigned To</th>}
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id} onClick={() => navigate(`/complaints/${c.id}`)}>
                    <td className="font-mono text-xs">{c.complaint_id}</td>
                    <td>{categoryIcon(c.category)} {c.category}</td>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.title}</td>
                    {user.role !== 'student' && <td>{c.student_name}</td>}
                    {user.role === 'admin' && <td>{c.staff_name || <span className="text-faint">Unassigned</span>}</td>}
                    <td><PriorityBadge priority={c.priority} /></td>
                    <td className="flex gap-2 items-center"><StatusBadge status={c.status} /> <SLABadge breached={c.sla_breached} /></td>
                    <td className="text-sm text-muted">{formatDate(c.created_at)}</td>
                    <td style={{ color: 'var(--color-navy)', fontWeight: 600 }}>View →</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(page - 1)}>← Previous</button>
              <span className="text-sm text-muted">Page {page} of {pages}</span>
              <button className="btn btn-secondary btn-sm" disabled={page === pages} onClick={() => setPage(page + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </AppLayout>
  );
};

export default Complaints;
