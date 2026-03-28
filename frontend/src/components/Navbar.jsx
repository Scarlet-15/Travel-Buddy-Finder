import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TrainIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <rect x="4" y="3" width="16" height="16" rx="3" />
    <path d="M4 11h16M8 3v4M16 3v4M7 17l-2 4M17 17l2 4" />
  </svg>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors duration-200 ${
        location.pathname === to ? 'text-brand-400' : 'text-white/60 hover:text-white'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-dark-900/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center text-white group-hover:bg-brand-600 transition-colors">
            <TrainIcon />
          </div>
          <div>
            <span className="font-display font-700 text-white text-sm leading-none block">TravelBuddy</span>
            <span className="text-[10px] text-white/40 leading-none">NIT Trichy</span>
          </div>
        </Link>

        {user && (
          <>
            <div className="hidden md:flex items-center gap-6">
              {navLink('/dashboard', 'Dashboard')}
              {navLink('/trips', 'Find Trips')}
              {navLink('/trips/create', 'Create Trip')}
              {navLink('/profile', 'Profile')}
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-xs text-white/40">Welcome back,</p>
                <p className="text-sm font-medium text-white leading-none">{user.name.split(' ')[0]}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-white/40 hover:text-red-400 transition-colors border border-white/10 hover:border-red-500/30 px-3 py-1.5 rounded-lg"
              >
                Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
