import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripService } from '../services/tripService';
import TripCard from '../components/TripCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Dashboard() {
  const { user } = useAuth();
  const [organized, setOrganized] = useState([]);
  const [joined, setJoined] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([tripService.getMyOrganized(), tripService.getMyJoined()])
      .then(([org, join]) => {
        setOrganized(org.data.trips);
        setJoined(join.data.trips);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard..." />;

  const upcomingOrganized = organized.filter(t => t.status !== 'cancelled' && new Date(t.travelDate) >= new Date());
  const upcomingJoined = joined.filter(t => t && t.status !== 'cancelled' && new Date(t.travelDate) >= new Date());

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      {/* Hero welcome */}
      <div className="relative bg-gradient-to-r from-brand-900/30 via-dark-800 to-dark-800 rounded-2xl p-8 mb-8 border border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full -translate-y-12 translate-x-12 blur-2xl" />
        <div className="relative z-10">
          <p className="text-brand-400 text-sm font-medium mb-1">Good to see you back,</p>
          <h1 className="font-display text-3xl font-bold text-white mb-2">{user?.name} 👋</h1>
          <p className="text-white/40 text-sm">{user?.email} · {user?.registerNumber}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <Link
          to="/trips/create"
          className="flex items-center gap-4 p-6 bg-brand-500 hover:bg-brand-600 rounded-2xl transition-all duration-200 group active:scale-98"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">🗺️</div>
          <div>
            <div className="font-display font-bold text-white text-lg">Create a Trip</div>
            <div className="text-white/70 text-sm">Plan your journey and find companions</div>
          </div>
          <div className="ml-auto text-white/50 group-hover:translate-x-1 transition-transform text-xl">→</div>
        </Link>

        <Link
          to="/trips"
          className="flex items-center gap-4 p-6 card hover:border-brand-500/30 hover:bg-dark-700 rounded-2xl transition-all duration-200 group"
        >
          <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center text-2xl border border-brand-500/20">🔍</div>
          <div>
            <div className="font-display font-bold text-white text-lg">Find a Trip</div>
            <div className="text-white/40 text-sm">Browse and join open trips</div>
          </div>
          <div className="ml-auto text-white/30 group-hover:translate-x-1 transition-transform text-xl">→</div>
        </Link>
      </div>


      {/* Upcoming trips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-white text-lg">Trips I Organized</h2>
            {organized.length > 3 && <Link to="/profile" className="text-xs text-brand-400 hover:underline">View all</Link>}
          </div>
          {upcomingOrganized.length === 0 ? (
            <div className="card p-8 text-center">
              <div className="text-3xl mb-3">🗺️</div>
              <p className="text-white/40 text-sm">No upcoming trips organized.</p>
              <Link to="/trips/create" className="text-brand-400 text-sm hover:underline mt-2 inline-block">Create one now →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingOrganized.slice(0, 3).map(trip => <TripCard key={trip._id} trip={trip} showOrganizer={false} />)}
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-white text-lg">Trips I Joined</h2>
          </div>
          {upcomingJoined.length === 0 ? (
            <div className="card p-8 text-center">
              <div className="text-3xl mb-3">🔍</div>
              <p className="text-white/40 text-sm">No trips joined yet.</p>
              <Link to="/trips" className="text-brand-400 text-sm hover:underline mt-2 inline-block">Browse trips →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingJoined.filter(Boolean).slice(0, 3).map(trip => trip && <TripCard key={trip._id} trip={trip} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
