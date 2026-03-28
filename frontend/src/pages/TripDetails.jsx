import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { tripService, joinRequestService } from '../services/tripService';
import LoadingSpinner, { InlineSpinner } from '../components/LoadingSpinner';

const modeIcons = { Cab: '🚕', Train: '🚂', Flight: '✈️', Bus: '🚌', Metro: '🚇', Auto: '🛺' };

export default function TripDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [joinForm, setJoinForm] = useState({ finalDestination: '', joinUntilStep: '', message: '' });
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    tripService.getById(id)
      .then(res => {
        const t = res.data.trip;
        setTrip(t);
        const myReq = t.joinRequests?.find(r => r.userId?._id === user._id || r.userId === user._id);
        if (myReq) setRequestStatus(myReq.status);
        setJoinForm(f => ({ ...f, joinUntilStep: t.transportSteps?.length || 1 }));
      })
      .catch(() => navigate('/trips'))
      .finally(() => setLoading(false));
  }, [id, user._id, navigate]);

  const handleJoin = async (e) => {
    e.preventDefault();
    setJoinError('');
    setJoinLoading(true);
    try {
      await joinRequestService.create({
        tripId: id,
        joinUntilStep: parseInt(joinForm.joinUntilStep),
        finalDestination: joinForm.finalDestination,
        travelDate: trip.travelDate,
        message: joinForm.message,
      });
      setJoinSuccess(true);
      setShowJoinForm(false);
      setRequestStatus('pending');
    } catch (err) {
      setJoinError(err.response?.data?.message || 'Failed to send join request.');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this trip?')) return;
    setCancelLoading(true);
    try {
      await tripService.cancel(id);
      navigate('/dashboard');
    } catch (e) {
      alert('Failed to cancel trip.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleApprove = async (requestId, status) => {
    try {
      await joinRequestService.updateStatus(requestId, status);
      const res = await tripService.getById(id);
      setTrip(res.data.trip);
    } catch (e) {
      alert('Failed to update request.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading trip details..." />;
  if (!trip) return null;

  const isOrganizer = trip.organizerId?._id === user._id || trip.organizerId === user._id;
  const approvedRequests = trip.joinRequests?.filter(r => r.status === 'approved') || [];
  const pendingRequests = trip.joinRequests?.filter(r => r.status === 'pending') || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button onClick={() => navigate(-1)} className="text-white/40 hover:text-white text-sm mb-3 flex items-center gap-1 transition-colors">
            ← Back
          </button>
          <h1 className="font-display text-3xl font-bold text-white">→ {trip.destination}</h1>
          <p className="text-white/40 mt-1">{trip.travelDate ? format(new Date(trip.travelDate), 'EEEE, MMMM d, yyyy') : ''}</p>
        </div>
        <div className={`badge border mt-4 px-3 py-1.5 text-sm ${
          trip.status === 'open' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
        }`}>
          {trip.status}
        </div>
      </div>

      {joinSuccess && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-xl px-4 py-3 mb-6">
          ✅ Join request sent! The organizer will review it soon.
        </div>
      )}

      {/* Organizer card */}
      <div className="card p-5 mb-4">
        <h2 className="text-xs text-white/40 uppercase tracking-wider font-medium mb-3">Organizer</h2>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold">
            {trip.organizerId?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-white font-medium">{trip.organizerId?.name}</p>
            <p className="text-white/40 text-sm">{trip.organizerId?.email}</p>
          </div>
          {!isOrganizer && (
            <a href={`tel:${trip.organizerId?.phone}`} className="ml-auto text-brand-400 text-sm hover:underline">
              📞 {trip.organizerId?.phone}
            </a>
          )}
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card p-4">
          <p className="text-xs text-white/40 mb-1">Companion Preference</p>
          <p className="text-white font-medium">{trip.preferredSex} gender</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-white/40 mb-1">Companion Until</p>
          <p className="text-white font-medium">
            {trip.companionUntilStep ? `Step ${trip.companionUntilStep}` : 'All steps'}
          </p>
        </div>
      </div>

      {/* Transport steps */}
      <div className="card p-5 mb-4">
        <h2 className="text-xs text-white/40 uppercase tracking-wider font-medium mb-4">Transport Plan</h2>
        <div className="space-y-3">
          {trip.transportSteps?.map((step, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-sm">
                  {modeIcons[step.mode]}
                </div>
                {i < trip.transportSteps.length - 1 && <div className="w-px h-6 bg-white/10 my-1" />}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-medium text-sm">{step.from}</span>
                  <span className="text-white/30">→</span>
                  <span className="text-white font-medium text-sm">{step.to}</span>
                </div>
                <div className="flex gap-3 text-xs text-white/40">
                  <span>{step.mode}</span>
                  {step.transportName && <span>· {step.transportName}</span>}
                  {step.departureTime && <span>· {step.departureTime}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {trip.additionalDetails && (
        <div className="card p-5 mb-4">
          <h2 className="text-xs text-white/40 uppercase tracking-wider font-medium mb-2">Additional Notes</h2>
          <p className="text-white/70 text-sm leading-relaxed">{trip.additionalDetails}</p>
        </div>
      )}

      {/* Approved companions */}
      {approvedRequests.length > 0 && (
        <div className="card p-5 mb-4">
          <h2 className="text-xs text-white/40 uppercase tracking-wider font-medium mb-3">
            Companions ({approvedRequests.length})
          </h2>
          <div className="space-y-2">
            {approvedRequests.map((req, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-7 h-7 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-xs text-green-400 font-bold">
                  {req.userId?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-white">{req.userId?.name}</span>
                <span className="text-white/40">→ {req.finalDestination} (until step {req.joinUntilStep})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Organizer: manage requests */}
      {isOrganizer && pendingRequests.length > 0 && (
        <div className="card p-5 mb-4 border-brand-500/20">
          <h2 className="text-xs text-brand-400 uppercase tracking-wider font-medium mb-3">
            Pending Requests ({pendingRequests.length})
          </h2>
          <div className="space-y-3">
            {pendingRequests.map(req => (
              <div key={req._id} className="bg-dark-700 rounded-xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white/60">
                  {req.userId?.name?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{req.userId?.name}</p>
                  <p className="text-white/40 text-xs">→ {req.finalDestination} · Until step {req.joinUntilStep}</p>
                  {req.message && <p className="text-white/50 text-xs mt-1 italic">"{req.message}"</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(req._id, 'approved')} className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-lg hover:bg-green-500/20 transition-colors">
                    Approve
                  </button>
                  <button onClick={() => handleApprove(req._id, 'rejected')} className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="space-y-3">
        {!isOrganizer && trip.status === 'open' && !requestStatus && !showJoinForm && (
          <button onClick={() => setShowJoinForm(true)} className="btn-primary w-full">
            Request to Join This Trip
          </button>
        )}

        {requestStatus && (
          <div className={`text-center py-3 rounded-xl text-sm font-medium ${
            requestStatus === 'approved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
            requestStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
            'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {requestStatus === 'approved' && '✅ You are joining this trip!'}
            {requestStatus === 'pending' && '⏳ Join request pending organizer approval'}
            {requestStatus === 'rejected' && '❌ Your join request was not approved'}
          </div>
        )}

        {isOrganizer && trip.status === 'open' && (
          <button onClick={handleCancel} disabled={cancelLoading} className="btn-danger w-full flex items-center justify-center gap-2">
            {cancelLoading ? <InlineSpinner /> : null} Cancel Trip
          </button>
        )}
      </div>

      {/* Join form */}
      {showJoinForm && (
        <div className="card p-6 mt-4 border-brand-500/20 animate-slide-up">
          <h3 className="font-display font-semibold text-white mb-4">Join Request</h3>
          {joinError && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 mb-4">{joinError}</div>}
          <form onSubmit={handleJoin} className="space-y-4">
            <div>
              <label className="label">Your Final Destination</label>
              <input
                type="text"
                value={joinForm.finalDestination}
                onChange={e => setJoinForm(f => ({ ...f, finalDestination: e.target.value }))}
                placeholder="Where are you heading?"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label">Join until Step</label>
              <select
                value={joinForm.joinUntilStep}
                onChange={e => setJoinForm(f => ({ ...f, joinUntilStep: e.target.value }))}
                className="input-field"
                required
              >
                {trip.transportSteps?.map((step, i) => (
                  <option key={i} value={i + 1}>
                    Step {i + 1}: {step.from} → {step.to} ({step.mode})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Message to organizer <span className="text-white/30">(optional)</span></label>
              <textarea
                value={joinForm.message}
                onChange={e => setJoinForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Introduce yourself or share any relevant info..."
                rows={2}
                className="input-field resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowJoinForm(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={joinLoading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {joinLoading ? <><InlineSpinner /> Sending...</> : 'Send Request'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
