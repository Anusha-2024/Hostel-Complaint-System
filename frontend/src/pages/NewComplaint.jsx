import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import api from '../utils/api';
import { CATEGORIES, PRIORITIES, categoryIcon } from '../utils/helpers';

const NewComplaint = () => {
  const [form, setForm] = useState({ category: '', title: '', description: '', priority: 'Medium' });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.category) return setError('Please select a category');

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);

      const { data } = await api.post('/complaints', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      navigate('/complaints', { state: { newComplaint: data.complaint_id } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Raise a Complaint">
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        <p className="text-sm text-muted mb-5">
          Fill in the details below. Your complaint will be auto-assigned to the relevant maintenance team based on category.
        </p>

        <form onSubmit={handleSubmit} className="card card-padded">
          <div className="field-group">
            <label className="field-label">Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8 }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setForm({ ...form, category: cat })}
                  className="btn"
                  style={{
                    flexDirection: 'column', gap: 4, padding: '12px 6px', fontSize: 11.5,
                    border: `1.5px solid ${form.category === cat ? 'var(--color-navy)' : 'var(--color-border-strong)'}`,
                    background: form.category === cat ? 'var(--color-navy-soft)' : 'white',
                    color: form.category === cat ? 'var(--color-navy)' : 'var(--color-ink-soft)',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{categoryIcon(cat)}</span>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">Complaint Title</label>
            <input
              className="field-input" required maxLength={200}
              placeholder="e.g. Fan not working in room"
              value={form.title} onChange={update('title')}
            />
          </div>

          <div className="field-group">
            <label className="field-label">Description</label>
            <textarea
              className="field-textarea" required
              placeholder="Describe the issue in detail — when it started, what exactly is wrong, etc."
              value={form.description} onChange={update('description')}
            />
          </div>

          <div className="field-group">
            <label className="field-label">Priority</label>
            <select className="field-select" value={form.priority} onChange={update('priority')}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <span className="field-hint">Select "Critical" only for safety-related issues (e.g. exposed wiring, gas leak)</span>
          </div>

          <div className="field-group">
            <label className="field-label">Attach Photo (optional)</label>
            <input type="file" accept="image/*" onChange={handleImage} className="field-input" style={{ padding: 8 }} />
            {preview && (
              <img src={preview} alt="preview" style={{ width: 140, height: 140, objectFit: 'cover', borderRadius: 8, marginTop: 8, border: '1px solid var(--color-border)' }} />
            )}
          </div>

          {error && <div className="field-error mb-3">{error}</div>}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'Submitting…' : 'Submit Complaint'}
          </button>
        </form>
      </div>
    </AppLayout>
  );
};

export default NewComplaint;
