import { configureStore } from '@reduxjs/toolkit';
import auth from '../features/authSlice';
import jobs from '../features/jobsSlice';
import applications from '../features/applicationsSlice';
import notifications from '../features/notificationsSlice';

export const store = configureStore({ reducer: { auth, jobs, applications, notifications } });
