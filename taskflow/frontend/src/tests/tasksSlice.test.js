import tasksReducer, { setFilters, clearCurrentTask, updateTaskLocally } from '../../store/slices/tasksSlice';

const mockTask = { id: '1', title: 'Test Task', status: 'todo', priority: 'medium' };

describe('tasksSlice reducer', () => {
  const initialState = {
    tasks: [],
    currentTask: null,
    pagination: null,
    loading: false,
    error: null,
    filters: { status: '', priority: '', sortBy: 'createdAt', sortOrder: 'DESC' },
  };

  it('should return initial state', () => {
    const state = tasksReducer(undefined, { type: 'unknown' });
    expect(state.tasks).toEqual([]);
    expect(state.loading).toBe(false);
  });

  it('should set filters', () => {
    const state = tasksReducer(initialState, setFilters({ status: 'todo', priority: 'high' }));
    expect(state.filters.status).toBe('todo');
    expect(state.filters.priority).toBe('high');
  });

  it('should clear current task', () => {
    const stateWithTask = { ...initialState, currentTask: mockTask };
    const state = tasksReducer(stateWithTask, clearCurrentTask());
    expect(state.currentTask).toBeNull();
  });

  it('should update task locally', () => {
    const stateWithTasks = { ...initialState, tasks: [mockTask] };
    const updated = { ...mockTask, status: 'completed' };
    const state = tasksReducer(stateWithTasks, updateTaskLocally(updated));
    expect(state.tasks[0].status).toBe('completed');
  });

  it('should handle fetchTasks.pending', () => {
    const action = { type: 'tasks/fetchAll/pending' };
    const state = tasksReducer(initialState, action);
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle fetchTasks.fulfilled', () => {
    const action = {
      type: 'tasks/fetchAll/fulfilled',
      payload: { tasks: [mockTask], pagination: { total: 1, page: 1, limit: 10, totalPages: 1 } },
    };
    const state = tasksReducer({ ...initialState, loading: true }, action);
    expect(state.loading).toBe(false);
    expect(state.tasks).toHaveLength(1);
    expect(state.pagination.total).toBe(1);
  });

  it('should handle createTask.fulfilled', () => {
    const action = { type: 'tasks/create/fulfilled', payload: mockTask };
    const state = tasksReducer(initialState, action);
    expect(state.tasks).toHaveLength(1);
    expect(state.tasks[0].title).toBe('Test Task');
  });

  it('should handle deleteTask.fulfilled', () => {
    const stateWithTasks = { ...initialState, tasks: [mockTask] };
    const action = { type: 'tasks/delete/fulfilled', payload: '1' };
    const state = tasksReducer(stateWithTasks, action);
    expect(state.tasks).toHaveLength(0);
  });
});
