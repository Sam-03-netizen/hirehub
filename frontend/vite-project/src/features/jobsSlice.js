import { createSlice } from '@reduxjs/toolkit';
import api from '../api/axios';
import { makeThunk } from '../api/makeThunk';

export const fetchJobs = makeThunk('jobs/fetchAll', async (params) => (await api.get('/jobs', { params })).data);
export const fetchJob = makeThunk('jobs/fetchOne', async (id) => (await api.get(`/jobs/${id}`)).data);
export const fetchMyJobs = makeThunk('jobs/fetchMine', async () => (await api.get('/jobs/mine')).data);
export const createJob = makeThunk('jobs/create', async (body) => (await api.post('/jobs', body)).data);
export const updateJob = makeThunk('jobs/update', async ({ id, ...body }) => (await api.put(`/jobs/${id}`, body)).data);
export const deleteJob = makeThunk('jobs/delete', async (id) => { await api.delete(`/jobs/${id}`); return id; });

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: { list: [], total: 0, page: 1, pages: 1, current: null, mine: [], loading: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchJobs.pending, (s) => { s.loading = true; })
      .addCase(fetchJobs.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.list = payload.jobs;
        s.total = payload.total;
        s.page = payload.page;
        s.pages = payload.pages;
      })
      .addCase(fetchJobs.rejected, (s) => { s.loading = false; })
      .addCase(fetchJob.pending, (s) => { s.loading = true; s.current = null; })
      .addCase(fetchJob.fulfilled, (s, { payload }) => { s.loading = false; s.current = payload; })
      .addCase(fetchJob.rejected, (s) => { s.loading = false; })
      .addCase(fetchMyJobs.pending, (s) => { s.loading = true; })
      .addCase(fetchMyJobs.fulfilled, (s, { payload }) => { s.loading = false; s.mine = payload; })
      .addCase(fetchMyJobs.rejected, (s) => { s.loading = false; })
      .addCase(deleteJob.fulfilled, (s, { payload }) => { s.mine = s.mine.filter((j) => j._id !== payload); });
  },
});

export default jobsSlice.reducer;
