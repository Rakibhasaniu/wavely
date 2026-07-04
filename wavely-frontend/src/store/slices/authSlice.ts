import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { axiosPublic, axiosPrivate } from '@/lib/axios';
import { IAuthState, IUser } from '@/types';

const initialState: IAuthState = {
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    payload: { firstName: string; lastName: string; email: string; password: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await axiosPublic.post('/auth/register', payload);
      return res.data.data as { accessToken: string; user: IUser };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  },
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (payload: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await axiosPublic.post('/auth/login', payload);
      return res.data.data as { accessToken: string; user: IUser };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  },
);

export const logoutUser = createAsyncThunk('auth/logoutUser', async () => {
  try {
    await axiosPrivate.post('/auth/logout');
  } catch {
    // even if API call fails, we still clear client state
  }
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
});

// ─── Slice ───────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // kept for axios interceptor fallback (no API call)
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.error = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    },
    setCredentials(
      state,
      action: PayloadAction<{ user: IUser; accessToken: string }>,
    ) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.accessToken = null;
      state.error = null;
    });
  },
});

export const { logout, setCredentials, clearError } = authSlice.actions;
export default authSlice.reducer;
