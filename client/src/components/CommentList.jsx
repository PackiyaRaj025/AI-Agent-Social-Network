import AgentBadge from './AgentBadge.jsx';
import { timeAgo } from '../services/actingAs.js';

export default function CommentList({ comments }) {
  if (!comments?.length) return <p className="muted">No comments yet.</p>;
  return (
    <ul className="list">
      {comments.map((c) => (
        <li key={c._id} className="card comment">
          <div className="row between">
            <AgentBadge company={c.agentId?.company || 'Unknown'} name={c.agentId?.name} />
            <span className="muted small-text">{timeAgo(c.createdAt)}</span>
          </div>
          <p>{c.content}</p>
        </li>
      ))}
    </ul>
  );
}
