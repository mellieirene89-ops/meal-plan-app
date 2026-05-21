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
          <stop offset="0%" stopColor="#f0c39a" />
          <stop offset="14%" stopColor="#c87a3e" />
          <stop offset="38%" stopColor="#8a3f17" />
          <stop offset="65%" stopColor="#48200a" />
          <stop offset="100%" stopColor="#160802" />
        </radialGradient>
        <radialGradient id={`pin-rim-${gid}`} cx="50%" cy="82%" r="62%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.85)" />
          <stop offset="60%" stopColor="rgba(0,0,0,0.32)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
        <linearGradient id={`pin-equator-${gid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0)" />
          <stop offset="48%" stopColor="rgba(0,0,0,0)" />
          <stop offset="62%" stopColor="rgba(0,0,0,0.6)" />
          <stop offset="78%" stopColor="rgba(0,0,0,0.2)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
        <radialGradient id={`pin-glint-${gid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,232,210,0.95)" />
          <stop offset="40%" stopColor="rgba(240,200,165,0.45)" />
          <stop offset="100%" stopColor="rgba(255,220,190,0)" />
        </radialGradient>
        <radialGradient id={`pin-patina-${gid}`} cx="78%" cy="72%" r="38%">
          <stop offset="0%" stopColor="rgba(60,38,18,0.35)" />
          <stop offset="100%" stopColor="rgba(60,38,18,0)" />
        </radialGradient>
      </defs>
      <ellipse cx="20" cy="27" rx="12" ry="2.8" fill="rgba(0,0,0,0.55)" />
      <circle cx="20" cy="20" r="12" fill={`url(#pin-dome-${gid})`} />
      <circle cx="20" cy="20" r="12" fill={`url(#pin-rim-${gid})`} />
      <circle cx="20" cy="20" r="12" fill={`url(#pin-equator-${gid})`} />
      <circle cx="20" cy="20" r="12" fill={`url(#pin-patina-${gid})`} />
      <path d="M9 22.8 Q20 30.5, 31 22.8" stroke="rgba(15,6,1,0.85)" strokeWidth="1.1" fill="none" />
      <path d="M9.5 19 Q11 11, 18 9" stroke="rgba(245,200,155,0.42)" strokeWidth="0.7" fill="none" />
      <ellipse cx="15" cy="14.5" rx="4.2" ry="2.6" fill={`url(#pin-glint-${gid})`} transform="rotate(-32,15,14.5)" />
      <circle cx="13.4" cy="13.2" r="1.3" fill="rgba(255,230,205,0.95)" />
      <ellipse cx="25.5" cy="24" rx="3" ry="1.2" fill="rgba(180,95,45,0.3)" transform="rotate(22,25.5,24)" />
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
