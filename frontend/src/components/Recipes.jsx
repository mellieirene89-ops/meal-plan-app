import { useState, useEffect } from 'react';
import { CornerPins } from './Pushpin.jsx';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

const recipeCard = {
  background: `
    url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'>
      <filter id='aged'>
        <feTurbulence type='fractalNoise' baseFrequency='0.03 0.04' numOctaves='4' seed='15' stitchTiles='stitch'/>
        <feColorMatrix type='saturate' values='0'/>
        <feComponentTransfer>
          <feFuncR type='linear' slope='0.06' intercept='0'/>
          <feFuncG type='linear' slope='0.05' intercept='0'/>
          <feFuncB type='linear' slope='0.03' intercept='0'/>
          <feFuncA type='linear' slope='0.12' intercept='0'/>
        </feComponentTransfer>
      </filter>
      <rect width='400' height='400' filter='url(#aged)'/>
    </svg>`)}"),
    radial-gradient(ellipse at 15% 10%, rgba(180,160,120,0.15) 0%, transparent 50%),
    radial-gradient(ellipse at 85% 90%, rgba(160,140,100,0.12) 0%, transparent 50%),
    linear-gradient(180deg, #faf5e8 0%, #f0e8d6 30%, #e8dcc8 70%, #ddd0b8 100%)
  `.trim(),
  border: '1px solid #c4b8a0',
  borderRadius: 3,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4), inset 0 0 20px rgba(180,160,120,0.1), 0 3px 5px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.3), 0 16px 30px rgba(0,0,0,0.2)',
};

export default function Recipes({ plan, focusTarget, onFocusHandled }) {
  const today = DAYS[new Date().getDay()];
  const [expandedDays, setExpandedDays] = useState({ [today]: true });
  const [highlightKey, setHighlightKey] = useState(null);

  const toggleDay = (day) => setExpandedDays(prev => ({ ...prev, [day]: !prev[day] }));

  useEffect(() => {
    if (!focusTarget) return;
    const { day, mealType } = focusTarget;
    const dayKey = DAYS.find(d => d.toLowerCase() === day.toLowerCase()) || day;
    setExpandedDays(prev => ({ ...prev, [dayKey]: true }));
    const targetId = `recipe-${dayKey}-${mealType}`;
    // Wait a tick so the meal block exists in the DOM after expanding
    const t = setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightKey(targetId);
        setTimeout(() => setHighlightKey(null), 2200);
      }
      onFocusHandled?.();
    }, 60);
    return () => clearTimeout(t);
  }, [focusTarget, onFocusHandled]);

  // Sort days so today is first
  const sortedDays = [...DAYS.slice(DAYS.indexOf(today)), ...DAYS.slice(0, DAYS.indexOf(today))];
  // Map to plan keys (plan uses Monday-Sunday)
  const planDays = Object.keys(plan);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {sortedDays.map(day => {
        // Match day name to plan keys
        const planDay = planDays.find(d => d.toLowerCase() === day.toLowerCase()) || day;
        const isOpen = expandedDays[day] || false;
        const isToday = day === today;

        return (
          <div key={day} style={{
            ...recipeCard,
            position: 'relative',
            overflow: 'hidden',
            borderTop: isToday ? '3px solid #8db84a' : recipeCard.border,
          }}>
            <CornerPins />
            {/* Day header — clickable dropdown */}
            <div
              onClick={() => toggleDay(day)}
              style={{
                padding: '14px 28px 10px',
                borderBottom: isOpen ? '3px double #c4a060' : 'none',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 100%)',
                cursor: 'pointer',
                userSelect: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
                <h2 style={{
                  fontFamily: 'Pinyon Script, cursive',
                  fontSize: 44,
                  fontWeight: 400,
                  color: '#3a2a18',
                  textShadow: '1px 1px 0px rgba(180,150,100,0.4)',
                }}>
                  {day}
                </h2>
                {isToday && (
                  <span style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#6b8e3a',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2em',
                  }}>
                    Today
                  </span>
                )}
              </div>
              <span style={{
                fontSize: 18,
                color: '#9a8a72',
                transition: 'transform 0.2s',
                transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}>▼</span>
            </div>

            {isOpen && (
              <div style={{ padding: '4px 28px 20px' }}>
                {MEAL_TYPES.map(type => {
                  const meal = plan[planDay]?.[type];
                  if (!meal) return null;

                  const id = `recipe-${day}-${type}`;
                  const isHighlighted = highlightKey === id;
                  return (
                    <div id={id} key={type} style={{
                      padding: '16px 12px',
                      borderBottom: type !== 'dinner' ? '1px solid #3a5a8a' : 'none',
                      borderRadius: 6,
                      transition: 'background-color 0.6s ease, box-shadow 0.6s ease',
                      background: isHighlighted ? 'rgba(255, 208, 68, 0.32)' : 'transparent',
                      boxShadow: isHighlighted ? '0 0 0 2px rgba(255,208,68,0.8), 0 0 24px rgba(255,208,68,0.5)' : 'none',
                      scrollMarginTop: 90,
                    }}>
                      {/* Meal type label */}
                      <p style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        fontSize: 18,
                        fontWeight: 700,
                        color: '#8a6a40',
                        textTransform: 'uppercase',
                        letterSpacing: '0.35em',
                        marginBottom: 2,
                      }}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </p>

                      {/* Recipe name */}
                      <h3 style={{
                        fontFamily: 'Pinyon Script, cursive',
                        fontSize: 30,
                        fontWeight: 400,
                        color: '#2a1a0e',
                        marginBottom: 14,
                      }}>
                        {meal.name}
                      </h3>

                      {/* Ingredients */}
                      <div style={{ marginBottom: 14 }}>
                        <p style={{
                          fontFamily: 'Cormorant Garamond, serif',
                          fontSize: 15,
                          fontWeight: 700,
                          color: '#8a6a40',
                          textTransform: 'uppercase',
                          letterSpacing: '0.3em',
                          marginBottom: 8,
                        }}>
                          Ingredients
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                          {meal.ingredients.map((ing, i) => (
                            <div key={i} style={{
                              padding: '5px 0',
                              borderBottom: '1px solid #3a5a8a',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'baseline',
                            }}>
                              <span style={{
                                fontFamily: 'Cormorant Garamond, serif',
                                fontSize: 18,
                                fontWeight: 700,
                                color: ing.onSale ? '#6b8e3a' : '#3a2a18',
                              }}>
                                {ing.onSale ? '★ ' : '○ '}{ing.name}
                              </span>
                              {ing.measure && (
                                <span style={{
                                  fontFamily: 'Cormorant Garamond, serif',
                                  fontSize: 17,
                                  fontWeight: 700,
                                  fontStyle: 'italic',
                                  color: '#6b5a48',
                                }}>
                                  {ing.measure}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Instructions */}
                      {meal.instructions && meal.instructions.length > 0 && (
                        <div>
                          <p style={{
                            fontFamily: 'Cormorant Garamond, serif',
                            fontSize: 15,
                            fontWeight: 700,
                            color: '#8a6a40',
                            textTransform: 'uppercase',
                            letterSpacing: '0.3em',
                            marginBottom: 8,
                          }}>
                            Instructions
                          </p>
                          <ol style={{
                            paddingLeft: 22,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0,
                          }}>
                            {meal.instructions.map((step, i) => (
                              <li key={i} style={{
                                fontFamily: 'Cormorant Garamond, serif',
                                fontSize: 15,
                                fontWeight: 600,
                                color: '#3a2a18',
                                lineHeight: 1.6,
                                padding: '4px 0',
                                borderBottom: '1px solid #3a5a8a',
                              }}>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
