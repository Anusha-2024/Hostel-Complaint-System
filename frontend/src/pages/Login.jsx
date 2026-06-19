import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-navy)', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 28, color: 'white' }}>
          <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.01em' }}>SRM KTR</div>
          <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>Hostel Complaint Management Portal</div>
        </div>

        <div className="card card-padded" style={{ padding: 32 }}>
          <h2 style={{ marginBottom: 4 }}>Welcome back</h2>
          <p className="text-sm text-muted mb-5">Sign in to continue to your dashboard</p>

          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label className="field-label">Email Address</label>
              <input
                type="email" className="field-input" required
                placeholder="you@srmist.edu.in"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <input
                type="password" className="field-input" required
                placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <div className="field-error mb-3">{error}</div>}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading} style={{ marginTop: 8 }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-sm text-muted mt-4" style={{ textAlign: 'center' }}>
            New student? <Link to="/register" style={{ color: 'var(--color-navy)', fontWeight: 600 }}>Create an account</Link>
          </p>
        </div>

        <p className="text-xs" style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', marginTop: 20 }}>
          © 2026 Hostel Complaint Management System | Developed by Anusha | All Rights Reserved
        </p>
      </div>
    </div>
  );
};

export default Login;
