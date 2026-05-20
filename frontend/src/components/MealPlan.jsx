import Pushpin from './Pushpin.jsx';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

function TomatoBullet({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 36" style={{ flexShrink: 0, filter: 'none' }}>
      {/* stem */}
      <path d="M16 3 C16 3, 14 6, 16 7.5 C18 6, 16 3, 16 3Z" fill="#4a7828" />
      {/* calyx leaves */}
      <path d="M11 7 Q8 3, 9 1" fill="none" stroke="#3a6020" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M21 7 Q24 3, 23 1" fill="none" stroke="#3a6020" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 6 Q12 2, 14 1" fill="none" stroke="#4a7828" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M18 6 Q20 2, 18 1" fill="none" stroke="#4a7828" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M10 8 Q7 5, 6 4" fill="none" stroke="#3a6020" strokeWidth="1" strokeLinecap="round" />
      <path d="M22 8 Q25 5, 26 4" fill="none" stroke="#3a6020" strokeWidth="1" strokeLinecap="round" />
      {/* heirloom body — irregular lobed shape */}
      <path d="M16 8 C10 8, 4 12, 4 18 C4 24, 8 28, 12 28 C13 28, 14 27.5, 15 27 C15.5 28, 16.5 28, 17 27 C18 27.5, 19 28, 20 28 C24 28, 28 24, 28 18 C28 12, 22 8, 16 8Z" fill="#8b2a2a" />
      {/* color variation patches */}
      <ellipse cx="10" cy="17" rx="4.5" ry="6" fill="#a03525" opacity="0.7" transform="rotate(-10,10,17)" />
      <ellipse cx="21" cy="18" rx="4" ry="5.5" fill="#6b3040" opacity="0.6" transform="rotate(8,21,18)" />
      <ellipse cx="16" cy="20" rx="5" ry="4" fill="#944030" opacity="0.5" />
      <ellipse cx="14" cy="14" rx="3" ry="4" fill="#c44535" opacity="0.4" transform="rotate(-15,14,14)" />
      {/* ribbing lines */}
      <path d="M12 9 Q11 18, 12 27" fill="none" stroke="#6b2020" strokeWidth="0.6" opacity="0.4" />
      <path d="M20 9 Q21 18, 20 27" fill="none" stroke="#6b2020" strokeWidth="0.6" opacity="0.4" />
      <path d="M16 8 Q16 18, 16 27.5" fill="none" stroke="#6b2020" strokeWidth="0.5" opacity="0.3" />
      {/* highlight */}
      <ellipse cx="11" cy="13" rx="3" ry="2.5" fill="white" opacity="0.12" transform="rotate(-25,11,13)" />
      <ellipse cx="19" cy="12" rx="2" ry="1.5" fill="white" opacity="0.08" transform="rotate(15,19,12)" />
    </svg>
  );
}

// Pin shared with other panels — imported from ./Pushpin.jsx above.

const MEAL_CONFIG = {
  breakfast: { label: 'Breakfast', accent: '#e8a817', bg: 'rgba(232, 168, 23, 0.14)' },
  lunch:     { label: 'Lunch',     accent: '#d4920f', bg: 'rgba(212, 146, 15, 0.14)' },
  dinner:    { label: 'Dinner',    accent: '#c07e0a', bg: 'rgba(192, 126, 10, 0.14)' },
};

// Scale the font down only when the longest single word would overflow the card.
// `maxChars` is the longest word that fits at the base size; anything longer shrinks proportionally down to `min`.
function fitFontSize(name, base, min, maxChars) {
  const longest = name.split(/\s+/).reduce((m, w) => (w.length > m ? w.length : m), 0);
  if (longest <= maxChars) return base;
  return Math.max(min, Math.round((base * maxChars) / longest));
}

function MealCard({ meal, mealType, day, taxRate = 0, isSkipped = false, onToggleSkip, onMealClick }) {
  const wt = (v) => Math.round(v * (1 + taxRate) * 100) / 100;
  const { accent, bg } = MEAL_CONFIG[mealType];

  if (!meal) return (
    <div style={{
      ...cardBase,
      opacity: 0.5,
      border: '2px dashed #6b4e2e',
    }} />
  );

  if (isSkipped) return (
    <div style={{
      ...cardBase,
      border: '2px dashed #6b4e2e',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      opacity: 0.5,
    }}>
      <Pushpin size={30} position="top-center" />
      <p style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: fitFontSize(meal.name, 14, 10, 10),
        fontWeight: 600,
        color: 'var(--chalk-muted)',
        fontStyle: 'italic',
        textAlign: 'center',
      }}>
        {meal.name}
      </p>
      <span
        onClick={e => { e.stopPropagation(); onToggleSkip?.(); }}
        style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 13,
          fontWeight: 700,
          color: '#8db84a',
          cursor: 'pointer',
          padding: '3px 10px',
          border: '1px solid rgba(141,184,74,0.4)',
          borderRadius: 4,
        }}
      >
        + Add Back
      </span>
    </div>
  );

  const onSale = meal.ingredients?.some(i => i.onSale);

  return (
    <div
      onClick={() => onMealClick?.(day, mealType)}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onMealClick?.(day, mealType); } }}
      style={{
        ...cardBase,
        borderLeft: `3px solid ${accent}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 9,
        animation: 'fadeUp 0.35s ease both',
        cursor: 'pointer',
      }}>
      <Pushpin size={30} position="top-center" />
      {/* Day name (visible on mobile only) */}
      <div className="card-day-label" style={{
        display: 'none',
        fontFamily: 'Amatic SC, cursive',
        fontSize: 20,
        fontWeight: 700,
        color: 'var(--chalk)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: 2,
        textShadow: '2px 3px 4px rgba(0,0,0,0.7), 3px 5px 10px rgba(0,0,0,0.4)',
      }}>
        {day}
      </div>
      {/* Deal tag */}
      {onSale && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <span style={{
            background: 'var(--sale)',
            color: '#1a1400',
            fontSize: 12,
            fontWeight: 800,
            padding: '2px 7px',
            borderRadius: 4,
            letterSpacing: '0.06em',
            fontFamily: 'JetBrains Mono, monospace',
            boxShadow: '1px 2px 3px rgba(0,0,0,0.4), 3px 4px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.15)',
          }}>
            ★ DEAL
          </span>
        </div>
      )}

      {/* Meal name */}
      <p style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: fitFontSize(meal.name, 18, 11, 9),
        fontWeight: 700,
        lineHeight: 1.3,
        color: '#faf5e8',
        flex: 1,
        textShadow: '2px 2px 0px rgba(0,0,0,0.8), 4px 4px 6px rgba(0,0,0,0.5), 0 0 12px rgba(0,0,0,0.3)',
      }}>
        {meal.name}
      </p>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 6,
        padding: '8px 0 2px',
        borderTop: '1px solid var(--chalk-border)',
      }}>
        <Stat label="prep" value={`${meal.prepMinutes}m`} />
        <Stat label="protein" value={`${meal.protein_g}g`} />
        <Stat label="veggies" value={meal.veggie_count} />
      </div>

      {/* Cost */}
      <div style={{
        fontFamily: 'Bebas Neue, sans-serif',
        fontSize: 30,
        fontWeight: 900,
        color: '#ffffff',
        letterSpacing: '0.08em',
        lineHeight: 1,
        WebkitTextStroke: '1.5px #1a3312',
        paintOrder: 'stroke fill',
        textShadow: '2px 3px 4px rgba(0,0,0,0.9), 4px 6px 12px rgba(0,0,0,0.7), 0 0 20px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3)',
      }}>
        ${wt(meal.cost)?.toFixed(2)}
      </div>

      {/* Skip button */}
      <button
        onClick={e => { e.stopPropagation(); onToggleSkip?.(); }}
        style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: 13,
          fontWeight: 700,
          color: '#faf5e8',
          background: 'rgba(180,60,40,0.8)',
          border: '1px solid rgba(140,40,25,0.6)',
          borderRadius: 4,
          padding: '4px 12px',
          cursor: 'pointer',
          alignSelf: 'flex-end',
          marginTop: 4,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          boxShadow: '2px 3px 6px rgba(0,0,0,0.5), 4px 5px 12px rgba(0,0,0,0.3)',
        }}
      >
        ✕ Skip
      </button>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 13,
        fontWeight: 700,
        color: 'var(--chalk)',
        lineHeight: 1.2,
        textShadow: '1px 1px 2px rgba(0,0,0,0.6), 2px 2px 4px rgba(0,0,0,0.3)',
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: 'Amatic SC, cursive', textTransform: 'uppercase',
        fontSize: 15,
        fontWeight: 700,
        color: '#e8a817',
        marginTop: 1,
        textShadow: '1px 2px 3px rgba(0,0,0,0.5)',
      }}>
        {label}
      </div>
    </div>
  );
}

const cardBase = {
  position: 'relative',
  borderRadius: 8,
  border: '1px solid #8a6d4a',
  borderTop: '3px solid rgba(220,190,140,0.6)',
  borderBottom: '5px solid rgba(30,18,5,0.85)',
  borderLeft: '2px solid rgba(180,150,100,0.3)',
  borderRight: '3px solid rgba(60,40,15,0.5)',
  padding: '44px 15px 13px',
  minHeight: 168,
  background: `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='crumple'><feTurbulence type='fractalNoise' baseFrequency='0.04 0.06' numOctaves='6' seed='9' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncR type='linear' slope='0.25' intercept='0'/><feFuncG type='linear' slope='0.2' intercept='0'/><feFuncB type='linear' slope='0.12' intercept='0'/><feFuncA type='linear' slope='0.55' intercept='0'/></feComponentTransfer></filter><rect width='300' height='300' filter='url(#crumple)'/></svg>`)}"), url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='fiber'><feTurbulence type='fractalNoise' baseFrequency='0.5 0.03' numOctaves='3' seed='14' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncR type='linear' slope='0.1' intercept='0'/><feFuncG type='linear' slope='0.08' intercept='0'/><feFuncB type='linear' slope='0.05' intercept='0'/><feFuncA type='linear' slope='0.2' intercept='0'/></feComponentTransfer></filter><rect width='200' height='200' filter='url(#fiber)'/></svg>`)}"), linear-gradient(155deg, rgba(0,0,0,0.1) 0%, transparent 15%, rgba(0,0,0,0.06) 30%, transparent 45%, rgba(0,0,0,0.08) 60%, transparent 75%, rgba(0,0,0,0.05) 100%), radial-gradient(ellipse at 20% 25%, rgba(200,170,120,0.3) 0%, transparent 40%), radial-gradient(ellipse at 75% 65%, rgba(160,130,80,0.25) 0%, transparent 45%), radial-gradient(ellipse at 50% 80%, rgba(140,110,65,0.18) 0%, transparent 35%), linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 15%, transparent 85%, rgba(0,0,0,0.12) 100%), #b8956a`,
  boxShadow: 'inset 0 3px 0 rgba(255,255,255,0.15), inset 0 -4px 8px rgba(0,0,0,0.3), inset 3px 0 6px rgba(0,0,0,0.1), inset -3px 0 6px rgba(0,0,0,0.05), inset 0 0 25px rgba(80,55,30,0.25), 8px 10px 20px rgba(0,0,0,0.6), 14px 18px 40px rgba(0,0,0,0.35), 3px 4px 8px rgba(0,0,0,0.45), 0 20px 30px -10px rgba(0,0,0,0.4)',
};

export default function MealPlan({ plan, taxRate = 0, skippedMeals = {}, onToggleSkip, onMealClick }) {
  const wt = (v) => Math.round(v * (1 + taxRate) * 100) / 100;
  const days = Object.keys(plan);

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 8, maxWidth: '100%' }}>
      <div className="meal-grid" style={{
        display: 'grid',
        gridTemplateColumns: `220px repeat(${days.length}, minmax(0, 1fr))`,
        gap: 8,
      }}>

        {/* Corner */}
        <div className="corner" />

        {/* Day headers */}
        {days.map(day => (
          <div key={day} className="day-header" style={{
            textAlign: 'center',
            fontFamily: 'Amatic SC, cursive',
            fontSize: 28,
            fontWeight: 700,
            color: '#ffffff',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            padding: '12px 2px 18px',
            borderBottom: '1px solid var(--chalk-border)',
            textShadow: '2px 3px 4px rgba(0,0,0,0.9), 4px 6px 12px rgba(0,0,0,0.7), 0 0 20px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3)',
          }}>
            {day}
          </div>
        ))}

        {/* Meal rows */}
        {MEAL_TYPES.map(type => (
          <>
            {/* Row label */}
            <div key={`label-${type}`} className="row-label" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingLeft: 4,
              overflow: 'visible',
              whiteSpace: 'nowrap',
            }}>
              <span style={{
                fontFamily: 'Pinyon Script, cursive',
                fontSize: 42,
                fontWeight: 400,
                color: '#faf5e8',
                letterSpacing: '0.02em',
                textTransform: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                WebkitTextStroke: '1px #faf5e8',
                paintOrder: 'stroke fill',
                textShadow: '4px 4px 0px #1a0e06, 8px 8px 0px rgba(10,4,0,0.9), 12px 12px 4px rgba(0,0,0,0.8), 16px 16px 10px rgba(0,0,0,0.5), 0 0 30px rgba(0,0,0,0.5), 0 0 60px rgba(20,10,0,0.3)',
              }}>
                <TomatoBullet size={32} />
                {MEAL_CONFIG[type].label}
              </span>
            </div>
            {days.map(day => (
              <MealCard key={`${day}-${type}`} meal={plan[day][type]} mealType={type} day={day} taxRate={taxRate} isSkipped={!!skippedMeals[`${day}-${type}`]} onToggleSkip={() => onToggleSkip?.(`${day}-${type}`)} onMealClick={onMealClick} />
            ))}
          </>
        ))}

        {/* Day totals */}
        <div className="day-total-label" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: 10,
        }}>
          <span style={{
            fontFamily: 'Cormorant Garamond, serif', textTransform: 'uppercase',
            fontSize: 26,
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '0.28em',
            textShadow: '2px 3px 4px rgba(0,0,0,0.9), 4px 6px 12px rgba(0,0,0,0.7), 0 0 20px rgba(0,0,0,0.5), 0 0 40px rgba(0,0,0,0.3)',
            textDecoration: 'underline',
            textUnderlineOffset: '4px',
          }}>
            Total
          </span>
        </div>
        {days.map(day => (
          <div key={`total-${day}`} style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #f8f4ec 50%, #efe8da 100%)',
            border: '1px solid #8a6238',
            borderTop: '2px solid rgba(255,255,255,0.8)',
            borderBottom: '3px solid rgba(100,70,30,0.5)',
            borderRadius: 8,
            padding: '20px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.08), 4px 6px 14px rgba(0,0,0,0.4), 8px 10px 24px rgba(0,0,0,0.2), 2px 3px 6px rgba(0,0,0,0.25)',
          }}>
            <span style={{
              fontFamily: 'Bebas Neue, sans-serif',
              fontSize: 38,
              fontWeight: 900,
              color: '#1a1400',
              letterSpacing: '0.04em',
              lineHeight: 1,
              textShadow: '1px 2px 2px rgba(0,0,0,0.18), 2px 3px 5px rgba(0,0,0,0.1)',
            }}>
              ${wt(['breakfast','lunch','dinner'].reduce((sum, t) => sum + (skippedMeals[`${day}-${t}`] ? 0 : (plan[day][t]?.cost || 0)), 0))?.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
