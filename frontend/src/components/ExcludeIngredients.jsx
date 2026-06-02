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
  { id: 'set-and-forget', label: 'Set & Forget' },
  { id: 'comfort-food', label: 'Comfort Food' },
  { id: 'american-classic', label: 'American Classic' },
  { id: 'asian', label: 'Asian' },
  { id: 'thai', label: 'Thai-inspired' },
  { id: 'indian', label: 'Indian-inspired' },
  { id: 'mexican', label: 'Mexican' },
  { id: 'italian', label: 'Italian' },
  { id: 'mediterranean', label: 'Mediterranean' },
  { id: 'greek', label: 'Greek' },
  { id: 'barbecue', label: 'Barbecue' },
  { id: 'veggie', label: 'Vegetarian' },
  { id: 'garden-fresh', label: 'Garden Fresh' },
  { id: 'keto', label: 'Keto' },
];

// Shared styling for the collapsible Customize panels. Extracted so all
// sections stay visually identical and there's a single place to tweak them.
const PANEL_STYLE = { background: 'rgba(160,140,100,0.15)', borderRadius: 6, overflow: 'hidden', border: '1px solid rgba(240,232,218,0.2)', borderTop: '2px solid rgba(255,255,255,0.18)', borderBottom: '3px solid rgba(0,0,0,0.45)', boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.12), inset 0 -2px 4px rgba(0,0,0,0.15), 6px 8px 18px rgba(0,0,0,0.45), 10px 14px 30px rgba(0,0,0,0.25), 2px 3px 6px rgba(0,0,0,0.3)', opacity: 0.85 };
const PANEL_HEADER_STYLE = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '16px 20px', cursor: 'pointer', userSelect: 'none', background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 50%, transparent 100%)', borderBottom: '1px solid rgba(0,0,0,0.15)', transition: 'background 0.2s' };
const PANEL_BADGE_STYLE = { fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', color: 'rgba(240, 232, 218, 0.85)', textShadow: '1px 2px 3px rgba(0,0,0,0.6)' };
const PANEL_CARET_STYLE = { fontSize: 18, color: '#eaa221', fontWeight: 'bold', textShadow: '0 0 6px rgba(234,162,33,0.4), 1px 1px 2px rgba(0,0,0,0.4)', transition: 'transform 0.2s' };

// Collapsible panel used for every Customize section. `icon` is a distinct
// emoji per section so the page is scannable; `badge` is an optional count.
function Section({ icon, title, badge = null, expanded, onToggle, pad = '0 18px 18px', children }) {
  return (
    <div style={PANEL_STYLE}>
      <div onClick={onToggle} style={PANEL_HEADER_STYLE}>
        <h3 style={{ ...sectionHeader, fontSize: 34, color: '#eaa221', marginBottom: 0, display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <span aria-hidden="true" style={{ fontSize: 26, lineHeight: 1, flexShrink: 0, filter: 'drop-shadow(1px 2px 2px rgba(0,0,0,0.45))' }}>{icon}</span>
          <span>{title}</span>
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {badge && <span style={PANEL_BADGE_STYLE}>{badge}</span>}
          <span style={{ ...PANEL_CARET_STYLE, transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
        </div>
      </div>
      {expanded && <div style={{ padding: pad }}>{children}</div>}
    </div>
  );
}

export default function ExcludeIngredients({ ingredients, excluded, onToggle, onHand = [], onToggleOnHand, onFavoritesChange, customRecipes = [], onAddCustomRecipe, onRemoveCustomRecipe, excludedRecipes = [], onRestoreRecipe, selectedCuisines = [], onToggleCuisine, savedMenus = [], onLoadSavedMenu, onDeleteSavedMenu, recipePool = null }) {
  const [searchExclude, setSearchExclude] = useState('');
  const [searchFav, setSearchFav] = useState('');
  const [searchOnHand, setSearchOnHand] = useState('');
  const [showRecipeForm, setShowRecipeForm] = useState(false);
  const [newRecipe, setNewRecipe] = useState({ name: '', mealType: 'dinner', prepMinutes: 15, ingredientSearch: '', selectedIngredients: [], instructionText: '', instructions: [] });
  const [expandedSections, setExpandedSections] = useState({});
  const toggleSection = (key) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  // Cuisine preview modal — null = closed; otherwise the cuisine object being shown.
  const [previewCuisine, setPreviewCuisine] = useState(null);
  const [expandedPoolRecipe, setExpandedPoolRecipe] = useState(null);
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

  // Build the recipe list for the cuisine preview modal — pulls from the pool
  // (already filtered by the user's other settings) and groups by meal type.
  const previewRecipes = (() => {
    if (!previewCuisine || !recipePool) return null;
    const out = { breakfast: [], lunch: [], dinner: [] };
    for (const mt of ['breakfast', 'lunch', 'dinner']) {
      const list = recipePool[mt] || [];
      out[mt] = list.filter(r => (r.tags || []).includes(previewCuisine.id));
    }
    out.total = out.breakfast.length + out.lunch.length + out.dinner.length;
    return out;
  })();
  const previewSelected = previewCuisine ? selectedCuisines.includes(previewCuisine.id) : false;

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
      <Section icon="🌍" title="Cuisine Preferences" badge={selectedCuisines.length > 0 ? `${selectedCuisines.length} selected` : null} expanded={expandedSections.cuisines} onToggle={() => toggleSection('cuisines')} pad="0 18px 18px">
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
                  onClick={() => setPreviewCuisine(c)}
                  style={{
                    ...tagBase,
                    background: selected ? 'rgba(234,162,33,0.85)' : 'rgba(60,40,30,0.7)',
                    border: selected ? '1px solid rgba(234,162,33,0.95)' : '1px solid rgba(200,170,120,0.35)',
                    color: selected ? '#1a0e06' : '#faf5e8',
                    fontSize: 15,
                  }}
                  title={`Preview ${c.label} recipes`}
                >
                  {selected ? '✓ ' : '+ '}{c.label}
                </button>
              );
            })}
          </div>
      </Section>

      {/* === SKIP INGREDIENTS SECTION === */}
      <Section icon="🚫" title="Skip Ingredients" badge={excluded.length > 0 ? `${excluded.length} excluded` : null} expanded={expandedSections.skip} onToggle={() => toggleSection('skip')} pad="0 18px 16px">
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
      </Section>

      {/* === ON HAND SECTION === */}
      <Section icon="🧺" title="In My Kitchen" badge={onHand.length > 0 ? `${onHand.length} on hand` : null} expanded={expandedSections.onhand} onToggle={() => toggleSection('onhand')} pad="0 18px 16px">
        <p style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12,
          color: 'rgba(240, 232, 218, 0.85)',
          marginBottom: 12,
          lineHeight: 1.5,
          textShadow: '1px 2px 3px rgba(0,0,0,0.6)',
        }}>
          Recipes using these get pinned to the top of your menu so they get used up before they spoil — and they won't count toward your shopping list total.
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
      </Section>

      {/* === FAVORITES SECTION === */}
      <Section icon="⭐" title="Favorite Ingredients" badge={favorites.length > 0 ? `${favorites.length} in rotation` : null} expanded={expandedSections.favs} onToggle={() => toggleSection('favs')} pad="0 18px 16px">
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
      </Section>

      {/* === MY RECIPES SECTION === */}
      <Section icon="📖" title="My Recipes" badge={customRecipes.length > 0 ? `${customRecipes.length} saved` : null} expanded={expandedSections.recipes} onToggle={() => toggleSection('recipes')} pad="0 18px 16px">
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
      </Section>

      {/* === NEVER AGAIN SECTION === */}
      <Section icon="✋" title="Never Again" badge={excludedRecipes.length > 0 ? `${excludedRecipes.length} hidden` : null} expanded={expandedSections.neverAgain} onToggle={() => toggleSection('neverAgain')} pad="0 18px 18px">
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
      </Section>

      {/* === SAVED MENUS SECTION === */}
      <Section icon="📋" title="Saved Menus" badge={savedMenus.length > 0 ? `${savedMenus.length} saved` : null} expanded={expandedSections.savedMenus} onToggle={() => toggleSection('savedMenus')} pad="0 18px 18px">
          <p style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 12,
            color: 'rgba(240, 232, 218, 0.85)',
            marginBottom: 12,
            lineHeight: 1.5,
            textShadow: '1px 2px 3px rgba(0,0,0,0.6)',
          }}>
            Menus you saved from the Plan tab. <strong style={{ color: '#eaa221' }}>Load</strong> rebuilds the week with today's sale prices applied.
          </p>
          {savedMenus.length === 0 ? (
            <p style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 14,
              fontStyle: 'italic',
              color: 'rgba(240, 232, 218, 0.55)',
              textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
            }}>
              Nothing saved yet. Generate a plan you like, then hit <strong>♥ Save This Menu</strong> on the Plan tab.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {savedMenus.map(menu => {
                const savedDate = new Date(menu.savedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                return (
                  <div key={menu.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: '12px 14px',
                    background: 'rgba(40,28,16,0.6)',
                    border: '1px solid rgba(200,170,120,0.28)',
                    borderRadius: 6,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 1px 2px 4px rgba(0,0,0,0.3)',
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{
                        fontFamily: 'Caveat, cursive',
                        fontSize: 24,
                        fontWeight: 700,
                        color: '#faf5e8',
                        textShadow: '1px 2px 3px rgba(0,0,0,0.5)',
                        lineHeight: 1.1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={menu.name}
                      >
                        {menu.name}
                      </div>
                      <div style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 11,
                        color: 'rgba(240,232,218,0.6)',
                        marginTop: 2,
                        textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
                      }}>
                        Saved {savedDate}{typeof menu.weeklyTotal === 'number' ? ` · was $${menu.weeklyTotal.toFixed(2)}` : ''}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => onLoadSavedMenu?.(menu)}
                        style={{
                          background: 'linear-gradient(180deg, #f0e4c8 0%, #ddd0aa 30%, #c8b888 70%, #b0a070 100%)',
                          color: '#2a1a0e',
                          fontFamily: 'Amatic SC, cursive',
                          fontWeight: 700,
                          fontSize: 20,
                          padding: '6px 16px',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          border: '1px solid rgba(140,120,70,0.6)',
                          borderTop: '1px solid rgba(255,245,220,0.7)',
                          borderBottom: '2px solid rgba(80,60,30,0.6)',
                          borderRadius: 6,
                          cursor: 'pointer',
                          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), 1px 2px 4px rgba(0,0,0,0.3)',
                          textShadow: '0 1px 0 rgba(255,255,255,0.3)',
                        }}
                      >
                        Load
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete "${menu.name}"? This can't be undone.`)) {
                            onDeleteSavedMenu?.(menu.id);
                          }
                        }}
                        title="Delete this saved menu"
                        style={{
                          background: 'rgba(60,40,30,0.7)',
                          color: '#c8a8a0',
                          border: '1px solid rgba(180,120,100,0.3)',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 14,
                          fontWeight: 700,
                          padding: '6px 12px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
      </Section>
      </div>

      {/* === CUISINE PREVIEW MODAL === */}
      {previewCuisine && (
        <div
          onClick={() => { setPreviewCuisine(null); setExpandedPoolRecipe(null); }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(20, 12, 4, 0.65)',
            backdropFilter: 'blur(2px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 640,
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto',
              background: 'linear-gradient(180deg, #f0e4c8 0%, #e0d2a8 100%)',
              border: '1px solid rgba(140,110,70,0.45)',
              borderTop: '2px solid rgba(255,245,220,0.6)',
              borderBottom: '3px solid rgba(60,40,20,0.5)',
              borderRadius: 10,
              boxShadow: '0 20px 50px rgba(0,0,0,0.55), 0 8px 16px rgba(0,0,0,0.35)',
              padding: '22px 26px 18px',
              position: 'relative',
            }}
          >
            <button
              onClick={() => { setPreviewCuisine(null); setExpandedPoolRecipe(null); }}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: 10,
                right: 12,
                background: 'transparent',
                border: 'none',
                fontSize: 24,
                fontWeight: 700,
                color: '#5a3a1c',
                cursor: 'pointer',
                lineHeight: 1,
                padding: 4,
              }}
            >
              ✕
            </button>
            <h3 style={{
              fontFamily: 'Pinyon Script, cursive',
              fontSize: 44,
              color: '#3a2a18',
              lineHeight: 1.0,
              marginBottom: 4,
              textShadow: '1px 1px 0 rgba(180,150,100,0.4)',
            }}>
              {previewCuisine.label}
            </h3>
            <p style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12,
              fontWeight: 700,
              color: '#8a6a40',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: 14,
            }}>
              {!recipePool
                ? 'Generate a plan first to see the recipe pool'
                : previewRecipes && previewRecipes.total > 0
                  ? `${previewRecipes.total} recipes in your current pool`
                  : 'No recipes match — try clearing other filters'}
            </p>

            {previewRecipes && ['breakfast', 'lunch', 'dinner'].map(mt => {
              const list = previewRecipes[mt] || [];
              if (list.length === 0) return null;
              return (
                <div key={mt} style={{ marginBottom: 14 }}>
                  <p style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#8a6a40',
                    textTransform: 'uppercase',
                    letterSpacing: '0.3em',
                    marginBottom: 4,
                  }}>
                    {mt} · {list.length}
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {list.map(r => {
                      const isExpanded = expandedPoolRecipe === r.id;
                      return (
                        <li key={r.id} style={{
                          borderBottom: '1px solid rgba(138,106,64,0.25)',
                        }}>
                          <div
                            onClick={() => setExpandedPoolRecipe(isExpanded ? null : r.id)}
                            style={{
                              fontFamily: 'Cormorant Garamond, serif',
                              fontSize: 16,
                              fontWeight: 600,
                              color: '#3a2a18',
                              padding: '5px 0',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'baseline',
                              gap: 8,
                              cursor: 'pointer',
                            }}
                          >
                            <span style={{ textDecoration: 'underline', textDecorationColor: 'rgba(138,106,64,0.35)', textUnderlineOffset: 2 }}>{r.name}</span>
                            <span style={{ display: 'flex', alignItems: 'baseline', gap: 8, flex: 'none' }}>
                              {typeof r.cost === 'number' && (
                                <span style={{
                                  fontFamily: 'JetBrains Mono, monospace',
                                  fontSize: 12,
                                  color: '#8a6a40',
                                }}>
                                  ${r.cost.toFixed(2)}
                                </span>
                              )}
                              <span style={{ fontSize: 12, color: '#8a6a40', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                            </span>
                          </div>
                          {isExpanded && (
                            <div style={{
                              padding: '8px 0 12px',
                              animation: 'fadeIn 0.15s ease',
                            }}>
                              <div style={{ display: 'flex', gap: 12, marginBottom: 8, flexWrap: 'wrap' }}>
                                {r.prepMinutes && (
                                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: '#5a4a30', background: 'rgba(58,42,24,0.1)', padding: '2px 7px', borderRadius: 4 }}>
                                    {r.prepMinutes} min
                                  </span>
                                )}
                                {(r.tags || []).slice(0, 4).map(tag => (
                                  <span key={tag} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: '#6b5a48', background: 'rgba(58,42,24,0.07)', padding: '2px 7px', borderRadius: 4 }}>
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              {r.ingredients && r.ingredients.length > 0 && (
                                <div style={{ marginBottom: 8 }}>
                                  <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 12, fontWeight: 700, color: '#8a6a40', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 3 }}>Ingredients</p>
                                  {r.ingredients.filter(ing => ing.name !== 'Salt' && ing.name !== 'Pepper').map((ing, i) => (
                                    <div key={i} style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 14, color: '#3a2a18', padding: '2px 0', display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                                      <span style={{ fontWeight: 600 }}>{ing.name}</span>
                                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#8a6a40', flex: 'none' }}>{ing.measure}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                              {r.instructions && r.instructions.length > 0 && (
                                <div>
                                  <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 12, fontWeight: 700, color: '#8a6a40', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 3 }}>Instructions</p>
                                  <ol style={{ margin: 0, paddingLeft: 18 }}>
                                    {r.instructions.map((step, i) => (
                                      <li key={i} style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 14, color: '#3a2a18', padding: '2px 0', lineHeight: 1.4 }}>{step}</li>
                                    ))}
                                  </ol>
                                </div>
                              )}
                              {r.suggestedSide && (
                                <p style={{ fontFamily: 'Caveat, cursive', fontSize: 15, color: '#6b5a48', marginTop: 8, fontStyle: 'italic' }}>
                                  Pairs with: {r.suggestedSide}
                                </p>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 16, paddingTop: 14, borderTop: '1px dashed rgba(138,106,64,0.45)' }}>
              <button
                onClick={() => {
                  onToggleCuisine?.(previewCuisine.id);
                  setPreviewCuisine(null);
                }}
                style={{
                  background: previewSelected
                    ? 'rgba(80, 30, 30, 0.85)'
                    : 'linear-gradient(180deg, #f0e4c8 0%, #c8b888 100%)',
                  color: previewSelected ? '#faf5e8' : '#2a1a0e',
                  fontFamily: 'Amatic SC, cursive',
                  fontWeight: 700,
                  fontSize: 22,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding: '8px 20px',
                  border: '1px solid rgba(140,110,70,0.5)',
                  borderTop: '1px solid rgba(255,245,220,0.5)',
                  borderBottom: '2px solid rgba(60,40,20,0.5)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.25), 1px 2px 4px rgba(0,0,0,0.3)',
                  textShadow: previewSelected ? '1px 1px 2px rgba(0,0,0,0.6)' : '0 1px 0 rgba(255,255,255,0.3)',
                }}
              >
                {previewSelected ? 'Remove from Filter' : 'Filter by This Cuisine'}
              </button>
              <button
                onClick={() => setPreviewCuisine(null)}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(138,106,64,0.45)',
                  color: '#5a3a1c',
                  fontFamily: 'Caveat, cursive',
                  fontSize: 20,
                  fontWeight: 500,
                  padding: '6px 14px',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
