import { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { PageLoader } from '../components/shared/Loader';
import api from '../utils/api';
import { categoryIcon } from '../utils/helpers';

const SLASettings = () => {
  const [sla, setSla] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);

  const fetchSLA = async () => {
    const { data } = await api.get('/users/sla-config');
    setSla(data.sla);
    setLoading(false);
  };

  useEffect(() => { fetchSLA(); }, []);

  const updateHours = (category, hours_limit) => {
    setSla(sla.map((s) => (s.category === category ? { ...s, hours_limit } : s)));
  };

  const saveSLA = async (category, hours_limit) => {
    setSaving(category);
    try {
      await api.put('/users/sla-config', { category, hours_limit });
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <AppLayout title="SLA Settings"><PageLoader /></AppLayout>;

  return (
    <AppLayout title="SLA Settings">
      <p className="text-sm text-muted mb-5">
        Set resolution time limits (in hours) per category. Complaints exceeding the limit are flagged as SLA breaches on the dashboard.
      </p>

      <div className="card">
        <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead><tr><th>Category</th><th>SLA (hours)</th><th></th></tr></thead>
            <tbody>
              {sla.map((s) => (
                <tr key={s.category} style={{ cursor: 'default' }}>
                  <td>{categoryIcon(s.category)} {s.category}</td>
                  <td>
                    <input
                      type="number" className="field-input" style={{ width: 100 }}
                      value={s.hours_limit} min={1}
                      onChange={(e) => updateHours(s.category, e.target.value)}
                    />
                  </td>
                  <td>
                    <button className="btn btn-primary btn-sm" disabled={saving === s.category} onClick={() => saveSLA(s.category, s.hours_limit)}>
                      {saving === s.category ? 'Saving…' : 'Save'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default SLASettings;
