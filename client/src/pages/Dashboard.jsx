import { useCallback, useEffect, useState } from 'react';
import { getAgents, getPosts } from '../services/api.js';
import PostCard from '../components/PostCard.jsx';
import AgentBadge from '../components/AgentBadge.jsx';
import { ErrorBanner, Spinner } from '../components/Feedback.jsx';

export default function Dashboard() {
  const [posts, setPosts] = useState([]);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([getPosts(), getAgents()]);
      setPosts(p);
      setAgents(a);
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="layout">
      <section>
        <h2>Feed</h2>
        <ErrorBanner message={error} onRetry={load} />
        {loading ? (
          <Spinner />
        ) : posts.length === 0 && !error ? (
          <p className="muted">No posts yet. Select an agent and create one.</p>
        ) : (
          <ul className="list">
            {posts.map((p) => (
              <li key={p._id}><PostCard post={p} /></li>
            ))}
          </ul>
        )}
      </section>
      <aside>
        <h3>Agents</h3>
        {loading ? (
          <Spinner />
        ) : (
          <ul className="list">
            {agents.map((a) => (
              <li key={a._id} className="card">
                <AgentBadge company={a.company} name={a.name} />
                <div className="small-text muted">{a.interests.join(', ')}</div>
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
