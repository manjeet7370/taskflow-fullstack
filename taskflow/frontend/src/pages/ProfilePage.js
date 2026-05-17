import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { usersAPI } from '../services/api';
import { loadUser } from '../store/slices/authSlice';

const ProfilePage = () => {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    if (!data.newPassword && !data.email) return;
    setLoading(true);
    try {
      const updates = {};
      if (data.email && data.email !== user.email) updates.email = data.email;
      if (data.newPassword) updates.password = data.newPassword;

      await usersAPI.update(user.id, updates);
      await dispatch(loadUser());
      toast.success('Profile updated!');
      reset();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setLoading(false);
  };

  const inputStyle = (hasError) => ({
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: `1.5px solid ${hasError ? '#ef4444' : '#e2e8f0'}`,
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    background: '#fafafa', color: '#1e293b',
  });

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ margin: '0 0 24px', fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>Profile</h1>

      {/* Profile Card */}
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '32px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '24px', textAlign: 'center',
      }}>
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 16px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: '700', fontSize: '32px',
        }}>{user?.email?.[0]?.toUpperCase()}</div>
        <h2 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#1e293b' }}>
          {user?.email?.split('@')[0]}
        </h2>
        <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: '14px' }}>{user?.email}</p>
        <span style={{
          padding: '4px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
          background: user?.role === 'admin' ? '#ede9fe' : '#dcfce7',
          color: user?.role === 'admin' ? '#7c3aed' : '#16a34a',
          textTransform: 'capitalize',
        }}>{user?.role}</span>
      </div>

      {/* Update Form */}
      <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <h3 style={{ margin: '0 0 24px', fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>Update Profile</h3>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
              Email Address
            </label>
            <input type="email" style={inputStyle(errors.email)}
              defaultValue={user?.email}
              {...register('email', { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' } })}
            />
            {errors.email && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{errors.email.message}</p>}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
              New Password
            </label>
            <input type="password" style={inputStyle(errors.newPassword)}
              placeholder="Leave blank to keep current"
              {...register('newPassword', {
                minLength: { value: 6, message: 'Min 6 characters' },
                validate: (v) => !v || /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v) || 'Must contain uppercase, lowercase, number',
              })}
            />
            {errors.newPassword && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{errors.newPassword.message}</p>}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
              Confirm New Password
            </label>
            <input type="password" style={inputStyle(errors.confirmPassword)}
              placeholder="Confirm new password"
              {...register('confirmPassword', {
                validate: (v) => !watch('newPassword') || v === watch('newPassword') || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={loading} style={{
            padding: '10px 24px', borderRadius: '8px', border: 'none',
            background: loading ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: '#fff', fontWeight: '600', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
