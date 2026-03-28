import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { tripService } from '../services/tripService';
import TransportStepBuilder from '../components/TransportStepBuilder';
import { InlineSpinner } from '../components/LoadingSpinner';

const emptyStep = () => ({ mode: 'Cab', from: '', to: '', transportName: '', departureTime: '' });

export default function CreateTrip() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [steps, setSteps] = useState([emptyStep()]);
  const [form, setForm] = useState({ destination: '', travelDate: '', preferredSex: 'Any', companionUntilStep: '', additionalDetails: '', maxCompanions: 4 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (steps.some(s => !s.from || !s.to)) {
      setError('Please fill in From and To for all transport steps.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        companionUntilStep: form.companionUntilStep ? parseInt(form.companionUntilStep) : steps.length,
        transportSteps: steps,
        maxCompanions: parseInt(form.maxCompanions),
      };
      const res = await tripService.create(payload);
      navigate(`/trips/${res.data.trip._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create trip.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white mb-2">Create a Trip</h1>
        <div className="flex items-center gap-2 text-sm text-white/40">
          <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
          You will be the organizer of this trip
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-6">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic info */}
        <section className="card p-6">
          <h2 className="font-display font-semibold text-white mb-5 flex items-center gap-2">
            <span className="w-7 h-7 bg-brand-500/20 rounded-lg text-brand-400 text-sm flex items-center justify-center font-bold">1</span>
            Trip Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Final Destination</label>
              <input type="text" value={form.destination} onChange={set('destination')} placeholder="e.g. Chennai, Bangalore" className="input-field" required />
            </div>
            <div>
              <label className="label">Travel Date</label>
              <input type="date" value={form.travelDate} onChange={set('travelDate')} className="input-field" required min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="label">Preferred Companion Gender</label>
              <select value={form.preferredSex} onChange={set('preferredSex')} className="input-field">
                <option value="Any">Any Gender</option>
                <option value="Male">Male Only</option>
                <option value="Female">Female Only</option>
              </select>
            </div>
            <div>
              <label className="label">Max Companions</label>
              <input type="number" value={form.maxCompanions} onChange={set('maxCompanions')} min={1} max={10} className="input-field" />
            </div>
          </div>
        </section>

        {/* Transport plan */}
        <section className="card p-6">
          <h2 className="font-display font-semibold text-white mb-5 flex items-center gap-2">
            <span className="w-7 h-7 bg-brand-500/20 rounded-lg text-brand-400 text-sm flex items-center justify-center font-bold">2</span>
            Transport Plan
          </h2>
          <TransportStepBuilder steps={steps} onChange={setSteps} />
        </section>

        {/* Companion preference */}
        <section className="card p-6">
          <h2 className="font-display font-semibold text-white mb-5 flex items-center gap-2">
            <span className="w-7 h-7 bg-brand-500/20 rounded-lg text-brand-400 text-sm flex items-center justify-center font-bold">3</span>
            Companion Preferences
          </h2>
          <div>
            <label className="label">
              Companion needed until Step
              <span className="text-white/30 ml-2 font-normal">(leave blank for all steps)</span>
            </label>
            <select value={form.companionUntilStep} onChange={set('companionUntilStep')} className="input-field">
              <option value="">All steps</option>
              {steps.map((_, i) => (
                <option key={i} value={i + 1}>Step {i + 1}</option>
              ))}
            </select>
          </div>
          <div className="mt-4">
            <label className="label">Additional Details <span className="text-white/30">(optional)</span></label>
            <textarea
              value={form.additionalDetails}
              onChange={set('additionalDetails')}
              placeholder="Any special requirements, cost sharing details, etc."
              rows={3}
              className="input-field resize-none"
            />
          </div>
        </section>

        {/* Organizer info */}
        <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-sm">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-white text-sm font-medium">{user?.name}</p>
            <p className="text-white/40 text-xs">{user?.email} · Organizer</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <><InlineSpinner /> Creating...</> : 'Create Trip'}
          </button>
        </div>
      </form>
    </div>
  );
}
