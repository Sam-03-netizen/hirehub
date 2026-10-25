import { Link } from 'react-router-dom';

export const timeAgo = (date) => {
  const days = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (days < 1) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(date).toLocaleDateString();
};

export default function JobCard({ job }) {
  return (
    <Link to={`/jobs/${job._id}`} className="card job-card">
      <div className="job-card-top">
        <span className="chip">{job.type}</span>
        <span className="muted small">{timeAgo(job.createdAt)}</span>
      </div>
      <h3>{job.title}</h3>
      <p className="company">{job.company}</p>
      <p className="muted small">{job.location}{job.salary && ` • ${job.salary}`}</p>
      <div className="tags">
        {job.skills?.slice(0, 4).map((s) => <span key={s} className="tag">{s}</span>)}
      </div>
    </Link>
  );
}
