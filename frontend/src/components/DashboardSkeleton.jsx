import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import TripCardSkeleton from './TripCardSkeleton';

export default function DashboardSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="card p-8 mb-8">
        <Skeleton width={180} height={14} style={{ marginBottom: 8 }} />
        <Skeleton width={260} height={32} style={{ marginBottom: 8 }} />
        <Skeleton width={220} height={14} />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        <Skeleton height={88} borderRadius={16} />
        <Skeleton height={88} borderRadius={16} />
      </div>

      {/* Trip columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Skeleton width={160} height={20} style={{ marginBottom: 16 }} />
          <div className="space-y-3">
            {[1, 2, 3].map(i => <TripCardSkeleton key={i} />)}
          </div>
        </div>
        <div>
          <Skeleton width={140} height={20} style={{ marginBottom: 16 }} />
          <div className="space-y-3">
            {[1, 2, 3].map(i => <TripCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
