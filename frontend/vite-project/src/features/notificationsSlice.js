import { createSlice } from '@reduxjs/toolkit';
import api from '../api/axios';
import { makeThunk } from '../api/makeThunk';

export const fetchNotifications = makeThunk('notifications/fetch', async () => (await api.get('/notifications')).data);
export const markRead = makeThunk('notifications/markRead', async (id) => (await api.patch(`/notifications/${id}/read`)).data);
export const markAllRead = makeThunk('notifications/markAllRead', async () => { await api.patch('/notifications/read-all'); });

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { items: [] },
  reducers: {
    // called from the Socket.IO listener when a live notification arrives
    addNotification: (s, { payload }) => { s.items.unshift(payload); },
    clearNotifications: (s) => { s.items = []; },
  },
  extraReducers: (b) => {
    b.addCase(fetchNotifications.fulfilled, (s, { payload }) => { s.items = payload; })
      .addCase(markRead.fulfilled, (s, { payload }) => {
        s.items = s.items.map((n) => (n._id === payload._id ? payload : n));
      })
      .addCase(markAllRead.fulfilled, (s) => { s.items = s.items.map((n) => ({ ...n, read: true })); });
  },
});

export const { addNotification, clearNotifications } = notificationsSlice.actions;
export default notificationsSlice.reducer;
