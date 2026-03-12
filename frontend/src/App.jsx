import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import BlogList from './pages/BlogList';
import BlogDetail from './pages/BlogDetail';
import About from './pages/About';
import Archives from './pages/Archives';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import PostEditor from './pages/admin/PostEditor';
import PostManager from './pages/admin/PostManager';
import CategoryManager from './pages/admin/CategoryManager';
import Settings from './pages/admin/Settings';
import Logs from './pages/admin/Logs';

export default function App() {
  const location = useLocation();
  const routeKey = `${location.pathname}${location.search}`;

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={routeKey}>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/post/:slug" element={<BlogDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/archives" element={<Archives />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="posts" element={<PostManager />} />
          <Route path="posts/new" element={<PostEditor />} />
          <Route path="posts/:id/edit" element={<PostEditor />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="settings" element={<Settings />} />
          <Route path="logs" element={<Logs />} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
