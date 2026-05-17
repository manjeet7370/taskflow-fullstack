import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchTask, updateTask, deleteTask } from '../store/slices/tasksSlice';
import { tasksAPI } from '../services/api';
import TaskForm from '../components/tasks/TaskForm';

const Badge = ({ children, color }) => (
  <span style={{
    padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
    background: `${color}20`, color,
  }}>{children}</span>
);

const TaskDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentTask: task, loading } = useSelector((s) => s.tasks);
  const { user } = useSelector((s) => s.auth);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(fetchTask(id));
  }, [dispatch, id]);

  const handleUpdate = async (formData) => {
    setSaving(true);
    const result = await dispatch(updateTask({ id, data: formData }));
    setSaving(false);
    if (!result.error) {
      toast.success('Task updated!');
      setEditing(false);
    } else {
      toast.error(result.payload);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    const result = await dispatch(deleteTask(id));
    if (!result.error) {
      toast.success('Task deleted');
      navigate('/tasks');
    }
  };

  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Remove this document?')) return;
    try {
      await tasksAPI.deleteDocument(id, docId);
      toast.success('Document removed');
      dispatch(fetchTask(id));
    } catch {
      toast.error('Failed to remove document');
    }
  };

  const priorityColor = { low: '#22c55e', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444' };
  const statusColor = { todo: '#64748b', in_progress: '#3b82f6', completed: '#22c55e', cancelled: '#ef4444' };

  const canEdit = user?.role === 'admin' || task?.createdBy === user?.id;

  if (loading && !task) {
    return <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading...</div>;
  }

  if (!task) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <p>Task not found</p>
        <button onClick={() => navigate('/tasks')} style={{ padding: '10px 20px', borderRadius: '8px', background: '#667eea', color: '#fff', border: 'none', cursor: 'pointer' }}>
          Back to Tasks
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/tasks')} style={{
        background: 'none', border: 'none', cursor: 'pointer', color: '#64748b',
        fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '4px',
      }}>← Back to Tasks</button>

      <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        {editing ? (
          <>
            <h2 style={{ margin: '0 0 24px', color: '#1e293b' }}>Edit Task</h2>
            <TaskForm task={task} onSubmit={handleUpdate} onCancel={() => setEditing(false)} loading={saving} />
          </>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <h1 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                  {task.title}
                </h1>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Badge color={statusColor[task.status]}>{task.status.replace('_', ' ')}</Badge>
                  <Badge color={priorityColor[task.priority]}>{task.priority}</Badge>
                </div>
              </div>
              {canEdit && (
                <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                  <button onClick={() => setEditing(true)} style={{
                    padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #6366f1',
                    background: '#fff', color: '#6366f1', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                  }}>✏️ Edit</button>
                  <button onClick={handleDelete} style={{
                    padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #ef4444',
                    background: '#fff', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                  }}>🗑 Delete</button>
                </div>
              )}
            </div>

            {task.description && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: '600', color: '#374151' }}>Description</h3>
                <p style={{ margin: 0, color: '#64748b', lineHeight: '1.6' }}>{task.description}</p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Created by', value: task.creator?.email || '—' },
                { label: 'Assigned to', value: task.assignee?.email || 'Unassigned' },
                { label: 'Due Date', value: task.dueDate || '—' },
                { label: 'Created', value: new Date(task.createdAt).toLocaleDateString() },
              ].map((item) => (
                <div key={item.label} style={{
                  padding: '12px 16px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0',
                }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '600', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Documents */}
            <div>
              <h3 style={{ margin: '0 0 12px', fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
                📎 Attached Documents ({task.documents?.length || 0}/3)
              </h3>
              {task.documents?.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '14px', fontStyle: 'italic' }}>No documents attached</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {task.documents.map((doc) => (
                    <div key={doc.id} style={{
                      display: 'flex', alignItems: 'center', padding: '12px 16px',
                      borderRadius: '8px', border: '1.5px solid #e2e8f0', background: '#fafafa',
                      gap: '12px',
                    }}>
                      <span style={{ fontSize: '20px' }}>📄</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', fontSize: '14px', color: '#374151' }}>{doc.originalName}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                          {(doc.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                      <a href={tasksAPI.downloadDocument(id, doc.id)} target="_blank" rel="noreferrer" style={{
                        padding: '6px 12px', borderRadius: '6px', background: '#ede9fe', color: '#7c3aed',
                        textDecoration: 'none', fontSize: '12px', fontWeight: '600',
                      }}>View PDF</a>
                      {canEdit && (
                        <button onClick={() => handleDeleteDoc(doc.id)} style={{
                          background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '16px',
                        }}>✕</button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskDetailPage;
