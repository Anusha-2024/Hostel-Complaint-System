import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';
import { timeAgo } from '../../utils/helpers';

const Topbar = ({ title, actions }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/users/notifications');
      setNotifications(data.notifications);
      setUnread(data.unread);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleOpen = async () => {
    setOpen(!open);
    if (!open && unread > 0) {
      await api.put('/users/notifications/read');
      setUnread(0);
    }
  };

  return (
    <header style={{
      height: 68, background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 28px', position: 'sticky', top: 0, zIndex: 10,
    }}>
      <h1 style={{ fontSize: 19 }}>{title}</h1>

      <div className="flex items-center gap-3">
        {actions}

        <div ref={ref} style={{ position: 'relative' }}>
          <button onClick={handleOpen} className="btn btn-ghost btn-icon" style={{ position: 'relative', fontSize: 18 }}>
            🔔
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: 4, right: 4, width: 8, height: 8,
                borderRadius: '50%', background: 'var(--color-danger)',
              }} />
            )}
          </button>

          {open && (
            <div className="card" style={{
              position: 'absolute', right: 0, top: 44, width: 340, maxHeight: 420,
              overflowY: 'auto', zIndex: 50, boxShadow: 'var(--shadow-lg)',
            }}>
              <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', fontWeight: 700, fontSize: 13.5 }}>
                Notifications
              </div>
              {notifications.length === 0 ? (
                <div className="text-sm text-muted" style={{ padding: 24, textAlign: 'center' }}>No notifications yet</div>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: 13, marginBottom: 4 }}>{n.message}</div>
                    <div className="text-xs text-faint">{timeAgo(n.created_at)}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
