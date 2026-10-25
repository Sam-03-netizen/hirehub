import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyApplications } from '../features/applicationsSlice';
import { timeAgo } from '../components/JobCard';
import Spinner from '../components/Spinner';

export default function MyApplications() {
  const dispatch = useDispatch();
  const { mine, loading } = useSelector((s) => s.applications);
  const notifCount = useSelector((s) => s.notifications.items.length);

  // refetch when a new live notification arrives so the status updates without a refresh
  useEffect(() => { dispatch(fetchMyApplications()); }, [dispatch, notifCount]);

  if (loading && !mine.length) return <Spinner />;

  return (
    <div className="narrow">
      <h1>My applications</h1>
      {mine.length === 0 ? (
        <div className="empty"><h3>You have not applied yet</h3><Link to="/" className="btn btn-primary">Browse jobs</Link></div>
      ) : (
        <div className="stack">
          {mine.map((a) => (
            <Link to={`/jobs/${a.job._id}`} key={a._id} className="card row-between app-row">
              <div>
                <h3>{a.job.title}</h3>
                <p className="muted small">{a.job.company} • {a.job.location} • Applied {timeAgo(a.createdAt)}</p>
              </div>
              <span className={`status ${a.status}`}>{a.status}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
