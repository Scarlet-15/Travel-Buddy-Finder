import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export default function TripCardSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <Skeleton width="60%" height={24} />
          <Skeleton width="40%" height={16} style={{ marginTop: 4 }} />
        </div>
        <Skeleton width={50} height={20} borderRadius={20} />
      </div>
      <div className="flex items-center gap-2 mb-4">
        <Skeleton width={60} height={14} />
        <Skeleton width={60} height={14} />
        <Skeleton width={60} height={14} />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          <Skeleton circle width={24} height={24} />
          <Skeleton width={80} height={14} />
        </div>
        <Skeleton width={50} height={14} />
      </div>
    </div>
  );
}
