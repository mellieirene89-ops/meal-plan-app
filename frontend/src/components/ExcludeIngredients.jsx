import { useState } from 'react';
import { CornerPins } from './Pushpin.jsx';

const CATEGORY_ORDER = ['protein', 'vegetable', 'carb', 'fat', 'aromatics', 'produce', 'pantry'];
const CATEGORY_LABELS = {
  protein: 'Proteins',
  vegetable: 'Vegetables',
  carb: 'Carbs & Grains',
  fat: 'Oils & Fats',
  aromatics: 'Aromatics',
  produce: 'Produce',
  pantry: 'Pantry',
};

const sectionHeader = {
  fontFamily: 'Amatic SC, cursive',
  fontSize: 26,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  textShadow: '2px 3px 4px rgba(0,0,0,0.6)',
  marginBottom: 8,
};

const tagBase = {
  fontFamily: 'Cormorant Garamond, serif',
  fontSize: 16,
  fontWeight: 700,
  padding: '6px 14px',
  borderRadius: 20,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  borderTop: '1px solid rgba(255,255,255,0.2)',
  borderBottom: '2px solid rgba(0,0,0,0.25)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -1px 2px rgba(0,0,0,0.1), 3px 4px 8px rgba(0,0,0,0.35), 1px 2px 3px rgba(0,0,0,0.2)',
  textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
};

function TomatoBullet({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 28" style={{ flexShrink: 0, filter: 'none' }}>
      <path d="M12 2 C12 2, 10 5, 12 6 C14 5, 12 2, 12 2Z" fill="#3a6020" />
      <path d="M9 4 Q12 3, 15 4" fill="none" stroke="#4a7828" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="12" cy="14" rx="9" ry="8" fill="#c43030" />
      <ellipse cx="9" cy="11" rx="3" ry="2" fill="white" opacity="0.15" transform="rotate(-20,9,11)" />
      <path d="M8 6 Q6 4, 7 3" fill="none" stroke="#3a6020" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M16 6 Q18 4, 17 3" fill="none" stroke="#3a6020" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

const CUISINES = [
  { id: 'comfort-food', label: 'Comfort Food' },
  { id: 'asian', label: 'Asian' },
  { id: 'mexican', label: 'Mexican' },
  { id: 'italian', label: 'Italian' },
  { id: 'barbecue', label: 'Barbecue' },
  { id: 'mediterranean', label: 'Mediterranean' },
  { id: 'veggie', label: 'Vegetarian' },
  { id: 'keto', label: 'Keto' },
];

export default function ExcludeIngredients({ ingredients, excluded, onToggle, onHand = [], onToggleOnHand, onFavoritesChange, customRecipes = [], onAddCustomRecipe, onRemoveCustomRecipe, excludedRecipes = [], onRestoreRecipe, selectedCuisines = [], onToggleCuisine }) {
  const [searchExclude, setSearchExclude] = useState('');
  const [searchFav, setSearchFav] = useState('');
  const [searchOnHand, setSearchOnHand] = useState('');
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [newRecipe, setNewRecipe] = useState({ name: '', mealType: 'dinner', prepMinutes: 15, ingredientSearch: '', selectedIngredients: [], instructionText: '', instructions: [] });
  const [expandedSections, setExpandedSections] = useState({});
  const toggleSection = (key) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mealmaker_favorites')) || []; } catch { return []; }
  });

  const saveFavorite = (id) => {
    setFavorites(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('mealmaker_favorites', JSON.stringify(next));
      if (onFavoritesChange) onFavoritesChange(next);
      return next;
    });
  };

  const byCategory = {};
  for (const ing of ingredients) {
    const cat = ing.category || 'other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(ing);
  }

  const sortedCategories = Object.keys(byCategory).sort(
    (a, b) => (CATEGORY_ORDER.indexOf(a) === -1 ? 99 : CATEGORY_ORDER.indexOf(a))
           - (CATEGORY_ORDER.indexOf(b) === -1 ? 99 : CATEGORY_ORDER.indexOf(b))
  );

  const excludeMatches = searchExclude.length > 0
    ? ingredients.filter(ing =>
        !excluded.includes(ing.id) &&
        ing.name.toLowerCase().includes(searchExclude.toLowerCase())
      )
    : [];

  const favMatches = searchFav.length > 0
    ? ingredients.filter(ing =>
        !favorites.includes(ing.id) &&
        !excluded.includes(ing.id) &&
        ing.name.toLowerCase().includes(searchFav.toLowerCase())
      )
    : [];

  const onHandMatches = searchOnHand.length > 0
    ? ingredients.filter(ing =>
        !onHand.includes(ing.id) &&
        !excluded.includes(ing.id) &&
        ing.name.toLowerCase().includes(searchOnHand.toLowerCase())
      )
    : [];

  return (
    <div style={{
      background: `
        url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'>
          <filter id='weave'>
            <feTurbulence type='turbulence' baseFrequency='0.08 0.08' numOctaves='2' seed='3' stitchTiles='stitch'/>
            <feColorMatrix type='saturate' values='0'/>
            <feComponentTransfer>
              <feFuncA type='linear' slope='0.3' intercept='0'/>
            </feComponentTransfer>
            <feComposite in2='SourceGraphic' operator='over'/>
          </filter>
          <rect width='200' height='200' fill='rgba(80,60,30,0.15)' filter='url(#weave)'/>
        </svg>`)}"),
        url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'>
          <rect width='8' height='8' fill='transparent'/>
          <line x1='0' y1='0' x2='8' y2='0' stroke='rgba(90,65,30,0.12)' stroke-width='1'/>
          <line x1='0' y1='4' x2='8' y2='4' stroke='rgba(70,50,25,0.08)' stroke-width='0.5'/>
          <line x1='0' y1='0' x2='0' y2='8' stroke='rgba(90,65,30,0.12)' stroke-width='1'/>
          <line x1='4' y1='0' x2='4' y2='8' stroke='rgba(70,50,25,0.08)' stroke-width='0.5'/>
        </svg>`)}"),
        url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'>
          <filter id='fiber'>
            <feTurbulence type='fractalNoise' baseFrequency='0.6 0.15' numOctaves='4' seed='7' stitchTiles='stitch'/>
            <feColorMatrix type='saturate' values='0'/>
            <feComponentTransfer>
              <feFuncR type='linear' slope='0.1' intercept='0'/>
              <feFuncG type='linear' slope='0.08' intercept='0'/>
              <feFuncB type='linear' slope='0.05' intercept='0'/>
              <feFuncA type='linear' slope='0.15' intercept='0'/>
            </feComponentTransfer>
          </filter>
          <rect width='300' height='300' filter='url(#fiber)'/>
        </svg>`)}"),
        linear-gradient(180deg, rgba(160,130,80,0.08) 0%, transparent 30%, rgba(120,95,55,0.06) 70%, rgba(100,75,40,0.1) 100%),
        #7a6442
      `.trim(),
      position: 'relative',
      border: '2px solid #5a4830',
      borderRadius: 8,
      padding: '20px 24px',
      marginBottom: 24,
      boxShadow: 'inset 0 2px 0 rgba(255,245,215,0.2), inset 0 -5px 12px rgba(0,0,0,0.3), inset 0 0 26px rgba(50,35,15,0.22), 0 3px 5px rgba(0,0,0,0.4), 0 8px 16px rgba(0,0,0,0.35), 0 16px 30px rgba(0,0,0,0.22)',
    }}>
      <CornerPins />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* === CUISINE PREFERENCES SECTION === */}
      <div style={{ background: 'rgba(160,140,100,0.15)', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(240,232,218,0.2)', borderTop: '2px solid rgba(255,255,255,0.18)', borderBottom: '3px solid rgba(0,0,0,0.45)', boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.12), inset 0 -2px 4px rgba(0,0,0,0.15), 6px 8px 18px rgba(0,0,0,0.45), 10px 14px 30px rgba(0,0,0,0.25), 2px 3px 6px rgba(0,0,0,0.3)', opacity: 0.85 }}>
        <div onClick={() => toggleSection('cuisines')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer', userSelect: 'none', background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)', borderBottom: '1px solid rgba(0,0,0,0.15)', transition: 'background 0.2s' }}>
          <h3 style={{ ...sectionHeader, fontSize: 34, color: '#eaa221', marginBottom: 0 }}>
            🌿 Cuisine Preferences
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {selectedCuisines.length > 0 && (
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                fontWeight: 700,
                color: 'rgba(240, 232, 218, 0.85)',
                textShadow: '1px 2px 3px rgba(0,0,0,0.6)',
              }}>
                {selectedCuisines.length} selected
              </span>
            )}
            <span style={{ fontSize: 18, color: '#eaa221', fontWeight: 'bold', textShadow: '0 0 6px rgba(234,162,33,0.4), 1px 1px 2px rgba(0,0,0,0.4)', transition: 'transform 0.2s', transform: expandedSections.cuisines ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </div>
        </div>
        {expandedSections.cuisines && <div style={{ padding: '0 18px 18px' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            color: 'rgba(240, 232, 218, 0.85)',
            marginBottom: 12,
            lineHeight: 1.5,
            textShadow: '1px 2px 3px rgba(0,0,0,0.6)',
          }}>
            Pick one or more cuisines to narrow the menu pool. Leave all unselected to see every recipe.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {CUISINES.map(c => {
              const selected = selectedCuisines.includes(c.id);
              return (
                <button
                  key={c.id}
                  onClick={() => onToggleCuisine?.(c.id)}
                  style={{
                    ...tagBase,
                    background: selected ? 'rgba(234,162,33,0.85)' : 'rgba(60,40,30,0.7)',
                    border: selected ? '1px solid rgba(234,162,33,0.95)' : '1px solid rgba(200,170,120,0.35)',
                    color: selected ? '#1a0e06' : '#faf5e8',
                    fontSize: 15,
                  }}
                  title={selected ? `Remove ${c.label} filter` : `Include ${c.label} recipes`}
                >
                  {selected ? '✓ ' : '+ '}{c.label}
                </button>
              );
            })}
          </div>
        </div>}
      </div>

      {/* === SKIP INGREDIENTS SECTION === */}
      <div style={{ background: 'rgba(160,140,100,0.15)', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(240,232,218,0.2)', borderTop: '2px solid rgba(255,255,255,0.18)', borderBottom: '3px solid rgba(0,0,0,0.45)', boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.12), inset 0 -2px 4px rgba(0,0,0,0.15), 6px 8px 18px rgba(0,0,0,0.45), 10px 14px 30px rgba(0,0,0,0.25), 2px 3px 6px rgba(0,0,0,0.3)', opacity: 0.85 }}>
        <div onClick={() => toggleSection('skip')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer', userSelect: 'none', background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)', borderBottom: '1px solid rgba(0,0,0,0.15)', transition: 'background 0.2s' }}>
          <h3 style={{ ...sectionHeader, fontSize: 34, color: '#eaa221', marginBottom: 0 }}>
            🌿 Skip these ingredients this week
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {excluded.length > 0 && (
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                fontWeight: 700,
                color: 'rgba(240, 232, 218, 0.85)',
                textShadow: '1px 2px 3px rgba(0,0,0,0.6)',
              }}>
                {excluded.length} excluded
              </span>
            )}
            <span style={{ fontSize: 18, color: '#eaa221', fontWeight: 'bold', textShadow: '0 0 6px rgba(234,162,33,0.4), 1px 1px 2px rgba(0,0,0,0.4)', transition: 'transform 0.2s', transform: expandedSections.skip ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </div>
        </div>
        {expandedSections.skip && <div style={{ padding: '0 18px 16px' }}>
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12,
          color: 'rgba(240, 232, 218, 0.85)',
          marginBottom: 12,
          lineHeight: 1.5,
          textShadow: '1px 2px 3px rgba(0,0,0,0.6)',
        }}>
          Recipes with these ingredients will be removed from your plan.
        </p>

        {/* Search bar for exclusions */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input
            type="text"
            value={searchExclude}
            onChange={e => setSearchExclude(e.target.value)}
            placeholder="Search ingredients to skip"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: 'linear-gradient(180deg, #ffffff 0%, #faf5e8 50%, #f0eade 100%)',
              border: '1px solid rgba(180,160,120,0.4)',
              borderTop: '1px solid rgba(255,255,255,0.6)',
              borderBottom: '2px solid rgba(140,120,80,0.4)',
              borderRadius: 20,
              padding: '10px 16px',
              color: '#3a2a18',
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 14,
              fontWeight: 600,
              outline: 'none',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 2px rgba(0,0,0,0.08), 2px 4px 8px rgba(0,0,0,0.3), 4px 6px 14px rgba(0,0,0,0.15)',
            }}
          />
          {excludeMatches.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              width: '100%',
              background: '#5e4a36',
              border: '1px solid rgba(180,160,120,0.4)',
              borderRadius: 8,
              zIndex: 20,
              maxHeight: 200,
              overflowY: 'auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
              {excludeMatches.map(ing => (
                <div
                  key={ing.id}
                  onClick={() => { onToggle(ing.id); setSearchExclude(''); }}
                  style={{
                    padding: '8px 12px',
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(180,160,120,0.15)',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#6b5640'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ color: 'rgba(240, 232, 218, 0.85)', fontSize: 11, marginRight: 8 }}>{ing.category}</span>
                  {ing.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Currently excluded - removable tags */}
        {excluded.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {excluded.map(id => {
              const ing = ingredients.find(i => i.id === id);
              return (
                <span
                  key={id}
                  onClick={() => onToggle(id)}
                  style={{
                    ...tagBase,
                    background: 'rgba(196, 48, 48, 0.25)',
                    border: '1px solid rgba(196, 48, 48, 0.5)',
                    color: '#ff6a5a',
                  }}
                >
                  ✕ {ing?.name || id}
                </span>
              );
            })}
          </div>
        ) : (
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            color: 'rgba(240, 232, 218, 0.85)',
            fontStyle: 'italic',
            textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
          }}>
            No ingredients skipped — search above to exclude something.
          </p>
        )}
        </div>}
      </div>

      {/* === ON HAND SECTION === */}
      <div style={{ background: 'rgba(160,140,100,0.15)', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(240,232,218,0.2)', borderTop: '2px solid rgba(255,255,255,0.18)', borderBottom: '3px solid rgba(0,0,0,0.45)', boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.12), inset 0 -2px 4px rgba(0,0,0,0.15), 6px 8px 18px rgba(0,0,0,0.45), 10px 14px 30px rgba(0,0,0,0.25), 2px 3px 6px rgba(0,0,0,0.3)', opacity: 0.85 }}>
        <div onClick={() => toggleSection('onhand')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer', userSelect: 'none', background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)', borderBottom: '1px solid rgba(0,0,0,0.15)', transition: 'background 0.2s' }}>
          <h3 style={{ ...sectionHeader, fontSize: 34, color: '#eaa221', marginBottom: 0 }}>
            🌿 Already in my kitchen
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {onHand.length > 0 && (
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                fontWeight: 700,
                color: 'rgba(240, 232, 218, 0.85)',
                textShadow: '1px 2px 3px rgba(0,0,0,0.6)',
              }}>
                {onHand.length} on hand
              </span>
            )}
            <span style={{ fontSize: 18, color: '#eaa221', fontWeight: 'bold', textShadow: '0 0 6px rgba(234,162,33,0.4), 1px 1px 2px rgba(0,0,0,0.4)', transition: 'transform 0.2s', transform: expandedSections.onhand ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </div>
        </div>
        {expandedSections.onhand && <div style={{ padding: '0 18px 16px' }}>
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12,
          color: 'rgba(240, 232, 218, 0.85)',
          marginBottom: 12,
          lineHeight: 1.5,
          textShadow: '1px 2px 3px rgba(0,0,0,0.6)',
        }}>
          These stay in recipes but won't count toward your shopping list total.
        </p>

        {/* Search bar for on-hand */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input
            type="text"
            value={searchOnHand}
            onChange={e => setSearchOnHand(e.target.value)}
            placeholder="Search for ingredients I already have"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: 'linear-gradient(180deg, #ffffff 0%, #faf5e8 50%, #f0eade 100%)',
              border: '1px solid rgba(180,160,120,0.4)',
              borderTop: '1px solid rgba(255,255,255,0.6)',
              borderBottom: '2px solid rgba(140,120,80,0.4)',
              borderRadius: 20,
              padding: '10px 16px',
              color: '#3a2a18',
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 14,
              fontWeight: 600,
              outline: 'none',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 2px rgba(0,0,0,0.08), 2px 4px 8px rgba(0,0,0,0.3), 4px 6px 14px rgba(0,0,0,0.15)',
            }}
          />
          {onHandMatches.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              width: '100%',
              background: '#5e4a36',
              border: '1px solid rgba(180,160,120,0.4)',
              borderRadius: 8,
              zIndex: 20,
              maxHeight: 200,
              overflowY: 'auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
              {onHandMatches.map(ing => (
                <div
                  key={ing.id}
                  onClick={() => { onToggleOnHand(ing.id); setSearchOnHand(''); }}
                  style={{
                    padding: '8px 12px',
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(180,160,120,0.15)',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#6b5640'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ color: 'rgba(240, 232, 218, 0.85)', fontSize: 11, marginRight: 8 }}>{ing.category}</span>
                  {ing.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Currently on hand - removable tags */}
        {onHand.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {onHand.map(id => {
              const ing = ingredients.find(i => i.id === id);
              return (
                <span
                  key={id}
                  onClick={() => onToggleOnHand(id)}
                  style={{
                    ...tagBase,
                    background: 'rgba(26, 107, 58, 0.25)',
                    border: '1px solid rgba(26, 107, 58, 0.5)',
                    color: '#ffffff',
                  }}
                >
                  ✕ {ing?.name || id}
                </span>
              );
            })}
          </div>
        ) : (
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            color: 'rgba(240, 232, 218, 0.85)',
            fontStyle: 'italic',
            textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
          }}>
            No on-hand items yet — search above to add what you already have.
          </p>
        )}
        </div>}
      </div>

      {/* === FAVORITES SECTION === */}
      <div style={{ background: 'rgba(160,140,100,0.15)', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(240,232,218,0.2)', borderTop: '2px solid rgba(255,255,255,0.18)', borderBottom: '3px solid rgba(0,0,0,0.45)', boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.12), inset 0 -2px 4px rgba(0,0,0,0.15), 6px 8px 18px rgba(0,0,0,0.45), 10px 14px 30px rgba(0,0,0,0.25), 2px 3px 6px rgba(0,0,0,0.3)', opacity: 0.85 }}>
        <div onClick={() => toggleSection('favs')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer', userSelect: 'none', background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)', borderBottom: '1px solid rgba(0,0,0,0.15)', transition: 'background 0.2s' }}>
          <h3 style={{ ...sectionHeader, fontSize: 34, color: '#eaa221', marginBottom: 0 }}>
            🌿 Favorite Ingredients
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {favorites.length > 0 && (
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                fontWeight: 700,
                color: 'rgba(240, 232, 218, 0.85)',
                textShadow: '1px 2px 3px rgba(0,0,0,0.6)',
              }}>
                {favorites.length} in rotation
              </span>
            )}
            <span style={{ fontSize: 18, color: '#eaa221', fontWeight: 'bold', textShadow: '0 0 6px rgba(234,162,33,0.4), 1px 1px 2px rgba(0,0,0,0.4)', transition: 'transform 0.2s', transform: expandedSections.favs ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </div>
        </div>
        {expandedSections.favs && <div style={{ padding: '0 18px 16px' }}>
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12,
          color: 'rgba(240, 232, 218, 0.85)',
          marginBottom: 12,
          lineHeight: 1.5,
          textShadow: '1px 2px 3px rgba(0,0,0,0.6)',
        }}>
          These ingredients will be prioritized in your meal plan. They persist across sessions.
        </p>

        {/* Search bar for favorites */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <input
            type="text"
            value={searchFav}
            onChange={e => setSearchFav(e.target.value)}
            placeholder="Search for my favorite ingredients"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: 'linear-gradient(180deg, #ffffff 0%, #faf5e8 50%, #f0eade 100%)',
              border: '1px solid rgba(180,160,120,0.4)',
              borderTop: '1px solid rgba(255,255,255,0.6)',
              borderBottom: '2px solid rgba(140,120,80,0.4)',
              borderRadius: 20,
              padding: '10px 16px',
              color: '#3a2a18',
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 14,
              fontWeight: 600,
              outline: 'none',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 2px rgba(0,0,0,0.08), 2px 4px 8px rgba(0,0,0,0.3), 4px 6px 14px rgba(0,0,0,0.15)',
            }}
          />
          {favMatches.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: 4,
              width: '100%',
              background: '#5e4a36',
              border: '1px solid rgba(180,160,120,0.4)',
              borderRadius: 8,
              zIndex: 20,
              maxHeight: 200,
              overflowY: 'auto',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
              {favMatches.map(ing => (
                <div
                  key={ing.id}
                  onClick={() => { saveFavorite(ing.id); setSearchFav(''); }}
                  style={{
                    padding: '8px 12px',
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#ffffff',
                    cursor: 'pointer',
                    borderBottom: '1px solid rgba(180,160,120,0.15)',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#6b5640'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ color: 'rgba(240, 232, 218, 0.85)', fontSize: 11, marginRight: 8 }}>{ing.category}</span>
                  {ing.name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current favorites - removable tags */}
        {favorites.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {favorites.map(id => {
              const ing = ingredients.find(i => i.id === id);
              return (
                <span
                  key={id}
                  onClick={() => saveFavorite(id)}
                  style={{
                    ...tagBase,
                    background: 'rgba(234, 162, 33, 0.2)',
                    border: '1px solid rgba(234, 162, 33, 0.5)',
                    color: '#ffffff',
                  }}
                >
                  ✕ {ing?.name || id}
                </span>
              );
            })}
          </div>
        ) : (
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            color: 'rgba(240, 232, 218, 0.85)',
            fontStyle: 'italic',
            textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
          }}>
            No favorites yet — search above to add ingredients you love.
          </p>
        )}
        </div>}
      </div>

      {/* === MY RECIPES SECTION === */}
      <div style={{ background: 'rgba(160,140,100,0.15)', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(240,232,218,0.2)', borderTop: '2px solid rgba(255,255,255,0.18)', borderBottom: '3px solid rgba(0,0,0,0.45)', boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.12), inset 0 -2px 4px rgba(0,0,0,0.15), 6px 8px 18px rgba(0,0,0,0.45), 10px 14px 30px rgba(0,0,0,0.25), 2px 3px 6px rgba(0,0,0,0.3)', opacity: 0.85 }}>
        <div onClick={() => toggleSection('recipes')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer', userSelect: 'none', background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)', borderBottom: '1px solid rgba(0,0,0,0.15)', transition: 'background 0.2s' }}>
          <h3 style={{ ...sectionHeader, fontSize: 34, color: '#eaa221', marginBottom: 0 }}>
            🌿 My Recipes
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {customRecipes.length > 0 && (
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                fontWeight: 700,
                color: 'rgba(240, 232, 218, 0.85)',
                textShadow: '1px 2px 3px rgba(0,0,0,0.6)',
              }}>
                {customRecipes.length} saved
              </span>
            )}
            <span style={{ fontSize: 18, color: '#eaa221', fontWeight: 'bold', textShadow: '0 0 6px rgba(234,162,33,0.4), 1px 1px 2px rgba(0,0,0,0.4)', transition: 'transform 0.2s', transform: expandedSections.recipes ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </div>
        </div>
        {expandedSections.recipes && <div style={{ padding: '0 18px 16px' }}>
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12,
          color: 'rgba(240, 232, 218, 0.85)',
          marginBottom: 12,
          lineHeight: 1.5,
          textShadow: '1px 2px 3px rgba(0,0,0,0.6)',
        }}>
          Add your own recipes to the weekly rotation.
        </p>

        {/* Add recipe button / form */}
        {!showRecipeForm ? (
          <button
            onClick={() => setShowRecipeForm(true)}
            style={{
              ...tagBase,
              background: 'rgba(234, 162, 33, 0.2)',
              border: '1px solid rgba(234, 162, 33, 0.5)',
              color: '#ffffff',
              fontSize: 14,
              marginBottom: 12,
            }}
          >
            + Add A Recipe
          </button>
        ) : (
          <div style={{
            background: 'var(--surface-raised)',
            border: '1px solid var(--chalk-border)',
            borderRadius: 8,
            padding: '16px 18px',
            marginBottom: 12,
          }}>
            {/* Recipe name */}
            <input
              type="text"
              value={newRecipe.name}
              onChange={e => setNewRecipe(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Recipe name"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'linear-gradient(180deg, #ffffff 0%, #faf5e8 50%, #f0eade 100%)',
                border: '1px solid rgba(180,160,120,0.4)',
                borderTop: '1px solid rgba(255,255,255,0.6)',
                borderBottom: '2px solid rgba(140,120,80,0.4)',
                borderRadius: 20,
                padding: '10px 16px',
                color: '#3a2a18',
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 14,
                fontWeight: 600,
                outline: 'none',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 2px rgba(0,0,0,0.08), 2px 4px 8px rgba(0,0,0,0.3), 4px 6px 14px rgba(0,0,0,0.15)',
                marginBottom: 8,
              }}
            />

            {/* Meal type + prep time */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <select
                value={newRecipe.mealType}
                onChange={e => setNewRecipe(prev => ({ ...prev, mealType: e.target.value }))}
                style={{
                  flex: 1,
                  background: 'linear-gradient(180deg, #ffffff 0%, #faf5e8 50%, #f0eade 100%)',
                  border: '1px solid rgba(180,160,120,0.4)',
                  borderTop: '1px solid rgba(255,255,255,0.6)',
                  borderBottom: '2px solid rgba(140,120,80,0.4)',
                  borderRadius: 20,
                  padding: '10px 14px',
                  color: '#3a2a18',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 2px rgba(0,0,0,0.08), 2px 4px 8px rgba(0,0,0,0.3), 4px 6px 14px rgba(0,0,0,0.15)',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 14,
                  fontWeight: 600,
                  outline: 'none',
                }}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
              <input
                type="number"
                value={newRecipe.prepMinutes}
                onChange={e => setNewRecipe(prev => ({ ...prev, prepMinutes: parseInt(e.target.value) || 0 }))}
                min={1}
                max={120}
                placeholder="Prep min"
                style={{
                  width: 80,
                  background: 'linear-gradient(180deg, #ffffff 0%, #faf5e8 50%, #f0eade 100%)',
                  border: '1px solid rgba(180,160,120,0.4)',
                  borderTop: '1px solid rgba(255,255,255,0.6)',
                  borderBottom: '2px solid rgba(140,120,80,0.4)',
                  borderRadius: 20,
                  padding: '10px 14px',
                  color: '#3a2a18',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 2px rgba(0,0,0,0.08), 2px 4px 8px rgba(0,0,0,0.3), 4px 6px 14px rgba(0,0,0,0.15)',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 14,
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                color: 'rgba(240, 232, 218, 0.85)',
                alignSelf: 'center',
              }}>min</span>
            </div>

            {/* Ingredient search */}
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <input
                type="text"
                value={newRecipe.ingredientSearch}
                onChange={e => setNewRecipe(prev => ({ ...prev, ingredientSearch: e.target.value }))}
                placeholder="Search ingredients to add"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: '#faf5e8',
                  border: '1px solid rgba(180,160,120,0.35)',
                  borderRadius: 6,
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 14,
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
              {newRecipe.ingredientSearch.length > 0 && (() => {
                const matches = ingredients.filter(ing =>
                  !newRecipe.selectedIngredients.some(s => s.id === ing.id) &&
                  ing.name.toLowerCase().includes(newRecipe.ingredientSearch.toLowerCase())
                );
                return matches.length > 0 ? (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: 4,
                    width: '100%',
                    background: '#5e4a36',
                    border: '1px solid rgba(180,160,120,0.4)',
                    borderRadius: 8,
                    zIndex: 20,
                    maxHeight: 200,
                    overflowY: 'auto',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  }}>
                    {matches.map(ing => (
                      <div
                        key={ing.id}
                        onClick={() => {
                          setNewRecipe(prev => ({
                            ...prev,
                            ingredientSearch: '',
                            selectedIngredients: [...prev.selectedIngredients, { id: ing.id, name: ing.name, qty: 1, measure: '' }],
                          }));
                        }}
                        style={{
                          padding: '8px 12px',
                          fontFamily: 'Cormorant Garamond, serif',
                          fontSize: 14,
                          fontWeight: 600,
                          color: '#ffffff',
                          cursor: 'pointer',
                          borderBottom: '1px solid rgba(180,160,120,0.15)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#6b5640'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <span style={{ color: 'rgba(240, 232, 218, 0.85)', fontSize: 11, marginRight: 8 }}>{ing.category}</span>
                        {ing.name}
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>

            {/* Selected ingredients */}
            {newRecipe.selectedIngredients.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {newRecipe.selectedIngredients.map(ing => (
                  <span
                    key={ing.id}
                    onClick={() => setNewRecipe(prev => ({
                      ...prev,
                      selectedIngredients: prev.selectedIngredients.filter(s => s.id !== ing.id),
                    }))}
                    style={{
                      ...tagBase,
                      background: 'rgba(234, 162, 33, 0.2)',
                      border: '1px solid rgba(234, 162, 33, 0.5)',
                      color: '#ffffff',
                    }}
                  >
                    ✕ {ing.name}
                  </span>
                ))}
              </div>
            )}

            {/* Instructions */}
            <textarea
              value={newRecipe.instructionText}
              onChange={e => setNewRecipe(prev => ({ ...prev, instructionText: e.target.value }))}
              placeholder="Instructions (one step per line)"
              rows={3}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: 'linear-gradient(180deg, #ffffff 0%, #faf5e8 50%, #f0eade 100%)',
                border: '1px solid rgba(180,160,120,0.4)',
                borderTop: '1px solid rgba(255,255,255,0.6)',
                borderBottom: '2px solid rgba(140,120,80,0.4)',
                borderRadius: 20,
                padding: '10px 16px',
                color: '#3a2a18',
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 14,
                fontWeight: 600,
                outline: 'none',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1px 2px rgba(0,0,0,0.08), 2px 4px 8px rgba(0,0,0,0.3), 4px 6px 14px rgba(0,0,0,0.15)',
                resize: 'vertical',
                marginBottom: 10,
              }}
            />

            {/* Save / Cancel */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => {
                  if (!newRecipe.name.trim() || newRecipe.selectedIngredients.length === 0) return;
                  onAddCustomRecipe({
                    name: newRecipe.name.trim(),
                    mealType: newRecipe.mealType,
                    prepMinutes: newRecipe.prepMinutes,
                    ingredients: newRecipe.selectedIngredients,
                    instructions: newRecipe.instructionText.split('\n').map(s => s.trim()).filter(Boolean),
                  });
                  setNewRecipe({ name: '', mealType: 'dinner', prepMinutes: 15, ingredientSearch: '', selectedIngredients: [], instructionText: '', instructions: [] });
                  setShowRecipeForm(false);
                }}
                disabled={!newRecipe.name.trim() || newRecipe.selectedIngredients.length === 0}
                style={{
                  ...tagBase,
                  background: newRecipe.name.trim() && newRecipe.selectedIngredients.length > 0 ? '#3a6020' : '#5e4a36',
                  border: '1px solid rgba(58, 96, 32, 0.5)',
                  color: '#ffffff',
                  fontSize: 14,
                  opacity: newRecipe.name.trim() && newRecipe.selectedIngredients.length > 0 ? 1 : 0.5,
                }}
              >
                Save Recipe
              </button>
              <button
                onClick={() => {
                  setNewRecipe({ name: '', mealType: 'dinner', prepMinutes: 15, ingredientSearch: '', selectedIngredients: [], instructionText: '', instructions: [] });
                  setShowRecipeForm(false);
                }}
                style={{
                  ...tagBase,
                  background: 'rgba(196, 48, 48, 0.2)',
                  border: '1px solid rgba(196, 48, 48, 0.4)',
                  color: '#e05040',
                  fontSize: 14,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Saved custom recipes */}
        {customRecipes.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {customRecipes.map(recipe => (
              <div key={recipe.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--surface-raised)',
                border: '1px solid var(--chalk-border)',
                borderRadius: 8,
                padding: '10px 14px',
              }}>
                <div>
                  <span style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 16,
                    fontWeight: 700,
                    color: '#ffffff',
                  }}>
                    {recipe.name}
                  </span>
                  <span style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 11,
                    color: 'rgba(240, 232, 218, 0.85)',
                    marginLeft: 8,
                  }}>
                    {recipe.mealType} · {recipe.prepMinutes}m · {recipe.ingredients.length} ingredients
                  </span>
                </div>
                <span
                  onClick={() => onRemoveCustomRecipe(recipe.id)}
                  style={{
                    ...tagBase,
                    background: 'rgba(196, 48, 48, 0.25)',
                    border: '1px solid rgba(196, 48, 48, 0.5)',
                    color: '#ff6a5a',
                    fontSize: 12,
                    padding: '4px 8px',
                  }}
                >
                  ✕
                </span>
              </div>
            ))}
          </div>
        ) : (
          !showRecipeForm && (
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12,
              color: 'rgba(240, 232, 218, 0.85)',
              fontStyle: 'italic',
              textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
            }}>
              No custom recipes yet — add your favorites to the rotation.
            </p>
          )
        )}
        </div>}
      </div>

      {/* === NEVER AGAIN SECTION === */}
      <div style={{ background: 'rgba(160,140,100,0.15)', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(240,232,218,0.2)', borderTop: '2px solid rgba(255,255,255,0.18)', borderBottom: '3px solid rgba(0,0,0,0.45)', boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.12), inset 0 -2px 4px rgba(0,0,0,0.15), 6px 8px 18px rgba(0,0,0,0.45), 10px 14px 30px rgba(0,0,0,0.25), 2px 3px 6px rgba(0,0,0,0.3)', opacity: 0.85 }}>
        <div onClick={() => toggleSection('neverAgain')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer', userSelect: 'none', background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)', borderBottom: '1px solid rgba(0,0,0,0.15)', transition: 'background 0.2s' }}>
          <h3 style={{ ...sectionHeader, fontSize: 34, color: '#eaa221', marginBottom: 0 }}>
            🌿 Never Again
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {excludedRecipes.length > 0 && (
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 12,
                fontWeight: 700,
                color: 'rgba(240, 232, 218, 0.85)',
                textShadow: '1px 2px 3px rgba(0,0,0,0.6)',
              }}>
                {excludedRecipes.length} hidden
              </span>
            )}
            <span style={{ fontSize: 18, color: '#eaa221', fontWeight: 'bold', textShadow: '0 0 6px rgba(234,162,33,0.4), 1px 1px 2px rgba(0,0,0,0.4)', transition: 'transform 0.2s', transform: expandedSections.neverAgain ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </div>
        </div>
        {expandedSections.neverAgain && <div style={{ padding: '0 18px 18px' }}>
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            color: 'rgba(240, 232, 218, 0.85)',
            marginBottom: 12,
            lineHeight: 1.5,
            textShadow: '1px 2px 3px rgba(0,0,0,0.6)',
          }}>
            Recipes you've hidden using the <strong style={{ color: '#eaa221' }}>⌀ Never Again</strong> button. They won't appear in any future menu. Click a recipe to bring it back into the rotation.
          </p>
          {excludedRecipes.length === 0 ? (
            <p style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 14,
              fontStyle: 'italic',
              color: 'rgba(240, 232, 218, 0.55)',
              textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
            }}>
              You haven't hidden any recipes yet. Use the <strong>⌀ Never Again</strong> button on any meal card to add it here.
            </p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {excludedRecipes.map(r => (
                <button
                  key={r.id}
                  onClick={() => onRestoreRecipe?.(r.id)}
                  style={{
                    ...tagBase,
                    background: 'rgba(60,40,30,0.85)',
                    border: '1px solid rgba(200,170,120,0.35)',
                    color: '#faf5e8',
                    fontSize: 15,
                  }}
                  title="Restore this recipe to your menu pool."
                >
                  <span style={{ color: '#eaa221', fontSize: 16, fontWeight: 900 }}>+</span> {r.name}
                </button>
              ))}
            </div>
          )}
        </div>}
      </div>
      </div>
    </div>
  );
}
