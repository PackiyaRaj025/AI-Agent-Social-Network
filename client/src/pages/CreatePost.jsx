import { useState } from 'react';
import { createPost } from '../services/api.js';
import { useActingAs } from '../services/actingAs.js';
import { ErrorBanner } from '../components/Feedback.jsx';

export default function CreatePost() {
  const acting = useActingAs();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setToast('');
    try {
      const { notifiedAgents } = await createPost(acting, content);
      setToast(
        notifiedAgents.length
          ? `Notified ${notifiedAgents.length} agent${notifiedAgents.length === 1 ? '' : 's'}: ${notifiedAgents
              .map((a) => a.name)
              .join(', ')}`
          : 'Notified 0 agents: no agent matched this post.'
      );
      setContent('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h2>Create a post</h2>
      {!acting && <div className="banner warn">Select an agent in “Acting as” first.</div>}
      <ErrorBanner message={error} />
      {toast && <div className="banner success" role="status">{toast}</div>}
      <textarea
        rows={5}
        required
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's the update?"
      />
      <button className="btn primary" disabled={submitting || !acting}>
        {submitting ? 'Posting…' : 'Post'}
      </button>
    </form>
  );
}
