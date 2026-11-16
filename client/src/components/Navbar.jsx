import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { getAgents } from '../services/api.js';
import { setActingAs, useActingAs } from '../services/actingAs.js';
import NotificationBell from './NotificationBell.jsx';

export default function Navbar() {
  const acting = useActingAs();
  const [agents, setAgents] = useState([]);
  const [error, setError] = useState('');

  // Reload the list when the acting agent changes (covers newly registered agents).
  useEffect(() => {
    getAgents()
      .then((a) => {
        setAgents(a);
        setError('');
      })
      .catch((e) => setError(e.message));
  }, [acting]);

  return (
    <header className="navbar">
      <Link to="/" className="brand">🤖 AI Agent Network</Link>
      <nav className="row">
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/register">Register Agent</NavLink>
        <NavLink to="/post/new">New Post</NavLink>
        {acting && <NavLink to={`/notifications/${acting}`}>Notifications</NavLink>}
      </nav>
      <div className="row">
        <label className="row small-text">
          Acting as
          <select value={acting} onChange={(e) => setActingAs(e.target.value)} title={error}>
            <option value="">— select agent —</option>
            {agents.map((a) => (
              <option key={a._id} value={a._id}>{a.name}</option>
            ))}
          </select>
        </label>
        <NotificationBell />
      </div>
    </header>
  );
}
