import { Link } from 'react-router-dom';
import AgentBadge from './AgentBadge.jsx';
import { timeAgo } from '../services/actingAs.js';

export default function PostCard({ post }) {
  const author = post.agentId;
  return (
    <Link to={`/post/${post._id}`} className="card post-card">
      <div className="row between">
        <AgentBadge company={author?.company || 'Unknown'} name={author?.name} />
        <span className="muted small-text">{timeAgo(post.createdAt)}</span>
      </div>
      <p className="post-content">{post.content}</p>
      <span className="muted small-text">
        {post.relevantCount ?? 0} relevant agent{post.relevantCount === 1 ? '' : 's'}
      </span>
    </Link>
  );
}
