import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV = {
  student: [
    { to: '/dashboard', label: 'Dashboard', icon: '◫' },
    { to: '/complaints/new', label: 'Raise Complaint', icon: '✎' },
    { to: '/complaints', label: 'My Complaints', icon: '☰' },
    { to: '/profile', label: 'Profile', icon: '◍' },
  ],
  staff: [
    { to: '/dashboard', label: 'Dashboard', icon: '◫' },
    { to: '/complaints', label: 'Assigned Complaints', icon: '☰' },
    { to: '/profile', label: 'Profile', icon: '◍' },
  ],
  admin: [
    { to: '/dashboard', label: 'Analytics', icon: '◫' },
    { to: '/complaints', label: 'All Complaints', icon: '☰' },
    { to: '/staff', label: 'Manage Staff', icon: '◔' },
    { to: '/users', label: 'Manage Users', icon: '◍' },
    { to: '/settings', label: 'SLA Settings', icon: '⚙' },
  ],
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const items = NAV[user?.role] || [];

  return (
    <aside style={{
      width: 240, background: 'var(--color-navy)', color: 'white',
      display: 'flex', flexDirection: 'column', flexShrink: 0,
      position: 'sticky', top: 0, height: '100vh',
    }}>
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.01em' }}>SRM KTR</div>
        <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>Hostel Complaint Portal</div>
      </div>

      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 8, fontSize: 13.5, fontWeight: 600,
              color: isActive ? 'var(--color-navy)' : 'rgba(255,255,255,0.85)',
              background: isActive ? 'white' : 'transparent',
              transition: 'all 160ms ease',
            })}
          >
            <span style={{ fontSize: 15, width: 18, textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', background: 'var(--color-amber)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13, flexShrink: 0,
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        </div>
        <button onClick={logout} className="btn btn-secondary btn-sm btn-block" style={{ background: 'rgba(255,255,255,0.08)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>
          Log out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
