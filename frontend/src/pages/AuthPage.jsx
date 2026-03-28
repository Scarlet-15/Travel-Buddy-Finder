import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { InlineSpinner } from '../components/LoadingSpinner';

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', registerNumber: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email.endsWith('@nitt.edu')) {
      setError('Only @nitt.edu email addresses are allowed.');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-900/40 via-dark-800 to-dark-900 p-12 flex-col justify-between border-r border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(249,115,22,0.15),transparent_60%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
              <span className="text-xl">🚂</span>
            </div>
            <div>
              <div className="font-display font-bold text-white text-xl">TravelBuddy Finder</div>
              <div className="text-xs text-white/40">NIT Trichy</div>
            </div>
          </div>
          <h1 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Travel smarter,<br />together.
          </h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-sm">
            Find fellow NITians heading to the same destination. Share cabs, trains, and flights safely.
          </p>
        </div>
        <div className="relative z-10 space-y-3">
          {[
            { icon: '🔒', text: 'For the fellow people of NIT Trichy' },
            { icon: '💰', text: 'Split travel costs with batchmates' },
            { icon: '🛡️', text: 'Travel safely with verified students' },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-3 text-white/50 text-sm">
              <span>{f.icon}</span><span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-slide-up">
          <div className="mb-8">
            <h2 className="font-display text-3xl font-bold text-white mb-2">
              {isLogin ? 'Welcome back' : 'Join TravelBuddy'}
            </h2>
            <p className="text-white/40">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Link to={isLogin ? '/register' : '/login'} className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
                {isLogin ? 'Sign up' : 'Sign in'}
              </Link>
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="label">Full Name</label>
                  <input type="text" value={form.name} onChange={set('name')} placeholder="Your name" className="input-field" required />
                </div>
                <div>
                  <label className="label">Register Number</label>
                  <input type="text" value={form.registerNumber} onChange={set('registerNumber')} placeholder="e.g. 206125001" className="input-field" required />
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input type="tel" value={form.phone} onChange={set('phone')} placeholder="91-xxxxxxxxxx" className="input-field" required />
                </div>
              </>
            )}

            <div>
              <label className="label">College Email</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="yourregno@nitt.edu"
                className="input-field"
                required
              />
              <p className="text-xs text-white/30 mt-1">Must be a valid @nitt.edu email address</p>
            </div>

            <div>
              <label className="label">Password</label>
              <input type="password" value={form.password} onChange={set('password')} placeholder="Minimum 6 characters" className="input-field" required minLength={6} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
              {loading ? <><InlineSpinner /> Processing...</> : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
