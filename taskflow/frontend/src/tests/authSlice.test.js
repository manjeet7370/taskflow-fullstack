import authReducer, { logout, clearError } from '../../store/slices/authSlice';

describe('authSlice reducer', () => {
  const initialState = {
    user: null,
    token: null,
    loading: false,
    error: null,
  };

  it('should return initial state', () => {
    const state = authReducer(undefined, { type: 'unknown' });
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('should handle logout', () => {
    const loggedInState = { user: { id: '1', email: 'test@example.com' }, token: 'abc', loading: false, error: null };
    const state = authReducer(loggedInState, logout());
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('should handle clearError', () => {
    const stateWithError = { ...initialState, error: 'Some error' };
    const state = authReducer(stateWithError, clearError());
    expect(state.error).toBeNull();
  });
});
