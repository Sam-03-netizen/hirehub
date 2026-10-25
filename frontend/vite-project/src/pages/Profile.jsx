import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { updateProfile, uploadAvatar, uploadResume } from '../features/authSlice';
import Avatar from '../components/Avatar';

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const avatarInput = useRef();
  const resumeInput = useRef();
  const [busy, setBusy] = useState('');
  const [form, setForm] = useState({});

  useEffect(() => {
    setForm({
      name: user.name, headline: user.headline || '', location: user.location || '',
      bio: user.bio || '', company: user.company || '', skills: (user.skills || []).join(', '),
    });
  }, [user]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const run = async (key, action, okMsg) => {
    setBusy(key);
    const res = await dispatch(action);
    setBusy('');
    if (res.error) toast.error(res.payload || 'Something went wrong');
    else toast.success(okMsg);
  };

  const onFile = (key, thunk, okMsg) => (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (file) run(key, thunk(file), okMsg);
  };

  return (
    <div className="narrow">
      <h1>Your profile</h1>

      <section className="card profile-head">
        <Avatar user={user} size={84} />
        <div>
          <h2>{user.name}</h2>
          <p className="muted">{user.email} • {user.role}</p>
          <input ref={avatarInput} type="file" accept="image/*" hidden onChange={onFile('avatar', uploadAvatar, 'Photo updated')} />
          <button className="btn btn-ghost btn-sm" disabled={busy === 'avatar'} onClick={() => avatarInput.current.click()}>
            {busy === 'avatar' ? 'Uploading...' : user.avatar ? 'Change photo' : 'Upload photo'}
          </button>
        </div>
      </section>

      {user.role === 'candidate' && (
        <section className="card">
          <h3>Resume</h3>
          {user.resume?.url
            ? <p>Current file: <a href={user.resume.url} target="_blank" rel="noreferrer">{user.resume.name}</a></p>
            : <p className="muted">No resume yet. You need one to apply for jobs.</p>}
          <input ref={resumeInput} type="file" accept=".pdf,.doc,.docx" hidden onChange={onFile('resume', uploadResume, 'Resume uploaded')} />
          <button className="btn btn-primary btn-sm" disabled={busy === 'resume'} onClick={() => resumeInput.current.click()}>
            {busy === 'resume' ? 'Uploading...' : user.resume?.url ? 'Replace resume' : 'Upload resume (PDF or Word, max 5 MB)'}
          </button>
        </section>
      )}

      <form className="card" onSubmit={(e) => { e.preventDefault(); run('save', updateProfile(form), 'Profile saved'); }}>
        <h3>Details</h3>
        <label>Full name</label>
        <input required value={form.name || ''} onChange={set('name')} />
        {user.role === 'recruiter' && (<><label>Company</label><input value={form.company || ''} onChange={set('company')} /></>)}
        <label>Headline</label>
        <input value={form.headline || ''} onChange={set('headline')} placeholder={user.role === 'candidate' ? 'e.g. Final-year CS student' : 'e.g. Talent partner'} />
        <label>Location</label>
        <input value={form.location || ''} onChange={set('location')} />
        {user.role === 'candidate' && (<><label>Skills (comma separated)</label><input value={form.skills || ''} onChange={set('skills')} placeholder="React, Node.js, MongoDB" /></>)}
        <label>About you</label>
        <textarea rows="4" value={form.bio || ''} onChange={set('bio')} />
        <button className="btn btn-primary" disabled={busy === 'save'}>{busy === 'save' ? 'Saving...' : 'Save changes'}</button>
      </form>
    </div>
  );
}
