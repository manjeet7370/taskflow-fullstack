import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { usersAPI } from '../services/api';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await usersAPI.getAll({ page, limit: 10, search, role: roleFilter });
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination);
    } catch (err) {
      toast.error('Failed to fetch users');
    }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, [page, search, roleFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this user? This will also delete their tasks.')) return;
    try {
      await usersAPI.delete(id);
      toast.success('User deleted');
      fetchUsers();
    } catch { toast.error('Failed to delete user'); }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await usersAPI.update(id, { role: newRole });
      toast.success('Role updated');
      fetchUsers();
    } catch { toast.error('Failed to update role'); }
  };

  const roleColor = { admin: '#6366f1', user: '#22c55e' };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>User Management</h1>
        <p style={{ margin: '4px 0 0', color: '#64748b' }}>{pagination?.total || 0} total users</p>
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '16px 20px',
        marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        display: 'flex', gap: '12px', flexWrap: 'wrap',
      }}>
        <input
          type="text" placeholder="Search by email..."
          value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={{
            padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0',
            fontSize: '13px', flex: 1, minWidth: '200px', outline: 'none',
          }}
        />
        <select
          value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          style={{
            padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0',
            fontSize: '13px', background: '#fff', cursor: 'pointer',
          }}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                <th key={h} style={{
                  padding: '12px 16px', textAlign: 'left',
                  fontSize: '12px', fontWeight: '600', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No users found</td></tr>
            ) : users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '14px 16px', fontSize: '14px', color: '#1e293b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea, #764ba2)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: '700', fontSize: '12px',
                    }}>{u.email[0].toUpperCase()}</div>
                    {u.email}
                  </div>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)} style={{
                    padding: '4px 8px', borderRadius: '6px', border: '1.5px solid #e2e8f0',
                    fontSize: '12px', background: `${roleColor[u.role]}15`, color: roleColor[u.role],
                    fontWeight: '600', cursor: 'pointer',
                  }}>
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                    background: u.isActive ? '#dcfce7' : '#fee2e2',
                    color: u.isActive ? '#16a34a' : '#dc2626',
                  }}>{u.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '13px', color: '#64748b' }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <button onClick={() => handleDelete(u.id)} style={{
                    padding: '6px 12px', borderRadius: '6px', border: '1.5px solid #fecaca',
                    background: '#fef2f2', color: '#dc2626', cursor: 'pointer', fontSize: '12px', fontWeight: '600',
                  }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pagination && pagination.totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '16px' }}>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} style={{
                width: '32px', height: '32px', borderRadius: '6px',
                border: `1.5px solid ${p === page ? '#6366f1' : '#e2e8f0'}`,
                background: p === page ? '#6366f1' : '#fff',
                color: p === page ? '#fff' : '#374151', cursor: 'pointer', fontSize: '13px',
              }}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
