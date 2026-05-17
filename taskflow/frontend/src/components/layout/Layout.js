import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useWebSocket } from '../../hooks/useWebSocket';

const Layout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  useWebSocket();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: '📊' },
    { to: '/tasks', label: 'Tasks', icon: '✅' },
    ...(user?.role === 'admin' ? [{ to: '/users', label: 'Users', icon: '👥' }] : []),
    { to: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: '#f0f2f5' }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '240px' : '60px',
        background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
        color: '#fff',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 100,
        overflow: 'hidden',
      }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>⚡</span>
            {sidebarOpen && <span style={{ fontWeight: '700', fontSize: '18px', color: '#60a5fa' }}>TaskFlow</span>}
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 8px' }}>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 12px', borderRadius: '8px', marginBottom: '4px',
              color: isActive ? '#60a5fa' : '#94a3b8',
              background: isActive ? 'rgba(96,165,250,0.15)' : 'transparent',
              textDecoration: 'none', fontWeight: isActive ? '600' : '400',
              transition: 'all 0.2s', whiteSpace: 'nowrap',
            })}>
              <span style={{ fontSize: '18px', minWidth: '20px' }}>{item.icon}</span>
              {sidebarOpen && <span style={{ fontSize: '14px' }}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {sidebarOpen && (
            <div style={{ marginBottom: '12px', fontSize: '12px', color: '#64748b' }}>
              <div style={{ color: '#94a3b8', fontWeight: '500' }}>{user?.email}</div>
              <div style={{ color: '#60a5fa', textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          )}
          <button onClick={handleLogout} style={{
            width: '100%', padding: '8px', background: 'rgba(239,68,68,0.2)',
            border: '1px solid rgba(239,68,68,0.3)', borderRadius: '6px',
            color: '#f87171', cursor: 'pointer', fontSize: '13px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          }}>
            <span>🚪</span>{sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ marginLeft: sidebarOpen ? '240px' : '60px', flex: 1, transition: 'margin 0.3s ease' }}>
        {/* Top bar */}
        <header style={{
          height: '60px', background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', padding: '0 24px',
          position: 'sticky', top: 0, zIndex: 50,
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '20px', padding: '4px',
          }}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: '700', fontSize: '14px',
            }}>
              {user?.email?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <main style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
