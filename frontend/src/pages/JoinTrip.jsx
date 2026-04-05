import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, TrainFront } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import { tripService } from '../services/tripService';
import TripCard from '../components/TripCard';
import TripCardSkeleton from '../components/TripCardSkeleton';
import PageTransition from '../components/PageTransition';

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };
import { darkSelectStyles } from '../constants/reactSelectDarkTheme';

const MODE_OPTIONS = [
  { value: '', label: 'All Modes' },
  { value: 'Cab', label: 'Cab' },
  { value: 'Train', label: 'Train' },
  { value: 'Flight', label: 'Flight' },
  { value: 'Bus', label: 'Bus' },
  { value: 'Metro', label: 'Metro' },
  { value: 'Auto', label: 'Auto' },
];

export default function JoinTrip() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [mode, setMode] = useState('');

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await tripService.getAll({ search, date, mode });
      setTrips(res.data.trips);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, date, mode]);

  useEffect(() => {
    const timer = setTimeout(fetchTrips, 400);
    return () => clearTimeout(timer);
  }, [fetchTrips]);

  return (
    <PageTransition className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Find a Trip</h1>
        <p className="text-white/40">Browse open trips from fellow NITians</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by destination or city..."
            className="input-field pl-10"
          />
        </div>
        <DatePicker
          selected={date ? new Date(date) : null}
          onChange={d => setDate(d ? d.toISOString().split('T')[0] : '')}
          minDate={new Date()}
          dateFormat="EEE, MMM d yyyy"
          placeholderText="Filter by date"
          className="input-field md:w-48"
          isClearable
        />
        <div className="md:w-48">
          <Select
            options={MODE_OPTIONS}
            styles={darkSelectStyles}
            value={MODE_OPTIONS.find(o => o.value === mode)}
            onChange={opt => setMode(opt?.value || '')}
            isSearchable={false}
          />
        </div>
        {(search || date || mode) && (
          <button
            onClick={() => { setSearch(''); setDate(''); setMode(''); }}
            className="btn-secondary md:w-24 text-sm"
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <TripCardSkeleton key={i} />)}
        </div>
      ) : trips.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="flex justify-center mb-4"><TrainFront className="w-12 h-12 text-white/20" /></div>
          <h3 className="font-display text-xl font-semibold text-white mb-2">No trips found</h3>
          <p className="text-white/40 text-sm">Try adjusting your search or check back later.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-white/40 mb-4">{trips.length} trip{trips.length !== 1 ? 's' : ''} found</p>
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" variants={stagger} initial="hidden" animate="show">
            {trips.map(trip => (
              <motion.div key={trip._id} variants={item}><TripCard trip={trip} /></motion.div>
            ))}
          </motion.div>
        </>
      )}
    </PageTransition>
  );
}
