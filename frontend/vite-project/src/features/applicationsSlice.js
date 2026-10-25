import { createSlice } from '@reduxjs/toolkit';
import api from '../api/axios';
import { makeThunk } from '../api/makeThunk';

export const applyToJob = makeThunk('applications/apply', async ({ jobId, coverLetter }) =>
  (await api.post(`/applications/${jobId}`, { coverLetter })).data);
export const fetchMyApplications = makeThunk('applications/mine', async () => (await api.get('/applications/mine')).data);
export const fetchApplicants = makeThunk('applications/applicants', async (jobId) =>
  (await api.get(`/applications/job/${jobId}`)).data);
export const updateStatus = makeThunk('applications/status', async ({ id, status }) =>
  (await api.patch(`/applications/${id}/status`, { status })).data);

const applicationsSlice = createSlice({
  name: 'applications',
  initialState: { mine: [], applicants: [], applicantsJob: null, loading: false },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchMyApplications.pending, (s) => { s.loading = true; })
      .addCase(fetchMyApplications.fulfilled, (s, { payload }) => { s.loading = false; s.mine = payload; })
      .addCase(fetchMyApplications.rejected, (s) => { s.loading = false; })
      .addCase(fetchApplicants.pending, (s) => { s.loading = true; })
      .addCase(fetchApplicants.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.applicants = payload.applications;
        s.applicantsJob = payload.job;
      })
      .addCase(fetchApplicants.rejected, (s) => { s.loading = false; })
      .addCase(updateStatus.fulfilled, (s, { payload }) => {
        s.applicants = s.applicants.map((a) => (a._id === payload._id ? payload : a));
      });
  },
});

export default applicationsSlice.reducer;
