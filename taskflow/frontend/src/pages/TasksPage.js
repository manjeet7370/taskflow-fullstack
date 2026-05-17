import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { fetchTasks, createTask, deleteTask, setFilters } from '../store/slices/tasksSlice';
import TaskForm from '../components/tasks/TaskForm';

const Modal = ({ title, onClose, children }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px',
  }} onClick={(e) => e.target === e.currentTarget && onClose()}>
    <div style={{
      background: '#fff', borderRadius: '16px', padding: '32px',
      width: '100%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto',
      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>{title}</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const priorityColor = { low: '#22c55e', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444' };
const statusColor = { todo: '#64748b', in_progress: '#3b82f6', completed: '#22c55e', cancelled: '#ef4444' };

const TaskCard = ({ task, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const canDelete = user?.role === 'admin' || task.createdBy === user?.id;

  return (
    <div style={{
      background: '#fff', borderRadius: '12px', padding: '20px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)', cursor: 'pointer',
      borderTop: `3px solid ${priorityColor[task.priority]}`,
      transition: 'transform 0.15s, box-shadow 0.15s',
    }}
      onClick={() => navigate(`/tasks/${task.id}`)}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#1e293b', flex: 1, marginRight: '8px' }}>
          {task.title}
        </h3>
        {canDelete && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(task.id); }} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444',
            fontSize: '14px', padding: '2px 6px', borderRadius: '4px',
            opacity: 0.7,
          }}>🗑</button>
        )}
      </div>

      {task.description && (
        <p style={{ margin: '0 0 12px', fontSize: '13px', color: '#64748b', lineHeight: '1.4',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {task.description}
        </p>
      )}

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <span style={{
          padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
          background: `${statusColor[task.status]}20`, color: statusColor[task.status],
        }}>{task.status.replace('_', ' ')}</span>
        <span style={{
          padding: '2px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: '600',
          background: `${priorityColor[task.priority]}20`, color: priorityColor[task.priority],
        }}>{task.priority}</span>
        {task.documents?.length > 0 && (
          <span style={{ padding: '2px 8px', borderRadius: '20px', fontSize: '11px', background: '#ede9fe', color: '#7c3aed' }}>
            📎 {task.documents.length}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8' }}>
        <span>{task.assignee ? `👤 ${task.assignee.email.split('@')[0]}` : 'Unassigned'}</span>
        {task.dueDate && <span>📅 {task.dueDate}</span>}
      </div>
    </div>
  );
};

const TasksPage = () => {
  const dispatch = useDispatch();
  const { tasks, pagination, loading, filters } = useSelector((s) => s.tasks);
  const [showModal, setShowModal] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchTasks({ ...filters, page, limit: 12 }));
  }, [dispatch, filters, page]);

  const handleCreate = async (formData) => {
    setTaskLoading(true);
    const result = await dispatch(createTask(formData));
    setTaskLoading(false);
    if (!result.error) {
      toast.success('Task created!');
      setShowModal(false);
    } else {
      toast.error(result.payload);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    const result = await dispatch(deleteTask(id));
    if (!result.error) toast.success('Task deleted');
    else toast.error(result.payload);
  };

  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
    setPage(1);
  };

  const selectStyle = {
    padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #e2e8f0',
    fontSize: '13px', background: '#fff', cursor: 'pointer', color: '#374151',
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>Tasks</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
            {pagination?.total || 0} tasks total
          </p>
        </div>
        <button onClick={() => setShowModal(true)} style={{
          padding: '10px 20px', borderRadius: '8px', border: 'none',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
        }}>+ New Task</button>
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '16px 20px',
        marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <select style={selectStyle} value={filters.status || ''} onChange={(e) => handleFilterChange('status', e.target.value)}>
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select style={selectStyle} value={filters.priority || ''} onChange={(e) => handleFilterChange('priority', e.target.value)}>
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>

        <select style={selectStyle} value={filters.sortBy || 'createdAt'} onChange={(e) => handleFilterChange('sortBy', e.target.value)}>
          <option value="createdAt">Sort: Created</option>
          <option value="dueDate">Sort: Due Date</option>
          <option value="priority">Sort: Priority</option>
          <option value="title">Sort: Title</option>
        </select>

        <select style={selectStyle} value={filters.sortOrder || 'DESC'} onChange={(e) => handleFilterChange('sortOrder', e.target.value)}>
          <option value="DESC">Descending</option>
          <option value="ASC">Ascending</option>
        </select>

        {(filters.status || filters.priority) && (
          <button onClick={() => { dispatch(setFilters({ status: '', priority: '' })); setPage(1); }} style={{
            padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #fecaca',
            background: '#fef2f2', color: '#dc2626', fontSize: '13px', cursor: 'pointer',
          }}>Clear Filters</button>
        )}
      </div>

      {/* Task Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>⏳</div>Loading tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', background: '#fff', borderRadius: '12px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
          <p style={{ fontSize: '16px', marginBottom: '16px' }}>No tasks found</p>
          <button onClick={() => setShowModal(true)} style={{
            padding: '10px 20px', borderRadius: '8px', border: 'none',
            background: '#667eea', color: '#fff', cursor: 'pointer', fontWeight: '600',
          }}>Create your first task</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)} style={{
              width: '36px', height: '36px', borderRadius: '8px',
              border: `1.5px solid ${p === page ? '#6366f1' : '#e2e8f0'}`,
              background: p === page ? '#6366f1' : '#fff',
              color: p === page ? '#fff' : '#374151',
              cursor: 'pointer', fontWeight: p === page ? '600' : '400',
            }}>{p}</button>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="Create New Task" onClose={() => setShowModal(false)}>
          <TaskForm onSubmit={handleCreate} onCancel={() => setShowModal(false)} loading={taskLoading} />
        </Modal>
      )}
    </div>
  );
};

export default TasksPage;
