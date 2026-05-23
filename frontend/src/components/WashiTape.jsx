const POSITION_STYLES = {
  'top-left':     { top: -10, left: -18, rotate: -32 },
  'top-right':    { top: -10, right: -18, rotate: 32 },
  'bottom-left':  { bottom: -10, left: -18, rotate: 32 },
  'bottom-right': { bottom: -10, right: -18, rotate: -32 },
};

export default function WashiTape({
  position = 'top-right',
  width = 92,
  height = 22,
  tone = 'marigold',
}) {
  const pos = POSITION_STYLES[position] || POSITION_STYLES['top-right'];

  const palette = tone === 'kraft'
    ? { base: 'rgba(196, 154, 92, 0.55)', edge: 'rgba(120, 88, 48, 0.45)' }
    : { base: 'rgba(234, 162, 33, 0.45)', edge: 'rgba(150, 95, 18, 0.45)' };

  const grain = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='40'><filter id='g'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.1  0 0 0 0 0.06  0 0 0 0 0.02  0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23g)' opacity='0.45'/></svg>")`;

  return (
    <div
      aria-hidden
      style={{
        position: 'absolute',
        top: pos.top,
        bottom: pos.bottom,
        left: pos.left,
        right: pos.right,
        width,
        height,
        transform: `rotate(${pos.rotate}deg)`,
        transformOrigin: 'center',
        zIndex: 3,
        pointerEvents: 'none',
        background: `
          ${grain},
          linear-gradient(180deg,
            ${palette.edge} 0%,
            ${palette.base} 18%,
            ${palette.base} 82%,
            ${palette.edge} 100%
          )
        `,
        backgroundSize: '120px 40px, auto',
        backgroundBlendMode: 'multiply, normal',
        boxShadow: [
          '0 2px 3px rgba(0,0,0,0.35)',
          '0 5px 9px rgba(0,0,0,0.25)',
          'inset 0 1px 0 rgba(255,235,200,0.35)',
          'inset 0 -1px 0 rgba(0,0,0,0.18)',
        ].join(', '),
        // Slight torn/uneven ends via clip-path
        clipPath: 'polygon(2% 8%, 6% 0, 12% 12%, 18% 4%, 24% 14%, 96% 6%, 100% 0, 98% 22%, 96% 100%, 92% 88%, 86% 96%, 80% 86%, 74% 96%, 4% 92%, 0 100%, 2% 78%)',
      }}
    />
  );
}
