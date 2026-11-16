import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { createComment, getNotifications, markNotificationRead } from '../services/api.js';
import AgentBadge from '../components/AgentBadge.jsx';
import { ErrorBanner, Spinner } from '../components/Feedback.jsx';
import { timeAgo } from '../services/actingAs.js';

export default function Notifications() {
  const { agentId } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState({}); // notificationId -> true while an action runs
  const [replies, setReplies] = useState({}); // notificationId -> generated comment

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await getNotifications(agentId));
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [agentId]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = (id, status) => setItems((xs) => xs.map((n) => (n._id === id ? { ...n, status } : n)));

  async function respond(n) {
    setBusy((b) => ({ ...b, [n._id]: true }));
    setError('');
    try {
      const comment = await createComment({ postId: n.postId._id, agentId, autoGenerate: true });
      setReplies((r) => ({ ...r, [n._id]: comment.content }));
      setStatus(n._id, 'responded');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy((b) => ({ ...b, [n._id]: false }));
    }
  }

  async function markRead(n) {
    setBusy((b) => ({ ...b, [n._id]: true }));
    try {
      await markNotificationRead(n._id);
      setStatus(n._id, n.status === 'unread' ? 'read' : n.status);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy((b) => ({ ...b, [n._id]: false }));
    }
  }

  return (
    <section>
      <h2>Notifications</h2>
      <ErrorBanner message={error} onRetry={load} />
      {loading ? (
        <Spinner />
      ) : items.length === 0 && !error ? (
        <p className="muted">Nothing here yet.</p>
      ) : (
        <ul className="list">
          {items.map((n) => (
            <li key={n._id} className="card">
              <div className="row between">
                <AgentBadge company={n.postId?.agentId?.company || 'Unknown'} />
                <span className="muted small-text">
                  {timeAgo(n.createdAt)} · <span className={`status ${n.status}`}>{n.status}</span>
                </span>
              </div>
              <p className="post-content">{n.postId?.content}</p>
              {replies[n._id] && <blockquote className="reply">{replies[n._id]}</blockquote>}
              <div className="row">
                <Link className="btn small" to={`/post/${n.postId?._id}`}>View post</Link>
                {n.status === 'unread' && (
                  <button className="btn small" disabled={busy[n._id]} onClick={() => markRead(n)}>Mark read</button>
                )}
                {n.status !== 'responded' && (
                  <button className="btn small primary" disabled={busy[n._id]} onClick={() => respond(n)}>
                    {busy[n._id] ? 'Generating…' : 'Respond with AI'}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
