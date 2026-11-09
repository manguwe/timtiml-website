/** The TIMTIML shield logo (used by the loader and on certificates). */
export function Logo({ size = 80, id = 'lg' }: { size?: number; id?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00d4ff" />
          <stop offset="100%" stopColor="#00ff9d" />
        </linearGradient>
      </defs>
      <path d="M60 8 L105 28 L105 65 Q105 95 60 114 Q15 95 15 65 L15 28 Z" fill="#0a0e1a" stroke={`url(#${id})`} strokeWidth="2" />
      <text x="60" y="72" textAnchor="middle" fontFamily="Courier New,monospace" fontSize="22" fontWeight="900" fill={`url(#${id})`}>
        {'</>'}
      </text>
    </svg>
  );
}
