import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HOSTEL_BLOCKS = ['Adhiyaman Hostel', 'Oori Hostel', 'Kaari Hostel', 'Paari Hostel', 'Nelson Hostel', 'N-block', 'M-block', 'Kalpana Chawla', 'Meenakshi Hostel', 'Senbagam Hostel', 'Esq A Hostel', 'Esq B Hostel', 'Thamarai Hostel'];

const Register = () => {
  const [form, setForm] = useState({
    name: '', email: '', password: '', reg_no: '', hostel_block: '', room_no: '', phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-navy)', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 24, color: 'white' }}>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.01em' }}>SRM KTR</div>
          <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>Hostel Complaint Management Portal</div>
        </div>

        <div className="card card-padded" style={{ padding: 32 }}>
          <h2 style={{ marginBottom: 4 }}>Create student account</h2>
          <p className="text-sm text-muted mb-5">Register with your SRM hostel details</p>

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label">Full Name</label>
              <input className="field-input" required value={form.name} onChange={update('name')} placeholder="Enter Your Name" />
            </div>

            <div className="grid-2">
              <div className="field-group">
                <label className="field-label">Registration No.</label>
                <input className="field-input" value={form.reg_no} onChange={update('reg_no')} placeholder="RA2211003xxxxx" />
              </div>
              <div className="field-group">
                <label className="field-label">Phone</label>
                <input className="field-input" value={form.phone} onChange={update('phone')} placeholder="98xxxxxxxx" />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Email Address</label>
              <input type="email" className="field-input" required value={form.email} onChange={update('email')} placeholder="you@srmist.edu.in" />
            </div>

            <div className="grid-2">
              <div className="field-group">
                <label className="field-label">Hostel Block</label>
                <select className="field-select" required value={form.hostel_block} onChange={update('hostel_block')}>
                  <option value="">Select block</option>
                  {HOSTEL_BLOCKS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Room No.</label>
                <input className="field-input" required value={form.room_no} onChange={update('room_no')} placeholder="102" />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <input type="password" className="field-input" required minLength={6} value={form.password} onChange={update('password')} placeholder="At least 6 characters" />
            </div>

            {error && <div className="field-error mb-3">{error}</div>}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-sm text-muted mt-4" style={{ textAlign: 'center' }}>
            Already have an account? <Link to="/login" style={{ color: 'var(--color-navy)', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
