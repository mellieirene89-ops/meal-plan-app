import { CornerPins } from './Pushpin.jsx';

export default function BudgetBar({ weeklyTotal, budget, taxRate = 0 }) {
  const cap = budget || 70;
  const pct = Math.min((weeklyTotal / cap) * 100, 100);
  const over = weeklyTotal > cap;
  const diff = Math.abs(cap - weeklyTotal);

  const barColor = over
    ? 'linear-gradient(90deg, var(--amber), var(--terra))'
    : pct > 80
      ? 'linear-gradient(90deg, #3a5a28, var(--amber))'
      : 'linear-gradient(90deg, #3a5a28, #4a6a30)';

  return (
    <div className="budget-bar" style={{
      position: 'relative',
      background: `
        url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='600' height='200'>
          <filter id='crumple'>
            <feTurbulence type='fractalNoise' baseFrequency='0.04 0.06' numOctaves='5' seed='8' stitchTiles='stitch'/>
            <feColorMatrix type='saturate' values='0'/>
            <feComponentTransfer>
              <feFuncR type='linear' slope='0.2' intercept='0'/>
              <feFuncG type='linear' slope='0.16' intercept='0'/>
              <feFuncB type='linear' slope='0.1' intercept='0'/>
              <feFuncA type='linear' slope='0.5' intercept='0'/>
            </feComponentTransfer>
          </filter>
          <rect width='600' height='200' filter='url(#crumple)'/>
        </svg>`)}"),
        url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
          <filter id='fibers'>
            <feTurbulence type='fractalNoise' baseFrequency='0.5 0.02' numOctaves='3' seed='12' stitchTiles='stitch'/>
            <feColorMatrix type='saturate' values='0'/>
            <feComponentTransfer>
              <feFuncR type='linear' slope='0.08' intercept='0'/>
              <feFuncG type='linear' slope='0.06' intercept='0'/>
              <feFuncB type='linear' slope='0.04' intercept='0'/>
              <feFuncA type='linear' slope='0.2' intercept='0'/>
            </feComponentTransfer>
          </filter>
          <rect width='400' height='400' filter='url(#fibers)'/>
        </svg>`)}"),
        linear-gradient(155deg, rgba(0,0,0,0.08) 0%, transparent 20%, rgba(0,0,0,0.05) 35%, transparent 50%, rgba(0,0,0,0.06) 65%, transparent 80%, rgba(0,0,0,0.04) 100%),
        radial-gradient(ellipse at 15% 25%, rgba(200,170,120,0.25) 0%, transparent 40%),
        radial-gradient(ellipse at 75% 60%, rgba(160,130,80,0.2) 0%, transparent 45%),
        radial-gradient(ellipse at 45% 80%, rgba(140,110,65,0.15) 0%, transparent 35%),
        radial-gradient(ellipse at 85% 15%, rgba(180,150,100,0.18) 0%, transparent 30%),
        rgba(184,149,106,0.5)
      `.trim(),
      borderTop: '1px solid rgba(220,195,150,0.55)',
      borderLeft: '1px solid rgba(200,175,130,0.35)',
      borderRight: '1px solid rgba(20,12,4,0.45)',
      borderBottom: '3px solid rgba(15,8,3,0.75)',
      borderRadius: 10,
      padding: '28px 32px',
      marginBottom: 32,
      boxShadow: 'inset 0 1px 0 rgba(255,245,215,0.18), inset 0 -3px 8px rgba(0,0,0,0.22), 0 6px 14px rgba(0,0,0,0.32)',
      display: 'grid',
      gridTemplateColumns: 'auto 1fr auto',
      gap: 0,
      alignItems: 'center',
    }}>
      <CornerPins />

      {/* Left — weekly total */}
      <div style={{
        borderRight: '2px solid rgba(255,255,255,0.15)',
        paddingRight: 32,
        marginRight: 32,
        boxShadow: '1px 0 0 rgba(0,0,0,0.3)',
      }}>
        <span style={{
          fontFamily: 'Cormorant Garamond, serif',
          textTransform: 'uppercase',
          fontSize: 22,
          fontWeight: 700,
          color: '#eaa221',
          display: 'block',
          marginBottom: 6,
          letterSpacing: '0.25em',
          textShadow: '2px 2px 0 rgba(0,0,0,0.75), 3px 4px 5px rgba(0,0,0,0.4)',
        }}>
          Est. Weekly Cost
        </span>
        <span style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: 'clamp(48px, 8vw, 68px)',
          fontWeight: 900,
          color: '#1a3312',
          lineHeight: 1,
          letterSpacing: '0.08em',
          WebkitTextStroke: 'none',
          paintOrder: 'stroke fill',
          textShadow: '2px 3px 4px rgba(0,0,0,0.35)',
          display: 'block',
        }}>
          <span style={{ fontSize: '0.6em', opacity: 0.75, marginRight: 2 }}>~</span>${weeklyTotal.toFixed(2).split('.')[0]}.<span style={{ fontSize: '0.55em', verticalAlign: 'super', letterSpacing: '0.04em' }}>{weeklyTotal.toFixed(2).split('.')[1]}</span>
        </span>
        <span style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 24,
          fontWeight: 700,
          fontStyle: 'italic',
          color: 'rgba(255,255,255,0.85)',
          display: 'block',
          marginTop: 4,
        }}>
          {taxRate > 0 ? `(incl. ${(taxRate * 100).toFixed(1)}% grocery tax · register may vary)` : '(no grocery tax · register may vary)'}
        </span>
      </div>

      {/* Center — bar */}
      <div className="budget-bar-center" style={{ padding: '0 8px' }}>
        <div style={{ position: 'relative', height: 16, background: 'rgba(240,232,218,0.12)', borderRadius: 99, overflow: 'visible', border: '1px solid rgba(240,232,218,0.1)', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }}>
          {/* Tick marks */}
          {[25, 50, 75].map(tick => (
            <div key={tick} style={{
              position: 'absolute',
              left: `${tick}%`,
              top: 0, bottom: 0,
              width: 1,
              background: 'rgba(237,232,216,0.18)',
              zIndex: 2,
            }} />
          ))}
          <div style={{
            position: 'absolute',
            left: 0, top: 0, bottom: 0,
            width: `${pct}%`,
            background: barColor,
            borderRadius: 99,
            transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
            animation: 'barGrow 0.7s cubic-bezier(0.4,0,0.2,1) both',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 0 2px 6px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3), 0 0 16px rgba(58,90,40,0.4)',
            borderTop: '1px solid rgba(255,255,255,0.2)',
            borderBottom: '2px solid rgba(0,0,0,0.3)',
          }}>
            {/* Dollar sign at end of slider */}
            <span style={{
              position: 'absolute',
              right: -8,
              top: '50%',
              transform: 'translateY(-50%)',
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 58,
              fontWeight: 900,
              color: '#eaa221',
              WebkitTextStroke: '1.5px #2a1608',
              paintOrder: 'stroke fill',
              filter: 'drop-shadow(3px 5px 4px rgba(0,0,0,0.55)) drop-shadow(5px 8px 12px rgba(0,0,0,0.35))',
              textShadow: [
                '0 0 2px rgba(255,255,200,0.6)',
                '0 0 5px rgba(234,162,33,0.35)',
                '2px 3px 0px rgba(0,0,0,0.85)',
                '4px 5px 4px rgba(0,0,0,0.55)',
              ].join(', '),
              zIndex: 3,
            }}>$</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, fontWeight: 900, color: '#eaa221', letterSpacing: '0.06em', textShadow: '2px 2px 0 rgba(0,0,0,0.75), 3px 4px 5px rgba(0,0,0,0.4)' }}>$0</span>
          <span style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 24, fontWeight: 900, color: '#eaa221', letterSpacing: '0.06em', textShadow: '2px 2px 0 rgba(0,0,0,0.75), 3px 4px 5px rgba(0,0,0,0.4)' }}>${cap} <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 13, fontWeight: 700, letterSpacing: '0.15em', color: 'rgba(255,255,255,0.5)' }}>BUDGET</span></span>
        </div>
      </div>

      {/* Right — delta */}
      <div style={{
        textAlign: 'right',
        borderLeft: '2px solid rgba(255,255,255,0.15)',
        paddingLeft: 32,
        marginLeft: 32,
        boxShadow: '-1px 0 0 rgba(0,0,0,0.3)',
      }}>
        <span style={{
          fontFamily: 'Cormorant Garamond, serif',
          textTransform: 'uppercase',
          fontSize: 22,
          fontWeight: 700,
          color: over ? '#e05040' : '#eaa221',
          display: 'block',
          marginBottom: 6,
          letterSpacing: '0.25em',
          textShadow: over ? '0 0 8px rgba(220,80,60,0.65), 2px 2px 0px rgba(0,0,0,0.85), 3px 4px 5px rgba(0,0,0,0.5)' : '0 0 6px rgba(234,162,33,0.85), 0 0 14px rgba(234,162,33,0.55), 0 0 28px rgba(234,162,33,0.3), 2px 2px 0px rgba(0,0,0,0.85), 3px 4px 5px rgba(0,0,0,0.55), 5px 7px 12px rgba(0,0,0,0.35)',
        }}>
          {over ? 'Over Budget' : 'Under Budget'}
        </span>
        <span style={{
          fontFamily: 'Bebas Neue, sans-serif',
          fontSize: 44,
          fontWeight: 900,
          color: over ? '#8b1a1a' : '#1a3312',
          letterSpacing: '0.08em',
          WebkitTextStroke: 'none',
          paintOrder: 'stroke fill',
          textShadow: over
            ? '0 0 24px rgba(220,80,60,0.8), 0 0 48px rgba(200,50,30,0.6), 0 0 80px rgba(180,30,20,0.35)'
            : '0 0 18px rgba(245,163,10,0.25), 0 0 36px rgba(234,162,33,0.15), 0 0 60px rgba(200,140,10,0.08)',
        }}>
          {over ? '+' : '-'}${diff.toFixed(2).split('.')[0]}.<span style={{ fontSize: '0.55em', verticalAlign: 'super', letterSpacing: '0.04em' }}>{diff.toFixed(2).split('.')[1]}</span>
        </span>
      </div>
    </div>
  );
}
