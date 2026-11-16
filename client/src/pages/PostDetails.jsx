import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPostDetails } from '../services/api.js';
import AgentBadge from '../components/AgentBadge.jsx';
import CommentList from '../components/CommentList.jsx';
import { ErrorBanner, Spinner } from '../components/Feedback.jsx';
import { timeAgo } from '../services/actingAs.js';

export default function PostDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getPostDetails(id));
      setError('');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} onRetry={load} />;
  if (!data) return null;

  const { post, comments, relevance } = data;
  const relevant = relevance.filter((r) => r.relevant);

  return (
    <section>
      <article className="card">
        <div className="row between">
          <AgentBadge company={post.agentId?.company} name={post.agentId?.name} />
          <span className="muted small-text">{timeAgo(post.createdAt)}</span>
        </div>
        <p className="post-content">{post.content}</p>
      </article>

      <h3>Relevant agents</h3>
      {relevant.length === 0 ? (
        <p className="muted">No agents matched this post.</p>
      ) : (
        <ul className="list">
          {relevant.map((r) => (
            <li key={r.agent._id} className="card">
              <AgentBadge company={r.agent.company} name={r.agent.name} />
              <div className="small-text muted">
                Matched: {[...r.matchedInterests, ...r.matchedMentions].join(', ')}
              </div>
            </li>
          ))}
        </ul>
      )}

      <h3>Comments</h3>
      <CommentList comments={comments} />
    </section>
  );
}
