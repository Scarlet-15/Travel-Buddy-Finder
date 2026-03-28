import { useState, useEffect, useCallback } from 'react';
import { tripService } from '../services/tripService';
import TripCard from '../components/TripCard';
import LoadingSpinner from '../components/LoadingSpinner';

const MODES = ['', 'Cab', 'Train', 'Flight', 'Bus', 'Metro', 'Auto'];

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
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Find a Trip</h1>
        <p className="text-white/40">Browse open trips from fellow NITians</p>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6 flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search by destination or city..."
            className="input-field"
          />
        </div>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="input-field md:w-48"
          min={new Date().toISOString().split('T')[0]}
        />
        <select value={mode} onChange={e => setMode(e.target.value)} className="input-field md:w-40">
          {MODES.map(m => <option key={m} value={m}>{m || 'All Modes'}</option>)}
        </select>
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
        <LoadingSpinner size="md" text="Searching trips..." />
      ) : trips.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">🚂</div>
          <h3 className="font-display text-xl font-semibold text-white mb-2">No trips found</h3>
          <p className="text-white/40 text-sm">Try adjusting your search or check back later.</p>
        </div>
      ) : (
        <>
          <p className="text-sm text-white/40 mb-4">{trips.length} trip{trips.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trips.map(trip => <TripCard key={trip._id} trip={trip} />)}
          </div>
        </>
      )}
    </div>
  );
}
