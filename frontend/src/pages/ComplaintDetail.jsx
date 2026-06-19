import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { StatusBadge, PriorityBadge, SLABadge } from '../components/shared/Badge';
import { PageLoader } from '../components/shared/Loader';
import api, { ASSET_BASE } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, categoryIcon, STATUSES } from '../utils/helpers';

const ComplaintDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState([]);
  const [statusForm, setStatusForm] = useState({ status: '', remarks: '' });
  const [proofImage, setProofImage] = useState(null);
  const [assignStaffId, setAssignStaffId] = useState('');
  const [feedbackForm, setFeedbackForm] = useState({ rating: 0, comment: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const { data: res } = await api.get(`/complaints/${id}`);
      setData(res);
      setStatusForm({ status: res.complaint.status, remarks: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  useEffect(() => {
    if (user.role === 'admin') {
      api.get('/users/staff').then(({ data }) => setStaffList(data.staff)).catch(() => {});
    }
  }, [user.role]);

  if (loading) return <AppLayout title="Complaint Details"><PageLoader /></AppLayout>;
  if (!data) return <AppLayout title="Complaint Details"><p>Complaint not found.</p></AppLayout>;

  const { complaint, updates, feedback } = data;
  const canUpdateStatus = (user.role === 'staff' && complaint.assigned_to === user.id) || user.role === 'admin';
  const canGiveFeedback = user.role === 'student' && complaint.status === 'Resolved' && !feedback;

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('status', statusForm.status);
      fd.append('remarks', statusForm.remarks);
      if (proofImage) fd.append('proof_image', proofImage);

      await api.put(`/complaints/${id}/status`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProofImage(null);
      setStatusForm({ ...statusForm, remarks: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignStaffId) return;
    setSubmitting(true);
    try {
      await api.put(`/complaints/${id}/assign`, { staff_id: assignStaffId });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackForm.rating) return setError('Please select a star rating');
    setSubmitting(true);
    try {
      await api.post('/feedback', { complaint_id: complaint.id, ...feedbackForm });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout title="Complaint Details" actions={
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(-1)}>← Back</button>
    }>
      <div className="grid-2" style={{ gridTemplateColumns: '1.4fr 1fr', alignItems: 'start' }}>
        {/* LEFT COLUMN */}
        <div className="flex flex-col gap-4">
          <div className="card card-padded">
            <div className="flex justify-between items-center mb-3">
              <span className="font-mono text-xs text-faint">{complaint.complaint_id}</span>
              <div className="flex gap-2">
                <PriorityBadge priority={complaint.priority} />
                <StatusBadge status={complaint.status} />
                <SLABadge breached={complaint.sla_breached} />
              </div>
            </div>
            <h2 className="mb-2">{categoryIcon(complaint.category)} {complaint.title}</h2>
            <p className="text-sm" style={{ lineHeight: 1.7, color: 'var(--color-ink-soft)' }}>{complaint.description}</p>

            {complaint.image_url && (
              <img
                src={`${ASSET_BASE}${complaint.image_url}`} alt="complaint"
                style={{ width: '100%', maxWidth: 320, borderRadius: 10, marginTop: 16, border: '1px solid var(--color-border)' }}
              />
            )}

            <hr className="divider" />

            <div className="grid-2" style={{ gap: 16 }}>
              <div><div className="field-label mb-1">Category</div><div className="text-sm">{complaint.category}</div></div>
              <div><div className="field-label mb-1">Location</div><div className="text-sm">{complaint.hostel_block || '—'}, Room {complaint.room_no || '—'}</div></div>
              <div><div className="field-label mb-1">Submitted</div><div className="text-sm">{formatDate(complaint.created_at)}</div></div>
              <div><div className="field-label mb-1">SLA Deadline</div><div className="text-sm">{formatDate(complaint.sla_deadline)}</div></div>
              {user.role !== 'student' && (
                <>
                  <div><div className="field-label mb-1">Student</div><div className="text-sm">{complaint.student_name} ({complaint.reg_no || '—'})</div></div>
                  <div><div className="field-label mb-1">Assigned To</div><div className="text-sm">{complaint.staff_name || 'Unassigned'}</div></div>
                </>
              )}
            </div>
          </div>

          {/* TIMELINE */}
          <div className="card card-padded">
            <h3 className="mb-4">Timeline</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {updates.map((u, i) => (
                <div key={u.id} style={{ display: 'flex', gap: 14, position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%', background: 'var(--color-navy)',
                      marginTop: 4, flexShrink: 0,
                    }} />
                    {i < updates.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--color-border)', minHeight: 32 }} />}
                  </div>
                  <div style={{ paddingBottom: 20 }}>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={u.status} />
                      <span className="text-xs text-faint">{formatDate(u.timestamp)}</span>
                    </div>
                    {u.remarks && <div className="text-sm text-muted">{u.remarks}</div>}
                    <div className="text-xs text-faint mt-1">by {u.updated_by_name} ({u.updated_by_role})</div>
                    {u.proof_image && (
                      <img src={`${ASSET_BASE}${u.proof_image}`} alt="proof" style={{ width: 120, borderRadius: 8, marginTop: 8, border: '1px solid var(--color-border)' }} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {feedback && (
            <div className="card card-padded">
              <h3 className="mb-3">Your Feedback</h3>
              <div style={{ fontSize: 20, marginBottom: 6 }}>{'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}</div>
              {feedback.comment && <p className="text-sm text-muted">{feedback.comment}</p>}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN — ACTIONS */}
        <div className="flex flex-col gap-4">
          {user.role === 'admin' && !complaint.assigned_to && (
            <div className="card card-padded">
              <h3 className="mb-3">Assign Staff</h3>
              <form onSubmit={handleAssign}>
                <select className="field-select mb-3" value={assignStaffId} onChange={(e) => setAssignStaffId(e.target.value)} required>
                  <option value="">Select staff member</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — {s.department} ({s.active_complaints} active)</option>
                  ))}
                </select>
                <button className="btn btn-primary btn-block btn-sm" disabled={submitting}>Assign</button>
              </form>
            </div>
          )}

          {canUpdateStatus && (
            <div className="card card-padded">
              <h3 className="mb-3">Update Status</h3>
              <form onSubmit={handleStatusUpdate}>
                <div className="field-group">
                  <label className="field-label">New Status</label>
                  <select className="field-select" value={statusForm.status} onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value })}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label className="field-label">Remarks</label>
                  <textarea className="field-textarea" placeholder="Add notes about this update…" value={statusForm.remarks} onChange={(e) => setStatusForm({ ...statusForm, remarks: e.target.value })} />
                </div>
                <div className="field-group">
                  <label className="field-label">Proof of Work (optional)</label>
                  <input type="file" accept="image/*" className="field-input" style={{ padding: 8 }} onChange={(e) => setProofImage(e.target.files[0])} />
                </div>
                {error && <div className="field-error mb-3">{error}</div>}
                <button className="btn btn-primary btn-block" disabled={submitting}>{submitting ? 'Updating…' : 'Update Status'}</button>
              </form>
            </div>
          )}

          {canGiveFeedback && (
            <div className="card card-padded">
              <h3 className="mb-3">Rate the Service</h3>
              <form onSubmit={handleFeedback}>
                <div className="flex gap-2 mb-3" style={{ fontSize: 28 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                      style={{ cursor: 'pointer', color: star <= feedbackForm.rating ? 'var(--color-amber)' : 'var(--color-border-strong)' }}
                    >★</span>
                  ))}
                </div>
                <div className="field-group">
                  <textarea className="field-textarea" placeholder="Any comments about the resolution? (optional)" value={feedbackForm.comment} onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })} />
                </div>
                {error && <div className="field-error mb-3">{error}</div>}
                <button className="btn btn-amber btn-block" disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Feedback & Close'}</button>
              </form>
            </div>
          )}

          {user.role === 'admin' && (
            <button
              className="btn btn-danger btn-block"
              onClick={async () => {
                if (confirm('Delete this complaint permanently?')) {
                  await api.delete(`/complaints/${id}`);
                  navigate('/complaints');
                }
              }}
            >
              Delete Complaint
            </button>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ComplaintDetail;
