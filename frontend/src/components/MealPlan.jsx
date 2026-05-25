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
  breakfast: { label: 'Breakfast', accent: '#eaa221', bg: 'rgba(234, 162, 33, 0.14)' },
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

function MealCard({ meal, mealType, day, taxRate = 0, isSkipped = false, onToggleSkip, onMealClick, onNeverAgain, isFavorite = false, onToggleFavoriteRecipe }) {
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
        textShadow: '1px 2px 3px rgba(0,0,0,0.6)',
      }}>
        {day}
      </div>
      {/* Deal tag + favorite star (clickable on the card so the user can star without opening the recipe) */}
      {(onSale || onToggleFavoriteRecipe) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
          {onToggleFavoriteRecipe && meal.id ? (
            <button
              onClick={e => { e.stopPropagation(); onToggleFavoriteRecipe(meal.id); }}
              title={isFavorite ? 'Remove from favorites' : 'Favorite this recipe'}
              aria-label={isFavorite ? 'Unfavorite recipe' : 'Favorite recipe'}
              style={{
                background: 'transparent',
                border: 'none',
                padding: '0 2px',
                fontSize: 22,
                lineHeight: 1,
                cursor: 'pointer',
                color: isFavorite ? '#eaa221' : 'rgba(240, 232, 218, 0.4)',
                textShadow: isFavorite ? '0 0 8px rgba(234,162,33,0.65), 1px 2px 3px rgba(0,0,0,0.6)' : '1px 2px 3px rgba(0,0,0,0.5)',
                transition: 'color 0.2s, text-shadow 0.2s',
              }}
            >
              {isFavorite ? '★' : '☆'}
            </button>
          ) : <span />}
          {onSale && (
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
          )}
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
        textShadow: '1px 2px 3px rgba(0,0,0,0.55)',
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
        textShadow: '2px 3px 4px rgba(0,0,0,0.7)',
      }}>
        ${wt(meal.cost)?.toFixed(2)}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 6, alignSelf: 'flex-end', marginTop: 4, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
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
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            boxShadow: '2px 3px 6px rgba(0,0,0,0.5), 4px 5px 12px rgba(0,0,0,0.3)',
          }}
          title="Replace just this meal with a different recipe."
        >
          ✕ Skip
        </button>
        {meal.id && onNeverAgain && (
          <button
            onClick={e => {
              e.stopPropagation();
              onNeverAgain?.({ id: meal.id, name: meal.name });
            }}
            style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 13,
              fontWeight: 700,
              color: '#faf5e8',
              background: 'rgba(60,40,30,0.85)',
              border: '1px solid rgba(40,25,15,0.7)',
              borderRadius: 4,
              padding: '4px 10px',
              cursor: 'pointer',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              boxShadow: '2px 3px 6px rgba(0,0,0,0.5), 4px 5px 12px rgba(0,0,0,0.3)',
            }}
            title="Permanently exclude this recipe from all future menus."
          >
            ⌀ Never Again
          </button>
        )}
      </div>
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
        color: '#eaa221',
        marginTop: 1,
        textShadow: '1px 2px 3px rgba(0,0,0,0.5)',
      }}>
        {label}
      </div>
    </div>
  );
}

// Three noise layers stacked = real cork texture:
//   - fine grain ('cork-dust'): tight speckle that fills every pixel
//   - mid flecks ('cork-fleck'): the visible irregular cork particles
//   - large chunks ('cork-chunk'): sparse darker spots, the bigger cork pieces
// Each uses feColorMatrix to land on warm dark-brown with controlled alpha,
// so they layer naturally over the tan base instead of producing muddy noise.
const corkDust  = `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='d'><feTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='2' seed='4' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.30  0 0 0 0 0.20  0 0 0 0 0.09  0 0 0 0.40 -0.05'/></filter><rect width='240' height='240' filter='url(#d)'/></svg>`;
const corkFleck = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'><filter id='f'><feTurbulence type='fractalNoise' baseFrequency='0.35' numOctaves='3' seed='11' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.22  0 0 0 0 0.13  0 0 0 0 0.05  0 0 0 0.65 -0.20'/></filter><rect width='320' height='320' filter='url(#f)'/></svg>`;
const corkChunk = `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='420'><filter id='c'><feTurbulence type='fractalNoise' baseFrequency='0.09' numOctaves='2' seed='17' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.18  0 0 0 0 0.10  0 0 0 0 0.03  0 0 0 0.55 -0.30'/></filter><rect width='420' height='420' filter='url(#c)'/></svg>`;

const cardBase = {
  position: 'relative',
  borderRadius: 10,
  border: '1px solid #6a523a',
  borderTop: '2px solid rgba(220,190,140,0.5)',
  borderBottom: '4px solid rgba(38,22,8,0.8)',
  borderLeft: '2px solid rgba(180,150,100,0.28)',
  borderRight: '3px solid rgba(60,40,15,0.45)',
  padding: '44px 15px 13px',
  minHeight: 168,
  background: `
    url("data:image/svg+xml;utf8,${encodeURIComponent(corkDust)}"),
    url("data:image/svg+xml;utf8,${encodeURIComponent(corkFleck)}"),
    url("data:image/svg+xml;utf8,${encodeURIComponent(corkChunk)}"),
    radial-gradient(ellipse at 30% 25%, rgba(245,210,160,0.22) 0%, transparent 55%),
    radial-gradient(ellipse at 75% 75%, rgba(80,52,22,0.20) 0%, transparent 55%),
    linear-gradient(180deg, rgba(255,235,200,0.10) 0%, transparent 12%, transparent 88%, rgba(35,20,8,0.18) 100%),
    #c19a71
  `,
  backgroundSize: '240px 240px, 320px 320px, 420px 420px, auto, auto, auto, auto',
  backgroundRepeat: 'repeat, repeat, repeat, no-repeat, no-repeat, no-repeat, no-repeat',
  boxShadow: 'inset 0 2px 0 rgba(255,235,200,0.12), inset 0 -3px 8px rgba(0,0,0,0.25), 4px 6px 14px rgba(0,0,0,0.4), 8px 10px 20px rgba(0,0,0,0.18)',
};

export default function MealPlan({ plan, taxRate = 0, skippedMeals = {}, onToggleSkip, onMealClick, onNeverAgain, favoritedRecipes = [], onToggleFavoriteRecipe }) {
  const favoriteSet = new Set(favoritedRecipes);
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
            textShadow: '2px 3px 4px rgba(0,0,0,0.7)',
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
                textShadow: '3px 3px 0 #1a0e06, 5px 6px 8px rgba(0,0,0,0.5)',
              }}>
                <TomatoBullet size={32} />
                {MEAL_CONFIG[type].label}
              </span>
            </div>
            {days.map(day => (
              <MealCard key={`${day}-${type}`} meal={plan[day][type]} mealType={type} day={day} taxRate={taxRate} isSkipped={!!skippedMeals[`${day}-${type}`]} onToggleSkip={() => onToggleSkip?.(`${day}-${type}`)} onMealClick={onMealClick} onNeverAgain={onNeverAgain} isFavorite={!!plan[day][type]?.id && favoriteSet.has(plan[day][type].id)} onToggleFavoriteRecipe={onToggleFavoriteRecipe} />
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
            textShadow: '2px 3px 4px rgba(0,0,0,0.7)',
            textDecoration: 'underline',
            textUnderlineOffset: '4px',
          }}>
            Daily Totals:
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
