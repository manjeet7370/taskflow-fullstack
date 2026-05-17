import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { usersAPI } from '../../services/api';

const TaskForm = ({ task, onSubmit, onCancel, loading }) => {
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [fileError, setFileError] = useState('');
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: task ? {
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      assignedTo: task.assignedTo,
    } : { status: 'todo', priority: 'medium' },
  });

  useEffect(() => {
    usersAPI.getAll({ limit: 100 }).then((res) => setUsers(res.data.data?.users || [])).catch(() => {});
  }, []);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    const existingDocs = task?.documents?.length || 0;
    if (selected.length + existingDocs > 3) {
      setFileError(`Max 3 documents total. You have ${existingDocs} existing.`);
      return;
    }
    setFileError('');
    setFiles(selected);
  };

  const handleFormSubmit = (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => { if (v) formData.append(k, v); });
    files.forEach((file) => formData.append('documents', file));
    onSubmit(formData);
  };

  const inputStyle = (hasError) => ({
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: `1.5px solid ${hasError ? '#ef4444' : '#e2e8f0'}`,
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    background: '#fafafa', color: '#1e293b',
  });

  const labelStyle = {
    display: 'block', marginBottom: '6px',
    fontSize: '13px', fontWeight: '600', color: '#374151',
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Title *</label>
        <input style={inputStyle(errors.title)}
          {...register('title', { required: 'Title is required', maxLength: { value: 255, message: 'Too long' } })}
          placeholder="Task title" />
        {errors.title && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{errors.title.message}</p>}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Description</label>
        <textarea style={{ ...inputStyle(false), resize: 'vertical', minHeight: '80px' }}
          {...register('description')} placeholder="Task description..." />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={labelStyle}>Status</label>
          <select style={inputStyle(false)} {...register('status')}>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Priority</label>
          <select style={inputStyle(false)} {...register('priority')}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
        <div>
          <label style={labelStyle}>Due Date</label>
          <input type="date" style={inputStyle(false)} {...register('dueDate')} />
        </div>
        <div>
          <label style={labelStyle}>Assign To</label>
          <select style={inputStyle(false)} {...register('assignedTo')}>
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.email}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>
          Attach Documents (PDF only, max 3 total)
          {task?.documents?.length > 0 && (
            <span style={{ color: '#64748b', fontWeight: '400', marginLeft: '6px' }}>
              ({task.documents.length} existing)
            </span>
          )}
        </label>
        <input type="file" accept=".pdf" multiple onChange={handleFileChange}
          style={{ ...inputStyle(!!fileError), padding: '8px' }} />
        {fileError && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{fileError}</p>}
        {files.length > 0 && (
          <p style={{ color: '#22c55e', fontSize: '12px', margin: '4px 0 0' }}>
            {files.length} file(s) selected
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={{
          padding: '10px 20px', borderRadius: '8px', border: '1.5px solid #e2e8f0',
          background: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: '#374151',
        }}>Cancel</button>
        <button type="submit" disabled={loading} style={{
          padding: '10px 20px', borderRadius: '8px', border: 'none',
          background: loading ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', fontWeight: '600',
        }}>
          {loading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;
