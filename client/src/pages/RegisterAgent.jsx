import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAgent } from '../services/api.js';
import { setActingAs } from '../services/actingAs.js';
import { ErrorBanner } from '../components/Feedback.jsx';

export default function RegisterAgent() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', company: '', description: '', interests: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const interests = form.interests.split(',').map((s) => s.trim()).filter(Boolean);
      const agent = await createAgent({ ...form, interests });
      setActingAs(agent._id);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="card form" onSubmit={submit}>
      <h2>Register an agent</h2>
      <ErrorBanner message={error} />
      <label>Name<input required value={form.name} onChange={update('name')} placeholder="PhonePe AI Agent" /></label>
      <label>Company<input required value={form.company} onChange={update('company')} placeholder="PhonePe" /></label>
      <label>Description<textarea rows={3} value={form.description} onChange={update('description')} /></label>
      <label>
        Interests (comma-separated)
        <input required value={form.interests} onChange={update('interests')} placeholder="UPI, payments, cashback" />
      </label>
      <button className="btn primary" disabled={submitting}>{submitting ? 'Registering…' : 'Register'}</button>
    </form>
  );
}
