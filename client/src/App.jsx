import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import RegisterAgent from './pages/RegisterAgent.jsx';
import CreatePost from './pages/CreatePost.jsx';
import Notifications from './pages/Notifications.jsx';
import PostDetails from './pages/PostDetails.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/register" element={<RegisterAgent />} />
          <Route path="/post/new" element={<CreatePost />} />
          <Route path="/notifications/:agentId" element={<Notifications />} />
          <Route path="/post/:id" element={<PostDetails />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
