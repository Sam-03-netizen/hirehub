import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchJob, deleteJob } from '../features/jobsSlice';
import { applyToJob, fetchMyApplications } from '../features/applicationsSlice';
import { timeAgo } from '../components/JobCard';
import Spinner from '../components/Spinner';

export default function JobDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: job, loading } = useSelector((s) => s.jobs);
  const { user } = useSelector((s) => s.auth);
  const { mine } = useSelector((s) => s.applications);
  const [coverLetter, setCoverLetter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const role = user?.role;
  useEffect(() => {
    dispatch(fetchJob(id));
    if (role === 'candidate') dispatch(fetchMyApplications());
  }, [id, role, dispatch]);

  if (loading) return <Spinner />;
  if (!job) return <div className="empty"><h2>Job not found</h2><Link to="/" className="btn btn-primary">Back to jobs</Link></div>;

  const application = mine.find((a) => a.job?._id === job._id);
  const isOwner = role === 'recruiter' && job.recruiter?._id === user._id;

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await dispatch(applyToJob({ jobId: job._id, coverLetter }));
    setSubmitting(false);
    if (applyToJob.fulfilled.match(res)) {
      toast.success('Application sent');
      dispatch(fetchMyApplications());
    } else toast.error(res.payload);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this job and all its applications?')) return;
    const res = await dispatch(deleteJob(job._id));
    if (deleteJob.fulfilled.match(res)) { toast.success('Job deleted'); navigate('/recruiter/jobs'); }
    else toast.error(res.payload);
  };

  return (
    <div className="detail">
      <article className="card detail-main">
        <span className="chip">{job.type}</span>
        <h1>{job.title}</h1>
        <p className="company">{job.company}</p>
        <p className="muted">{job.location}{job.salary && ` • ${job.salary}`} • Posted {timeAgo(job.createdAt)}</p>
        <div className="tags">{job.skills?.map((s) => <span key={s} className="tag">{s}</span>)}</div>
        <h3>About the role</h3>
        <p className="prewrap">{job.description}</p>
      </article>

      <aside className="card detail-side">
        {!user && (
          <>
            <h3>Want to apply?</h3>
            <p className="muted">Log in as a candidate to send your application.</p>
            <Link to="/login" className="btn btn-primary block">Log in</Link>
            <Link to="/register" className="btn btn-ghost block">Create an account</Link>
          </>
        )}

        {role === 'candidate' && (application ? (
          <>
            <h3>You have applied</h3>
            <span className={`status ${application.status}`}>{application.status}</span>
            <p className="muted small">Applied {timeAgo(application.createdAt)}. We will notify you when the status changes.</p>
            <Link to="/my-applications" className="btn btn-ghost block">View my applications</Link>
          </>
        ) : (
          <form onSubmit={handleApply}>
            <h3>Apply for this job</h3>
            {user.resume?.url
              ? <p className="muted small">Your resume ({user.resume.name}) will be attached.</p>
              : <p className="notice">You need a resume to apply. <Link to="/profile">Upload it in your profile</Link>.</p>}
            <label>Cover letter (optional)</label>
            <textarea rows="5" value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Tell the recruiter why you are a good fit" />
            <button className="btn btn-primary block" disabled={submitting || !user.resume?.url}>
              {submitting ? 'Sending...' : 'Submit application'}
            </button>
          </form>
        ))}

        {role === 'recruiter' && (isOwner ? (
          <>
            <h3>Manage this post</h3>
            <Link to={`/recruiter/jobs/${job._id}/applicants`} className="btn btn-primary block">View applicants</Link>
            <Link to={`/recruiter/jobs/${job._id}/edit`} className="btn btn-ghost block">Edit job</Link>
            <button onClick={handleDelete} className="btn btn-danger block">Delete job</button>
          </>
        ) : (
          <p className="muted">Posted by {job.recruiter?.name}. Only candidates can apply.</p>
        ))}
      </aside>
    </div>
  );
}
