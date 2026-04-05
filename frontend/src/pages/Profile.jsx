import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { Map, Handshake } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useAuth } from '../context/AuthContext';
import { userService, tripService } from '../services/tripService';
import TripCard from '../components/TripCard';
import ProfileSkeleton from '../components/ProfileSkeleton';
import { InlineSpinner } from '../components/LoadingSpinner';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [tab, setTab] = useState('organized');
  const [organized, setOrganized] = useState([]);
  const [joined, setJoined] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([tripService.getMyOrganized(), tripService.getMyJoined()])
      .then(([org, join]) => {
        setOrganized(org.data.trips);
        setJoined(join.data.trips);
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

  if (loading) return <ProfileSkeleton />;

  const tabs = [
    { key: 'organized', label: `Organized (${organized.length})` },
    { key: 'joined', label: `Joined (${joined.filter(Boolean).length})` },
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
            </div>

            {editMode ? (
              <form onSubmit={handleSave} className="space-y-3">
                <div>
                  <label className="label">Name</label>
                  <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" required />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="input-field" required />
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
                  { label: 'Phone', value: user?.phone },
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

        {/* Trips section */}
        <div className="md:col-span-2">
          <h1 className="font-display text-2xl font-bold text-white mb-6">My Trips</h1>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-white/10 pb-1">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`text-sm font-medium pb-2 px-1 border-b-2 transition-colors duration-200 ${
                  tab === t.key
                    ? 'border-brand-500 text-brand-400'
                    : 'border-transparent text-white/40 hover:text-white'
                }`}
              >
                {t.label}
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
        </div>
      </div>
    </PageTransition>
  );
}
