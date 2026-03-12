import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Avatar, Button, Text, Burger } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Settings,
  LogOut,
  ClipboardList,
  Feather,
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import './AdminLayout.less';

const SIDEBAR_ITEMS = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
  { label: 'Posts', path: '/admin/posts', icon: FileText },
  { label: 'Categories & Tags', path: '/admin/categories', icon: FolderOpen },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
  { label: 'Activity Logs', path: '/admin/logs', icon: ClipboardList },
];

export default function AdminLayout() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, { toggle }] = useDisclosure(false);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-layout-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="admin-layout-logo">
          <Feather size={22} />
          <span className="accent-text">Admin</span>
        </div>

        <nav className="admin-layout-nav">
          {SIDEBAR_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `admin-layout-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-layout-user">
          <Avatar src={user.avatar} radius="xl" size="sm" />
          <div style={{ flex: 1 }}>
            <Text size="sm" fw={600}>{user.username}</Text>
            <Text size="xs" c="dimmed">{user.role}</Text>
          </div>
          <Button
            variant="subtle"
            color="red"
            size="xs"
            onClick={() => { logout(); navigate('/login'); }}
            leftSection={<LogOut size={14} />}
          >
            Exit
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="admin-layout-main">
        <div className="admin-layout-topbar">
          <Burger opened={sidebarOpen} onClick={toggle} hiddenFrom="md" size="sm" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              variant="light"
              size="xs"
              onClick={() => navigate('/')}
            >
              View Site
            </Button>
            <ThemeToggle />
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
