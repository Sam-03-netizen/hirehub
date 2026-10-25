import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import { login } from '../features/authSlice';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const res = await dispatch(login(form));
    setBusy(false);
    if (login.fulfilled.match(res)) {
      toast.success(`Welcome back, ${res.payload.name.split(' ')[0]}`);
      navigate(location.state?.from || (res.payload.role === 'recruiter' ? '/recruiter/jobs' : '/'), { replace: true });
    } else toast.error(res.payload);
  };

  return (
    <form className="card auth" onSubmit={submit}>
      <h1>Log in</h1>
      <label>Email</label>
      <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <label>Password</label>
      <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button className="btn btn-primary block" disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>
      <p className="muted small center">New to HireHub? <Link to="/register">Create an account</Link></p>
    </form>
  );
}
