import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Map, Handshake, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../context/AuthContext';
import { userService, tripService, joinRequestService } from '../services/tripService';
import TripCard from '../components/TripCard';
import ProfileSkeleton from '../components/ProfileSkeleton';
import { InlineSpinner } from '../components/LoadingSpinner';

const statusConfig = {
  pending:   { icon: Clock,         color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', label: 'Pending' },
  approved:  { icon: CheckCircle,   color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20',   label: 'Approved' },
  rejected:  { icon: XCircle,       color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20',       label: 'Rejected' },
  withdrawn: { icon: AlertCircle,   color: 'text-white/40',   bg: 'bg-white/5 border-white/10',            label: 'Withdrawn' },
};

export default function Profile() {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState('organized');
  const [organized, setOrganized] = useState([]);
  const [joined, setJoined] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '' });
  const [saving, setSaving] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState(null);

  useEffect(() => {
    Promise.all([
      tripService.getMyOrganized(),
      tripService.getMyJoined(),
      joinRequestService.getMy(),
    ])
      .then(([org, join, reqs]) => {
        setOrganized(org.data.trips);
        setJoined(join.data.trips);
        setMyRequests(reqs.data.joinRequests);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await userService.updateProfile(form);
      setUser(res.data.user);
      toast.success('Profile updated!');
      setEditMode(false);
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleWithdraw = async (reqId) => {
    setWithdrawingId(reqId);
    try {
      await joinRequestService.withdraw(reqId);
      setMyRequests(r => r.map(req => req._id === reqId ? { ...req, status: 'withdrawn' } : req));
      toast.success('Request withdrawn.');
    } catch {
      toast.error('Failed to withdraw request.');
    } finally {
      setWithdrawingId(null);
    }
  };

  if (loading) return <ProfileSkeleton />;

  const pendingRequests = myRequests.filter(r => r.status === 'pending');
  const tabs = [
    { key: 'organized', label: `Organized (${organized.length})` },
    { key: 'joined',    label: `Joined (${joined.filter(Boolean).length})` },
    { key: 'requests',  label: `My Requests (${myRequests.length})`, badge: pendingRequests.length },
  ];

  return (
    <PageTransition className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="md:col-span-1">
          <div className="card p-6 sticky top-24">
            <div className="text-center mb-6">
              <div className="w-20 h-20 rounded-2xl bg-brand-500/20 border-2 border-brand-500/30 flex items-center justify-center text-3xl font-bold text-brand-400 mx-auto mb-3 font-display">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <h2 className="font-display font-bold text-white text-xl">{user?.name}</h2>
              <p className="text-white/40 text-sm mt-0.5">{user?.registerNumber}</p>
              {user?.gender && (
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs bg-brand-500/10 text-brand-400 border border-brand-500/20">
                  {user.gender}
                </span>
              )}
            </div>

            {editMode ? (
              <form onSubmit={handleSave} className="space-y-3">
                <div>
                  <label className="label">Name</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" required />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setEditMode(false)} className="btn-secondary flex-1 text-sm py-2">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 text-sm py-2 flex items-center justify-center gap-1">
                    {saving ? <InlineSpinner /> : null} Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                {[
                  { label: 'Email', value: user?.email },
                  { label: 'Member since', value: user?.createdAt ? format(new Date(user.createdAt), 'MMM yyyy') : 'N/A' },
                ].map((f, i) => (
                  <div key={i}>
                    <p className="text-xs text-white/40">{f.label}</p>
                    <p className="text-white text-sm font-medium">{f.value}</p>
                  </div>
                ))}
                <button onClick={() => setEditMode(true)} className="btn-secondary w-full text-sm mt-2">
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Trips & Requests section */}
        <div className="md:col-span-2">
          <h1 className="font-display text-2xl font-bold text-white mb-6">My Activity</h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-white/10 pb-1 overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 text-sm font-medium pb-2 px-1 border-b-2 transition-colors duration-200 whitespace-nowrap ${
                  tab === t.key
                    ? 'border-brand-500 text-brand-400'
                    : 'border-transparent text-white/40 hover:text-white'
                }`}
              >
                {t.label}
                {t.badge > 0 && (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-yellow-500 text-dark-900 text-xs font-bold">
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {tab === 'organized' && (
            <div className="space-y-3">
              {organized.length === 0 ? (
                <div className="card p-10 text-center">
                  <div className="flex justify-center mb-3"><Map className="w-8 h-8 text-white/20" /></div>
                  <p className="text-white/40">No trips organized yet.</p>
                </div>
              ) : organized.map(trip => <TripCard key={trip._id} trip={trip} showOrganizer={false} />)}
            </div>
          )}

          {tab === 'joined' && (
            <div className="space-y-3">
              {joined.filter(Boolean).length === 0 ? (
                <div className="card p-10 text-center">
                  <div className="flex justify-center mb-3"><Handshake className="w-8 h-8 text-white/20" /></div>
                  <p className="text-white/40">No approved trips joined yet.</p>
                </div>
              ) : joined.filter(Boolean).map(trip => trip && <TripCard key={trip._id} trip={trip} />)}
            </div>
          )}

          {tab === 'requests' && (
            <div className="space-y-3">
              {myRequests.length === 0 ? (
                <div className="card p-10 text-center">
                  <div className="flex justify-center mb-3"><Clock className="w-8 h-8 text-white/20" /></div>
                  <p className="text-white/40">No join requests sent yet.</p>
                </div>
              ) : myRequests.map(req => {
                const cfg = statusConfig[req.status] || statusConfig.pending;
                const StatusIcon = cfg.icon;
                const trip = req.tripId;
                return (
                  <div key={req._id} className={`card p-4 border ${cfg.bg}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <StatusIcon className={`w-4 h-4 flex-shrink-0 ${cfg.color}`} />
                          <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                        </div>
                        {trip ? (
                          <>
                            <p className="text-white font-medium text-sm truncate">→ {trip.destination}</p>
                            <p className="text-white/40 text-xs mt-0.5">
                              {trip.travelDate ? format(new Date(trip.travelDate), 'EEE, MMM d yyyy') : ''}
                              {' · '}Organizer: {trip.organizerId?.name}
                            </p>
                            {req.message && (
                              <p className="text-white/50 text-xs mt-1 italic">"{req.message}"</p>
                            )}
                          </>
                        ) : (
                          <p className="text-white/40 text-xs">Trip no longer available</p>
                        )}
                        <p className="text-white/30 text-xs mt-1">
                          Requested {format(new Date(req.createdAt), 'MMM d, yyyy')}
                        </p>
                      </div>
                      {req.status === 'pending' && (
                        <button
                          onClick={() => handleWithdraw(req._id)}
                          disabled={withdrawingId === req._id}
                          className="flex-shrink-0 text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-1"
                        >
                          {withdrawingId === req._id ? <InlineSpinner /> : null}
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
