import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { register } from '../features/authSlice';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'candidate', company: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const res = await dispatch(register(form));
    setBusy(false);
    if (register.fulfilled.match(res)) {
      toast.success('Account created');
      navigate(res.payload.role === 'recruiter' ? '/recruiter/jobs' : '/profile', { replace: true });
    } else toast.error(res.payload);
  };

  return (
    <form className="card auth" onSubmit={submit}>
      <h1>Create your account</h1>
      <div className="role-switch">
        {['candidate', 'recruiter'].map((r) => (
          <button type="button" key={r} className={form.role === r ? 'active' : ''} onClick={() => setForm({ ...form, role: r })}>
            {r === 'candidate' ? 'I am looking for a job' : 'I am hiring'}
          </button>
        ))}
      </div>
      <label>Full name</label>
      <input required value={form.name} onChange={set('name')} />
      {form.role === 'recruiter' && (
        <>
          <label>Company name</label>
          <input required value={form.company} onChange={set('company')} />
        </>
      )}
      <label>Email</label>
      <input type="email" required value={form.email} onChange={set('email')} />
      <label>Password</label>
      <input type="password" required minLength={6} value={form.password} onChange={set('password')} placeholder="At least 6 characters" />
      <button className="btn btn-primary block" disabled={busy}>{busy ? 'Creating...' : 'Sign up'}</button>
      <p className="muted small center">Already registered? <Link to="/login">Log in</Link></p>
    </form>
  );
}
