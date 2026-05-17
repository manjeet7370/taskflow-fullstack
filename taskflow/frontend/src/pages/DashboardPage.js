import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchTasks } from '../store/slices/tasksSlice';

const StatCard = ({ label, value, icon, color }) => (
  <div style={{
    background: '#fff', borderRadius: '12px', padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    borderLeft: `4px solid ${color}`,
    display: 'flex', alignItems: 'center', gap: '16px',
  }}>
    <div style={{
      width: '50px', height: '50px', borderRadius: '12px',
      background: `${color}20`, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: '24px',
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e293b' }}>{value}</div>
      <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>{label}</div>
    </div>
  </div>
);

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { tasks, loading } = useSelector((s) => s.tasks);
  const { user } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(fetchTasks({ limit: 100 }));
  }, [dispatch]);

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    urgent: tasks.filter((t) => t.priority === 'urgent').length,
  };

  const recentTasks = tasks.slice(0, 5);

  const priorityColor = { low: '#22c55e', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444' };
  const statusColor = { todo: '#64748b', in_progress: '#3b82f6', completed: '#22c55e', cancelled: '#ef4444' };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
          Welcome back, {user?.email?.split('@')[0]} 👋
        </h1>
        <p style={{ margin: '4px 0 0', color: '#64748b' }}>Here's your task overview</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Total Tasks" value={stats.total} icon="📋" color="#6366f1" />
        <StatCard label="To Do" value={stats.todo} icon="📝" color="#64748b" />
        <StatCard label="In Progress" value={stats.inProgress} icon="🔄" color="#3b82f6" />
        <StatCard label="Completed" value={stats.completed} icon="✅" color="#22c55e" />
        <StatCard label="Urgent" value={stats.urgent} icon="🚨" color="#ef4444" />
      </div>

      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Recent Tasks</h2>
          <Link to="/tasks" style={{ color: '#6366f1', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
            View all →
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading...</div>
        ) : recentTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <p>No tasks yet. <Link to="/tasks" style={{ color: '#6366f1' }}>Create your first task</Link></p>
          </div>
        ) : (
          <div>
            {recentTasks.map((task) => (
              <Link key={task.id} to={`/tasks/${task.id}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px', borderRadius: '8px', marginBottom: '4px',
                  transition: 'background 0.15s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500', color: '#1e293b', fontSize: '14px' }}>{task.title}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                      {task.dueDate && `Due: ${task.dueDate}`}
                    </div>
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                    background: `${priorityColor[task.priority]}20`,
                    color: priorityColor[task.priority],
                  }}>{task.priority}</span>
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
                    background: `${statusColor[task.status]}20`,
                    color: statusColor[task.status],
                  }}>{task.status.replace('_', ' ')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
