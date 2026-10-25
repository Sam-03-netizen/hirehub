import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchMyJobs, deleteJob } from '../features/jobsSlice';
import { timeAgo } from '../components/JobCard';
import Spinner from '../components/Spinner';

export default function MyJobs() {
  const dispatch = useDispatch();
  const { mine, loading } = useSelector((s) => s.jobs);
  const notifCount = useSelector((s) => s.notifications.items.length);

  // refetch on new notification so applicant counts stay current
  useEffect(() => { dispatch(fetchMyJobs()); }, [dispatch, notifCount]);

  const remove = async (id) => {
    if (!window.confirm('Delete this job and all its applications?')) return;
    const res = await dispatch(deleteJob(id));
    deleteJob.fulfilled.match(res) ? toast.success('Job deleted') : toast.error(res.payload);
  };

  if (loading && !mine.length) return <Spinner />;

  return (
    <div className="narrow">
      <div className="row-between">
        <h1>My job posts</h1>
        <Link to="/recruiter/jobs/new" className="btn btn-primary">Post a job</Link>
      </div>
      {mine.length === 0 ? (
        <div className="empty"><h3>No job posts yet</h3><p className="muted">Post your first opening to start receiving applications.</p></div>
      ) : (
        <div className="stack">
          {mine.map((j) => (
            <div key={j._id} className="card row-between">
              <div>
                <Link to={`/jobs/${j._id}`}><h3>{j.title}</h3></Link>
                <p className="muted small">{j.type} • {j.location} • Posted {timeAgo(j.createdAt)}</p>
              </div>
              <div className="actions">
                <Link to={`/recruiter/jobs/${j._id}/applicants`} className="btn btn-primary btn-sm">Applicants ({j.applicants})</Link>
                <Link to={`/recruiter/jobs/${j._id}/edit`} className="btn btn-ghost btn-sm">Edit</Link>
                <button className="btn btn-danger btn-sm" onClick={() => remove(j._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
