import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchApplicants, updateStatus } from '../features/applicationsSlice';
import { timeAgo } from '../components/JobCard';
import Avatar from '../components/Avatar';
import Spinner from '../components/Spinner';

const STATUSES = ['Applied', 'Shortlisted', 'Rejected', 'Hired'];

export default function Applicants() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { applicants, applicantsJob, loading } = useSelector((s) => s.applications);
  const notifCount = useSelector((s) => s.notifications.items.length);

  // refetch when a live "new application" notification arrives
  useEffect(() => { dispatch(fetchApplicants(id)); }, [id, notifCount, dispatch]);

  const change = async (appId, status) => {
    const res = await dispatch(updateStatus({ id: appId, status }));
    updateStatus.fulfilled.match(res) ? toast.success(`Marked as ${status}. Candidate notified.`) : toast.error(res.payload);
  };

  if (loading && !applicants.length) return <Spinner />;

  return (
    <div className="narrow">
      <Link to="/recruiter/jobs" className="muted small">Back to my job posts</Link>
      <h1>Applicants{applicantsJob && ` for ${applicantsJob.title}`}</h1>
      {applicants.length === 0 ? (
        <div className="empty"><h3>No applications yet</h3><p className="muted">You will get a live notification when someone applies.</p></div>
      ) : (
        <div className="stack">
          {applicants.map((a) => (
            <div key={a._id} className="card applicant">
              <div className="row-between">
                <div className="who">
                  <Avatar user={a.candidate} size={48} />
                  <div>
                    <h3>{a.candidate.name}</h3>
                    <p className="muted small">{a.candidate.headline || a.candidate.email}{a.candidate.location && ` • ${a.candidate.location}`}</p>
                  </div>
                </div>
                <span className={`status ${a.status}`}>{a.status}</span>
              </div>
              {a.candidate.skills?.length > 0 && <div className="tags">{a.candidate.skills.map((s) => <span key={s} className="tag">{s}</span>)}</div>}
              {a.coverLetter && <p className="prewrap cover">{a.coverLetter}</p>}
              <div className="row-between">
                <span className="muted small">Applied {timeAgo(a.createdAt)} • {a.candidate.email}</span>
                <div className="actions">
                  <a href={a.resume} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">View resume</a>
                  <select value={a.status} onChange={(e) => change(a._id, e.target.value)}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
