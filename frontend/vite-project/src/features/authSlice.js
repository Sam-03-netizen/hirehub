import { createSlice } from '@reduxjs/toolkit';
import api from '../api/axios';
import { makeThunk } from '../api/makeThunk';

export const fetchMe = makeThunk('auth/me', async () => (await api.get('/auth/me')).data);
export const login = makeThunk('auth/login', async (body) => (await api.post('/auth/login', body)).data);
export const register = makeThunk('auth/register', async (body) => (await api.post('/auth/register', body)).data);
export const logout = makeThunk('auth/logout', async () => { await api.post('/auth/logout'); });
export const updateProfile = makeThunk('auth/updateProfile', async (body) => (await api.put('/users/profile', body)).data);
export const uploadAvatar = makeThunk('auth/uploadAvatar', async (file) => {
  const fd = new FormData();
  fd.append('avatar', file);
  return (await api.post('/users/avatar', fd)).data;
});
export const uploadResume = makeThunk('auth/uploadResume', async (file) => {
  const fd = new FormData();
  fd.append('resume', file);
  return (await api.post('/users/resume', fd)).data;
});

const setUser = (state, { payload }) => { state.user = payload; };

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: true }, // loading = checking existing session on first load
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchMe.fulfilled, (s, a) => { s.user = a.payload; s.loading = false; })
      .addCase(fetchMe.rejected, (s) => { s.user = null; s.loading = false; })
      .addCase(login.fulfilled, setUser)
      .addCase(register.fulfilled, setUser)
      .addCase(logout.fulfilled, (s) => { s.user = null; })
      .addCase(updateProfile.fulfilled, setUser)
      .addCase(uploadAvatar.fulfilled, setUser)
      .addCase(uploadResume.fulfilled, setUser);
  },
});

export default authSlice.reducer;
