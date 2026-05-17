import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { login, clearError } from '../store/slices/authSlice';

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);
  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()); }
  }, [error, dispatch]);

  const onSubmit = async (data) => {
    const result = await dispatch(login(data));
    if (!result.error) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    }
  };

  const inputStyle = (hasError) => ({
    width: '100%', padding: '12px 14px', borderRadius: '8px',
    border: `1.5px solid ${hasError ? '#ef4444' : '#e2e8f0'}`,
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    background: '#fafafa',
  });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '40px',
        width: '100%', maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '40px', marginBottom: '8px' }}>⚡</div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>TaskFlow</h1>
          <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: '14px' }}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
              Email Address
            </label>
            <input
              type="email"
              style={inputStyle(errors.email)}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email' },
              })}
              placeholder="you@example.com"
            />
            {errors.email && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{errors.email.message}</p>}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '600', color: '#374151' }}>
              Password
            </label>
            <input
              type="password"
              style={inputStyle(errors.password)}
              {...register('password', { required: 'Password is required' })}
              placeholder="••••••••"
            />
            {errors.password && <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0' }}>{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '13px', borderRadius: '8px',
              background: loading ? '#94a3b8' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff', fontWeight: '600', fontSize: '14px',
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'opacity 0.2s',
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#667eea', fontWeight: '600', textDecoration: 'none' }}>
            Register
          </Link>
        </p>

        <div style={{
          marginTop: '20px', padding: '12px', background: '#f8f9fa',
          borderRadius: '8px', fontSize: '12px', color: '#64748b', textAlign: 'center',
        }}>
          <strong>Demo:</strong> admin@taskflow.com / Admin@123
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
