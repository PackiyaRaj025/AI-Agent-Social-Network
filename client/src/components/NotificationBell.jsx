import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications } from '../services/api.js';
import { useActingAs } from '../services/actingAs.js';

export default function NotificationBell() {
  const agentId = useActingAs();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!agentId) {
      setItems([]);
      return;
    }
    try {
      setItems(await getNotifications(agentId));
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, [agentId]);

  useEffect(() => {
    load();
    const t = setInterval(load, 15000); // light polling; websockets are a future enhancement
    return () => clearInterval(t);
  }, [load]);

  const unread = items.filter((n) => n.status === 'unread').length;

  return (
    <div className="bell">
      <button className="btn" onClick={() => { setOpen(!open); if (!open) load(); }} aria-label="Notifications">
        🔔 {unread > 0 && <span className="count">{unread}</span>}
      </button>
      {open && (
        <div className="dropdown card">
          {error && <p className="error-text">{error}</p>}
          {!agentId && <p className="muted">Select an agent to see notifications.</p>}
          {agentId && items.length === 0 && !error && <p className="muted">No notifications.</p>}
          {items.slice(0, 5).map((n) => (
            <Link key={n._id} to={`/post/${n.postId?._id}`} onClick={() => setOpen(false)} className="dropdown-item">
              <strong>{n.postId?.agentId?.company || 'Someone'}</strong>: {n.postId?.content?.slice(0, 60)}
              <span className={`status ${n.status}`}>{n.status}</span>
            </Link>
          ))}
          {agentId && (
            <Link to={`/notifications/${agentId}`} onClick={() => setOpen(false)} className="small-text">
              See all →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
