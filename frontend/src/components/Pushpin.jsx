const POSITION_STYLES = {
  'top-center':    { top: 5,  left: '50%', transform: 'translateX(-50%)' },
  'top-left':      { top: 8,  left: 8 },
  'top-right':     { top: 8,  right: 8 },
  'bottom-left':   { bottom: 8, left: 8 },
  'bottom-right':  { bottom: 8, right: 8 },
};

export default function Pushpin({ size = 26, position = 'top-center' }) {
  const pos = POSITION_STYLES[position] || POSITION_STYLES['top-center'];
  // Unique gradient ids per render so multiple pins in one DOM don't reuse a hidden defs node.
  const gid = Math.random().toString(36).slice(2, 8);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      style={{
        position: 'absolute',
        zIndex: 3,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 4px 2px rgba(0,0,0,0.6)) drop-shadow(0 8px 10px rgba(0,0,0,0.45)) drop-shadow(0 1px 0 rgba(0,0,0,0.45))',
        ...pos,
      }}
    >
      <defs>
        <radialGradient id={`pin-dome-${gid}`} cx="32%" cy="26%" r="82%">
          <stop offset="0%" stopColor="#fbeab2" />
          <stop offset="14%" stopColor="#e2bb55" />
          <stop offset="38%" stopColor="#a07a18" />
          <stop offset="65%" stopColor="#5c4209" />
          <stop offset="100%" stopColor="#1f1604" />
        </radialGradient>
        <radialGradient id={`pin-rim-${gid}`} cx="50%" cy="82%" r="62%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.75)" />
          <stop offset="60%" stopColor="rgba(0,0,0,0.25)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <linearGradient id={`pin-equator-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="48%" stopColor="rgba(0,0,0,0)" />
          <stop offset="62%" stopColor="rgba(0,0,0,0.55)" />
          <stop offset="78%" stopColor="rgba(0,0,0,0.15)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
        <radialGradient id={`pin-glint-${gid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,255,255,1)" />
          <stop offset="40%" stopColor="rgba(245,235,220,0.55)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <ellipse cx="20" cy="27" rx="12" ry="2.8" fill="rgba(0,0,0,0.5)" />
      <circle cx="20" cy="20" r="12" fill={`url(#pin-dome-${gid})`} />
      <circle cx="20" cy="20" r="12" fill={`url(#pin-rim-${gid})`} />
      <circle cx="20" cy="20" r="12" fill={`url(#pin-equator-${gid})`} />
      <path d="M9 22.8 Q20 30.5, 31 22.8" stroke="rgba(20,10,1,0.8)" strokeWidth="1.1" fill="none" />
      <path d="M9.5 19 Q11 11, 18 9" stroke="rgba(250,225,170,0.4)" strokeWidth="0.7" fill="none" />
      <ellipse cx="15" cy="14.5" rx="4.4" ry="2.8" fill={`url(#pin-glint-${gid})`} transform="rotate(-32,15,14.5)" />
      <circle cx="13.4" cy="13.2" r="1.5" fill="rgba(255,250,235,1)" />
      <ellipse cx="25.5" cy="24" rx="3" ry="1.2" fill="rgba(220,170,80,0.28)" transform="rotate(22,25.5,24)" />
    </svg>
  );
}

export function CornerPins({ size = 22 }) {
  return (
    <>
      <Pushpin size={size} position="top-left" />
      <Pushpin size={size} position="top-right" />
      <Pushpin size={size} position="bottom-left" />
      <Pushpin size={size} position="bottom-right" />
    </>
  );
}
