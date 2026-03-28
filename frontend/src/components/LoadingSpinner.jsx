export default function LoadingSpinner({ size = 'lg', text = '' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <div className={`${size === 'lg' ? 'w-12 h-12' : 'w-6 h-6'} border-2 border-white/10 border-t-brand-500 rounded-full animate-spin`} />
      {text && <p className="text-white/40 text-sm">{text}</p>}
    </div>
  );
}

export function InlineSpinner() {
  return <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin inline-block" />;
}
