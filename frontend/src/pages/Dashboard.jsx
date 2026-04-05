import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, Search, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { tripService } from '../services/tripService';
import TripCard from '../components/TripCard';
import DashboardSkeleton from '../components/DashboardSkeleton';
import PageTransition from '../components/PageTransition';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

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

  if (loading) return <DashboardSkeleton />;

  const upcomingOrganized = organized.filter(t => t.status !== 'cancelled' && new Date(t.travelDate) >= new Date());
  const upcomingJoined = joined.filter(t => t && t.status !== 'cancelled' && new Date(t.travelDate) >= new Date());

  return (
    <PageTransition className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero welcome */}
      <div className="relative bg-gradient-to-r from-brand-900/30 via-dark-800 to-dark-800 rounded-2xl p-8 mb-8 border border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full -translate-y-12 translate-x-12 blur-2xl" />
        <div className="relative z-10">
          <p className="text-brand-400 text-sm font-medium mb-1">Good to see you back,</p>
          <h1 className="font-display text-3xl font-bold text-white mb-2">{user?.name}</h1>
          <p className="text-white/40 text-sm">{user?.email} · {user?.registerNumber}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <Link
          to="/trips/create"
          className="flex items-center gap-4 p-6 bg-brand-500 hover:bg-brand-600 rounded-2xl transition-all duration-200 group active:scale-98"
        >
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Map className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-lg">Create a Trip</div>
            <div className="text-white/70 text-sm">Plan your journey and find companions</div>
          </div>
          <div className="ml-auto text-white/50 group-hover:translate-x-1 transition-transform">
            <ChevronRight className="w-5 h-5" />
          </div>
        </Link>

        <Link
          to="/trips"
          className="flex items-center gap-4 p-6 card hover:border-brand-500/30 hover:bg-dark-700 rounded-2xl transition-all duration-200 group"
        >
          <div className="w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center border border-brand-500/20">
            <Search className="w-6 h-6 text-brand-400" />
          </div>
          <div>
            <div className="font-display font-bold text-white text-lg">Find a Trip</div>
            <div className="text-white/40 text-sm">Browse and join open trips</div>
          </div>
          <div className="ml-auto text-white/30 group-hover:translate-x-1 transition-transform">
            <ChevronRight className="w-5 h-5" />
          </div>
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
              <div className="flex justify-center mb-3"><Map className="w-8 h-8 text-white/20" /></div>
              <p className="text-white/40 text-sm">No upcoming trips organized.</p>
              <Link to="/trips/create" className="text-brand-400 text-sm hover:underline mt-2 inline-block">Create one now →</Link>
            </div>
          ) : (
            <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
              {upcomingOrganized.slice(0, 3).map(trip => (
                <motion.div key={trip._id} variants={item}><TripCard trip={trip} showOrganizer={false} /></motion.div>
              ))}
            </motion.div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-white text-lg">Trips I Joined</h2>
          </div>
          {upcomingJoined.length === 0 ? (
            <div className="card p-8 text-center">
              <div className="flex justify-center mb-3"><Search className="w-8 h-8 text-white/20" /></div>
              <p className="text-white/40 text-sm">No trips joined yet.</p>
              <Link to="/trips" className="text-brand-400 text-sm hover:underline mt-2 inline-block">Browse trips →</Link>
            </div>
          ) : (
            <motion.div className="space-y-3" variants={stagger} initial="hidden" animate="show">
              {upcomingJoined.filter(Boolean).slice(0, 3).map(trip => trip && (
                <motion.div key={trip._id} variants={item}><TripCard trip={trip} /></motion.div>
              ))}
            </motion.div>
          )}
        </section>
      </div>
    </PageTransition>
  );
}
