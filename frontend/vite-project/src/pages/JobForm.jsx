import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { createJob, updateJob, fetchJob } from '../features/jobsSlice';

const TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Remote'];

export default function JobForm() {
  const { id } = useParams(); // present when editing
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [form, setForm] = useState({
    title: '', company: user.company || '', location: '', type: 'Full-time', salary: '', skills: '', description: '',
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    if (!id) return;
    dispatch(fetchJob(id)).then((res) => {
      const j = res.payload;
      if (j) setForm({ title: j.title, company: j.company, location: j.location, type: j.type, salary: j.salary, skills: j.skills.join(', '), description: j.description });
    });
  }, [id, dispatch]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const res = await dispatch(id ? updateJob({ id, ...form }) : createJob(form));
    setBusy(false);
    if (res.error) return toast.error(res.payload);
    toast.success(id ? 'Job updated' : 'Job posted');
    navigate('/recruiter/jobs');
  };

  return (
    <form className="card narrow" onSubmit={submit}>
      <h1>{id ? 'Edit job' : 'Post a job'}</h1>
      <label>Job title</label>
      <input required value={form.title} onChange={set('title')} placeholder="e.g. Frontend Developer" />
      <label>Company</label>
      <input required value={form.company} onChange={set('company')} />
      <div className="two-col">
        <div><label>Location</label><input required value={form.location} onChange={set('location')} placeholder="e.g. Bengaluru" /></div>
        <div><label>Job type</label>
          <select value={form.type} onChange={set('type')}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
        </div>
      </div>
      <label>Salary (optional)</label>
      <input value={form.salary} onChange={set('salary')} placeholder="e.g. 6-8 LPA" />
      <label>Skills (comma separated)</label>
      <input value={form.skills} onChange={set('skills')} placeholder="React, Node.js, MongoDB" />
      <label>Description</label>
      <textarea required rows="8" value={form.description} onChange={set('description')} placeholder="Responsibilities, requirements, perks..." />
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Saving...' : id ? 'Save changes' : 'Publish job'}</button>
    </form>
  );
}
