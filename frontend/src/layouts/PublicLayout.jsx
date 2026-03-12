import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Burger, Drawer, Stack } from '@mantine/core';
import { useDisclosure, useWindowScroll } from '@mantine/hooks';
import { Rss, Feather } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';
import SearchBar from '../components/SearchBar';
import { useAuth } from '../contexts/AuthContext';
import './PublicLayout.less';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Blog', path: '/blog' },
  { label: 'Archives', path: '/archives' },
  { label: 'About', path: '/about' },
];

export default function PublicLayout() {
  const [scroll] = useWindowScroll();
  const [opened, { open, close }] = useDisclosure(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const scrolled = scroll.y > 10;

  return (
    <>
      {/* Header */}
      <header className={`public-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="public-header-inner">
          <div className="public-header-logo" onClick={() => navigate('/')}>
            <Feather size={24} />
            <span className="accent-text">Garden</span>
          </div>

          <nav className="public-header-nav">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `public-header-link ${isActive ? 'active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="public-header-actions">
            <SearchBar />
            <ThemeToggle />
            <a href="/api/rss" target="_blank" rel="noopener noreferrer" title="RSS">
              <Rss size={18} style={{ opacity: 0.6 }} />
            </a>
            {/* Mobile burger */}
            <Burger opened={opened} onClick={open} hiddenFrom="sm" size="sm" />
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <Drawer opened={opened} onClose={close} title="Menu" size="xs">
        <Stack gap="md">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={close}
              style={{ fontSize: '1.1rem', fontWeight: 500 }}
            >
              {item.label}
            </NavLink>
          ))}
          {user && (
            <NavLink to="/admin" onClick={close} style={{ fontWeight: 500, color: '#6366f1' }}>
              Admin Panel
            </NavLink>
          )}
        </Stack>
      </Drawer>

      {/* Page content */}
      <main className="page-wrapper">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="public-footer text-muted">
        <div className="public-footer-inner">
          <div className="public-footer-divider" />
          <p className="public-footer-text">
            © {new Date().getFullYear()} My Digital Garden. Crafted with passion & code.
          </p>
          <div className="public-footer-links">
            <a href="/api/rss" target="_blank" rel="noopener noreferrer">
              RSS Feed
            </a>
            {user && <NavLink to="/admin">Admin</NavLink>}
          </div>
        </div>
      </footer>
    </>
  );
}
