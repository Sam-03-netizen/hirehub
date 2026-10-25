import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs } from '../features/jobsSlice';
import JobCard from '../components/JobCard';
import Spinner from '../components/Spinner';

const TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'];

export default function Jobs() {
  const dispatch = useDispatch();
  const { list, loading, page, pages, total } = useSelector((s) => s.jobs);
  const [filters, setFilters] = useState({ search: '', location: '', type: '' });
  const [pageNo, setPageNo] = useState(1);

  const set = (key) => (e) => { setFilters({ ...filters, [key]: e.target.value }); setPageNo(1); };

  // debounce typing so we don't hit the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => dispatch(fetchJobs({ ...filters, page: pageNo })), 350);
    return () => clearTimeout(t);
  }, [filters, pageNo, dispatch]);

  return (
    <>
      <section className="hero">
        <h1>Find work that fits <span className="hero-italic">the way you want to live.</span></h1>
        <p className="muted">Browse openings, apply with your resume, and get notified the moment a recruiter responds.</p>
        <div className="filters">
          <input placeholder="Job title, company or skill" value={filters.search} onChange={set('search')} />
          <input placeholder="Location" value={filters.location} onChange={set('location')} />
          <select value={filters.type} onChange={set('type')}>
            <option value="">All job types</option>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </section>

      <p className="muted small results-count">{total} {total === 1 ? 'job' : 'jobs'} found</p>
      {loading && !list.length ? (
        <Spinner />
      ) : list.length === 0 ? (
        <div className="empty">
          <h3>No jobs match your search</h3>
          <p className="muted">Try a different keyword or clear the filters.</p>
        </div>
      ) : (
        <div className="grid">{list.map((job) => <JobCard key={job._id} job={job} />)}</div>
      )}

      {pages > 1 && (
        <div className="pager">
          <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPageNo(page - 1)}>Previous</button>
          <span className="muted small">Page {page} of {pages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page >= pages} onClick={() => setPageNo(page + 1)}>Next</button>
        </div>
      )}
    </>
  );
}
