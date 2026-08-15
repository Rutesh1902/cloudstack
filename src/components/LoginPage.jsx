import { useEffect, useState } from 'react';
import api, { setTokens } from '../api';

function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => { document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = ''; }; }, []);
  const handleSubmit = async (event) => {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const { data: tokens } = await api.post('/auth/login', { username, password });
      setTokens(tokens);
      const { data: user } = await api.get('/auth/me');
      onLoginSuccess(user);
    } catch (err) { setError(err.response?.data?.detail || 'Invalid username or password.'); }
    finally { setLoading(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl">
        <h1 className="mb-2 text-center text-3xl font-bold text-white">CloudStack</h1>
        <p className="mb-6 text-center text-slate-400">Sign in to your private cloud.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white" placeholder="Username" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
          <input className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white" placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
          <button disabled={loading} className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white disabled:opacity-60">{loading ? 'Signing in…' : 'Login'}</button>
        </form>
        {error && <p className="mt-4 text-center text-red-400">{error}</p>}
      </div>
    </div>
  );
}

export default LoginPage;
