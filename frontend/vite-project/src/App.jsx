import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import { fetchMe } from './features/authSlice';
import { addNotification, fetchNotifications, clearNotifications } from './features/notificationsSlice';
import socket from './socket';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Spinner from './components/Spinner';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import MyApplications from './pages/MyApplications';
import MyJobs from './pages/MyJobs';
import JobForm from './pages/JobForm';
import Applicants from './pages/Applicants';

export default function App() {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((s) => s.auth);
  const userId = user?._id;

  // Restore session from the httpOnly cookie on first load
  useEffect(() => { dispatch(fetchMe()); }, [dispatch]);

  // Open the socket after login, close it on logout
  useEffect(() => {
    if (!userId) {
      dispatch(clearNotifications());
      return;
    }
    dispatch(fetchNotifications());
    socket.connect();
    socket.on('notification', (n) => {
      dispatch(addNotification(n));
      toast(n.message, { icon: '🔔', duration: 5000 });
    });
    return () => {
      socket.off('notification');
      socket.disconnect();
    };
  }, [userId, dispatch]);

  if (loading) return <Spinner full />;

  const home = user?.role === 'recruiter' ? '/recruiter/jobs' : '/';

  return (
    <>
      <Navbar />
      <Toaster position="top-right" />
      <main className="container">
        <Routes>
          <Route path="/" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/login" element={user ? <Navigate to={home} replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to={home} replace /> : <Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>
          <Route element={<ProtectedRoute role="candidate" />}>
            <Route path="/my-applications" element={<MyApplications />} />
          </Route>
          <Route element={<ProtectedRoute role="recruiter" />}>
            <Route path="/recruiter/jobs" element={<MyJobs />} />
            <Route path="/recruiter/jobs/new" element={<JobForm />} />
            <Route path="/recruiter/jobs/:id/edit" element={<JobForm />} />
            <Route path="/recruiter/jobs/:id/applicants" element={<Applicants />} />
          </Route>

          <Route path="*" element={<div className="empty"><h2>Page not found</h2></div>} />
        </Routes>
      </main>
    </>
  );
}
