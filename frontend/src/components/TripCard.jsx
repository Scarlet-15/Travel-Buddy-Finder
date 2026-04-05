import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { modeIcons, fallbackModeIcon } from '../constants/icons';

const statusColors = {
  open: 'bg-green-500/10 text-green-400 border-green-500/20',
  full: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  completed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function TripCard({ trip, showOrganizer = true }) {
  const { _id, destination, travelDate, transportSteps, preferredSex, organizerId, status, joinRequests } = trip;
  const approvedCount = joinRequests?.filter(r => r.status === 'approved')?.length || 0;

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
    <Link to={`/trips/${_id}`} className="card p-5 block hover:border-brand-500/30 hover:bg-dark-700 transition-all duration-200 group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display font-semibold text-white text-lg group-hover:text-brand-400 transition-colors">
            → {destination}
          </h3>
          <p className="text-white/40 text-sm mt-0.5">
            {travelDate ? format(new Date(travelDate), 'EEE, MMM d yyyy') : 'Date TBD'}
          </p>
        </div>
        <span className={`badge border ${statusColors[status] || statusColors.open}`}>
          {status}
        </span>
      </div>

      {/* Transport steps summary */}
      <div className="flex flex-wrap items-center gap-1 mb-4">
        {transportSteps?.map((step, i) => {
          const Icon = modeIcons[step.mode] || fallbackModeIcon;
          return (
            <span key={i} className="flex items-center gap-1 text-xs text-white/50">
              {i > 0 && <span className="text-white/20">→</span>}
              <Icon className="w-3.5 h-3.5" />
              <span>{step.from}</span>
            </span>
          );
        })}
        {transportSteps?.length > 0 && (
          <span className="flex items-center gap-1 text-xs text-white/50">
            <span className="text-white/20">→</span>
            <span>{transportSteps[transportSteps.length - 1]?.to}</span>
          </span>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        {showOrganizer && organizerId && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs text-brand-400 font-semibold">
              {organizerId.name?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-white/40">{organizerId.name}</span>
          </div>
        )}
        <div className="flex items-center gap-3 ml-auto">
          {preferredSex !== 'Any' && (
            <span className="text-xs text-white/30">{preferredSex} only</span>
          )}
          <span className="text-xs text-white/30">{approvedCount} joined</span>
        </div>
      </div>
    </Link>
    </motion.div>
  );
}
