import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tasksAPI } from '../../services/api';

export const fetchTasks = createAsyncThunk('tasks/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await tasksAPI.getAll(params);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch tasks');
  }
});

export const fetchTask = createAsyncThunk('tasks/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await tasksAPI.getById(id);
    return res.data.data.task;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch task');
  }
});

export const createTask = createAsyncThunk('tasks/create', async (data, { rejectWithValue }) => {
  try {
    const res = await tasksAPI.create(data);
    return res.data.data.task;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to create task');
  }
});

export const updateTask = createAsyncThunk('tasks/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await tasksAPI.update(id, data);
    return res.data.data.task;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update task');
  }
});

export const deleteTask = createAsyncThunk('tasks/delete', async (id, { rejectWithValue }) => {
  try {
    await tasksAPI.delete(id);
    return id;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to delete task');
  }
});

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    currentTask: null,
    pagination: null,
    loading: false,
    error: null,
    filters: { status: '', priority: '', sortBy: 'createdAt', sortOrder: 'DESC' },
  },
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    clearCurrentTask: (state) => { state.currentTask = null; },
    updateTaskLocally: (state, action) => {
      const idx = state.tasks.findIndex((t) => t.id === action.payload.id);
      if (idx !== -1) state.tasks[idx] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTasks.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchTask.fulfilled, (state, action) => { state.currentTask = action.payload; })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.tasks[idx] = action.payload;
        if (state.currentTask?.id === action.payload.id) state.currentTask = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((t) => t.id !== action.payload);
      });
  },
});

export const { setFilters, clearCurrentTask, updateTaskLocally } = tasksSlice.actions;
export default tasksSlice.reducer;
