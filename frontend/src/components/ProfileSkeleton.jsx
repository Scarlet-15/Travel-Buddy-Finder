import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import TripCardSkeleton from './TripCardSkeleton';

export default function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile card */}
        <div className="md:col-span-1">
          <div className="card p-6">
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                <Skeleton width={80} height={80} borderRadius={16} />
              </div>
              <Skeleton width={140} height={22} />
              <Skeleton width={100} height={14} style={{ marginTop: 4 }} />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i}>
                  <Skeleton width={60} height={12} />
                  <Skeleton width="80%" height={16} style={{ marginTop: 2 }} />
                </div>
              ))}
              <Skeleton height={36} borderRadius={12} style={{ marginTop: 8 }} />
            </div>
          </div>
        </div>

        {/* Trips section */}
        <div className="md:col-span-2">
          <Skeleton width={120} height={28} style={{ marginBottom: 24 }} />
          <div className="flex gap-4 mb-6">
            <Skeleton width={100} height={20} />
            <Skeleton width={80} height={20} />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => <TripCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
