import { useState, useEffect } from 'react';
import MealPlan from './components/MealPlan.jsx';
import GroceryList from './components/GroceryList.jsx';
import BudgetBar from './components/BudgetBar.jsx';
import LocalDeals from './components/LocalDeals.jsx';
import ExcludeIngredients from './components/ExcludeIngredients.jsx';
import Recipes from './components/Recipes.jsx';
import { CornerPins } from './components/Pushpin.jsx';

const API = '/api';

// State grocery tax rates (2026) — many states exempt groceries entirely
const STATE_GROCERY_TAX = {
  'AL': 0.04,    // Alabama
  'AR': 0.065,   // Arkansas
  'HI': 0.04,    // Hawaii
  'ID': 0.06,    // Idaho
  'IL': 0.01,    // Illinois (reduced rate)
  'KS': 0.04,    // Kansas (reduced from 6.5%)
  'MS': 0.07,    // Mississippi
  'MO': 0.03,    // Missouri (local tax only, state eliminated Jan 2025)
  'OK': 0.045,   // Oklahoma
  'SD': 0.042,   // South Dakota
  'TN': 0.04,    // Tennessee (reduced rate on groceries)
  'UT': 0.03,    // Utah (reduced rate)
  'VA': 0.01,    // Virginia (reduced rate)
  // All other states: 0% grocery tax (exempt)
};

function getGroceryTaxRate(stateAbbr) {
  return STATE_GROCERY_TAX[stateAbbr] || 0;
}

export default function App() {
  const [tab, setTab] = useState('plan');
  const [recipeFocus, setRecipeFocus] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [groceryData, setGroceryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [zip, setZip] = useState('64683');
  const [budget, setBudget] = useState(70);
  const [servings, setServings] = useState(1);
  const [salesData, setSalesData] = useState(null);
  const [showNoStoresModal, setShowNoStoresModal] = useState(false);
  const [noStoresDismissedKey, setNoStoresDismissedKey] = useState(null);
  const [skippedMeals, setSkippedMeals] = useState({});
  const [replacements, setReplacements] = useState({});
  const [recipePool, setRecipePool] = useState(null);
  const [variation, setVariation] = useState(0);
  const [difficulty, setDifficulty] = useState('all');
  const [allIngredients, setAllIngredients] = useState([]);
  const [excluded, setExcluded] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mealmaker_excluded')) || []; } catch { return []; }
  });
  const [onHand, setOnHand] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mealmaker_onhand')) || []; } catch { return []; }
  });
  const [radius, setRadius] = useState(30);
  const [preferredStore, setPreferredStore] = useState('');
  const [cityState, setCityState] = useState('Trenton, MO');
  const [stateAbbr, setStateAbbr] = useState('MO');
  const groceryTaxRate = getGroceryTaxRate(stateAbbr);
  const withTax = (amount) => Math.round(amount * (1 + groceryTaxRate) * 100) / 100;
  const [excludeSearch, setExcludeSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [onHandSearch, setOnHandSearch] = useState('');
  const [showOnHandSuggestions, setShowOnHandSuggestions] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mealmaker_favorites')) || []; } catch { return []; }
  });
  const [favSearch, setFavSearch] = useState('');
  const [showFavSuggestions, setShowFavSuggestions] = useState(false);
  const [customRecipes, setCustomRecipes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mealmaker_custom_recipes')) || []; } catch { return []; }
  });

  // No useEffect for localStorage — save directly in handlers to avoid StrictMode double-write
  useEffect(() => {
    // Clear stale city immediately so it never shows an old location while typing a new ZIP.
    setCityState('');
    if (zip.length !== 5) return;
    let cancelled = false;
    fetch(`https://api.zippopotam.us/us/${zip}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (cancelled) return;
        if (data && data.places && data.places[0]) {
          const p = data.places[0];
          setCityState(`${p['place name']}, ${p['state abbreviation']}`);
          setStateAbbr(p['state abbreviation']);
        } else {
          setCityState('ZIP not found');
        }
      })
      .catch(() => { if (!cancelled) setCityState(''); });
    return () => { cancelled = true; };
  }, [zip]);

  async function fetchPlan(refresh, excludeList, onHandList, favList, varNum) {
    const ex = excludeList || excluded;
    const oh = onHandList || onHand;
    const fav = favList || favorites;
    const v = varNum !== undefined ? varNum : variation;
    const excludeParam = ex.length ? `&exclude=${ex.join(',')}` : '';
    const onHandParam = oh.length ? `&onhand=${oh.join(',')}` : '';
    const favParam = fav.length ? `&favorites=${fav.join(',')}` : '';
    const customParam = customRecipes.length ? `&custom=${encodeURIComponent(JSON.stringify(customRecipes))}` : '';
    const storeParam = preferredStore ? `&store=${encodeURIComponent(preferredStore)}` : '';
    const diffParam = difficulty !== 'all' ? `&difficulty=${difficulty}` : '';
    setLoading(true);
    setError(null);
    setSkippedMeals({});
    setReplacements({});
    // Clear stale sales — the MY STORE dropdown and no-stores banner derive from it.
    setSalesData(null);
    try {
      const [planRes, grocRes, salesRes] = await Promise.all([
        fetch(`${API}/meal-plan?zip=${zip}&budget=${budget}&servings=${servings}&refresh=${refresh}&radius=${radius}&variation=${v}${excludeParam}${onHandParam}${favParam}${customParam}${storeParam}${diffParam}`),
        fetch(`${API}/grocery-list?zip=${zip}&servings=${servings}&radius=${radius}&variation=${v}${excludeParam}${onHandParam}${favParam}${customParam}${storeParam}${diffParam}`),
        fetch(`${API}/sales?zip=${zip}&refresh=${refresh}&radius=${radius}`)
      ]);
      if (!planRes.ok) throw new Error('Failed to load meal plan');
      setPlanData(await planRes.json());
      const grocJson = await grocRes.json();
      console.log('GROCERY URL:', `${API}/grocery-list?zip=${zip}&servings=${servings}${excludeParam}${onHandParam}`);
      console.log('GROCERY DATA:', JSON.stringify(grocJson.items.filter(i => i.onHand)));
      console.log('GROCERY onHandCount:', grocJson.onHandCount, 'estimatedTotal:', grocJson.estimatedTotal);
      setGroceryData(grocJson);
      setSalesData(await salesRes.json());
      // Fetch recipe pool for skip/replace (filtered by current difficulty)
      fetch(`${API}/recipes?zip=${zip}&servings=${servings}&radius=${radius}${excludeParam}${favParam}${customParam}${diffParam}`)
        .then(r => r.json()).then(setRecipePool).catch(() => {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetch(`${API}/ingredients`)
      .then(r => r.json())
      .then(data => { console.log('INGREDIENTS LOADED:', data.length); setAllIngredients(data); })
      .catch(err => console.error('INGREDIENTS FAILED:', err));
    // Pre-fetch sales so store dropdown is populated immediately
    fetch(`${API}/sales?zip=${zip}&refresh=false&radius=${radius}`)
      .then(r => r.json())
      .then(data => { if (!salesData) setSalesData(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    // Don't trigger fetches for partial ZIPs mid-typing — only when complete.
    if (zip.length !== 5) return;
    fetchPlan(false, excluded, onHand, favorites);
  }, [budget, servings, preferredStore, difficulty, zip, radius]);

  // Pop the no-stores notification when sales data confirms no grocery stores in radius.
  // Only re-opens if zip+radius changes (avoids re-spamming on unrelated state updates).
  useEffect(() => {
    if (!salesData?.noStoresInRadius) return;
    const key = `${zip}-${radius}`;
    if (noStoresDismissedKey !== key) setShowNoStoresModal(true);
  }, [salesData, zip, radius, noStoresDismissedKey]);

  // Changing skill level should clear stale replacements/skips so the new plan shows through.
  useEffect(() => {
    setReplacements({});
    setSkippedMeals({});
  }, [difficulty]);

  // Recompute grocery list when meals are skipped, using plan data
  function getFilteredGroceryData() {
    if (!effectivePlan || !groceryData) return groceryData;
    if (Object.keys(replacements).length === 0) return groceryData;

    const aggregated = {};
    const onHandNames = new Set(onHand.map(id => allIngredients.find(i => i.id === id)?.name).filter(Boolean));

    for (const [day, meals] of Object.entries(effectivePlan)) {
      for (const mealType of ['breakfast', 'lunch', 'dinner']) {
        if (skippedMeals[`${day}-${mealType}`]) continue;
        const meal = meals[mealType];
        if (!meal) continue;
        for (const ing of meal.ingredients) {
          if (!aggregated[ing.name]) {
            aggregated[ing.name] = { name: ing.name, totalCost: 0, onSale: ing.onSale, saleStore: ing.saleStore || null, onHand: onHandNames.has(ing.name) };
          }
          aggregated[ing.name].totalCost += ing.cost;
        }
      }
    }

    const list = Object.values(aggregated)
      .map(i => ({ ...i, totalCost: Math.round(i.totalCost * 100) / 100 }))
      .sort((a, b) => b.totalCost - a.totalCost);
    const toBuyTotal = list.filter(i => !i.onHand).reduce((sum, i) => sum + i.totalCost, 0);

    return { ...groceryData, items: list, estimatedTotal: Math.round(toBuyTotal * 100) / 100 };
  }

  function getFilteredWeeklyTotal() {
    if (!effectivePlan) return 0;
    let total = 0;
    for (const [day, meals] of Object.entries(effectivePlan)) {
      for (const mealType of ['breakfast', 'lunch', 'dinner']) {
        if (skippedMeals[`${day}-${mealType}`]) continue;
        const meal = meals[mealType];
        if (meal) total += meal.cost;
      }
    }
    return Math.round(total * 100) / 100;
  }

  // Build effective plan with replacements applied
  const effectivePlan = planData ? (() => {
    if (Object.keys(replacements).length === 0) return planData.plan;
    const plan = {};
    for (const [day, meals] of Object.entries(planData.plan)) {
      plan[day] = { ...meals };
      for (const type of ['breakfast', 'lunch', 'dinner']) {
        const key = `${day}-${type}`;
        if (replacements[key]) {
          plan[day] = { ...plan[day], [type]: replacements[key] };
        }
      }
      // Recalc day total
      plan[day].dayTotal = ['breakfast', 'lunch', 'dinner'].reduce((sum, t) => sum + (plan[day][t]?.cost || 0), 0);
    }
    return plan;
  })() : null;

  const filteredGroceryData = getFilteredGroceryData();
  const filteredWeeklyTotal = Object.keys(skippedMeals).length > 0 ? getFilteredWeeklyTotal() : (effectivePlan ? Object.values(effectivePlan).reduce((sum, d) => sum + (d.dayTotal || 0), 0) : 0);

  useEffect(() => {
    const close = () => { setShowSuggestions(false); setShowOnHandSuggestions(false); setShowFavSuggestions(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const dismissNoStoresModal = () => {
    setShowNoStoresModal(false);
    setNoStoresDismissedKey(`${zip}-${radius}`);
  };

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* No-stores-in-radius modal — opens automatically when the lookup returns empty */}
      {showNoStoresModal && (
        <div
          onClick={dismissNoStoresModal}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(15,8,3,0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            animation: 'fadeUp 0.25s ease both',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            role="alertdialog"
            aria-labelledby="no-stores-title"
            style={{
              maxWidth: 480,
              width: '100%',
              padding: '32px 36px',
              background: 'linear-gradient(180deg, #f0e4c8 0%, #ddd0aa 35%, #c8b888 75%, #b0a070 100%)',
              border: '2px solid #6b4e2e',
              borderTop: '3px solid rgba(255,245,220,0.7)',
              borderBottom: '5px solid rgba(80,60,30,0.7)',
              borderRadius: 12,
              boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.4), 0 12px 30px rgba(0,0,0,0.55), 0 24px 60px rgba(0,0,0,0.4), 0 40px 90px rgba(0,0,0,0.25)',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <button
              onClick={dismissNoStoresModal}
              aria-label="Close"
              style={{
                position: 'absolute',
                top: 10,
                right: 14,
                background: 'transparent',
                border: 'none',
                fontSize: 24,
                fontWeight: 700,
                color: '#5a3a1a',
                cursor: 'pointer',
                lineHeight: 1,
                padding: 4,
              }}
            >×</button>
            <div style={{ fontSize: 56, marginBottom: 6, filter: 'drop-shadow(2px 3px 4px rgba(0,0,0,0.4))' }}>⚠️</div>
            <h2 id="no-stores-title" style={{
              fontFamily: 'Pinyon Script, cursive',
              fontSize: 42,
              fontWeight: 400,
              color: '#3a2010',
              marginBottom: 10,
              textShadow: '1px 1px 0px rgba(255,245,220,0.5), 2px 3px 4px rgba(0,0,0,0.2)',
            }}>
              No stores nearby
            </h2>
            <p style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontSize: 18,
              fontWeight: 600,
              color: '#3a2a18',
              lineHeight: 1.55,
              marginBottom: 24,
              padding: '0 6px',
            }}>
              We couldn&rsquo;t find any grocery stores within <strong>{salesData?.radiusMiles ?? radius} miles</strong> of {cityState ? `${cityState} ` : ''}<strong>{zip}</strong>.
              <br />
              Try increasing your <strong>Shopping Radius</strong> to pull in stores from further out.
            </p>
            <button
              onClick={dismissNoStoresModal}
              style={{
                background: 'linear-gradient(180deg, #f0e4c8 0%, #ddd0aa 20%, #c8b888 50%, #b0a070 80%, #9a8a5e 100%)',
                color: '#2a1a0e',
                fontFamily: 'Amatic SC, cursive',
                fontWeight: 700,
                padding: '12px 30px',
                fontSize: 24,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                border: '1px solid rgba(140,120,70,0.6)',
                borderTop: '2px solid rgba(255,245,220,0.7)',
                borderBottom: '3px solid rgba(80,60,30,0.7)',
                borderRadius: 8,
                cursor: 'pointer',
                boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.4), 4px 6px 12px rgba(0,0,0,0.4), 1px 2px 4px rgba(0,0,0,0.3)',
                textShadow: '0 1px 0 rgba(255,255,255,0.3)',
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Gradient accent bar */}
      <div style={{
        height: 3,
        background: 'linear-gradient(90deg, var(--amber) 0%, var(--sage) 50%, var(--terra) 100%)'
      }} />

      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--chalk-border)',
        padding: 'clamp(20px, 4vw, 36px) clamp(16px, 4vw, 40px) clamp(16px, 3vw, 32px)',
        position: 'relative',
        overflow: 'hidden',
        background: '#2a1a0e',
      }}>
        {/* Saturated background image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/tomatoes-header.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'saturate(1.6) contrast(1.1)',
          opacity: 0.8,
        }} />
        {/* Dark overlay for text legibility */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(30,16,6,0.78) 0%, rgba(30,16,6,0.45) 40%, rgba(30,16,6,0.45) 60%, rgba(30,16,6,0.78) 100%)',
        }} />
        <div className="header-inner" style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, position: 'relative', zIndex: 1 }}>

          {/* Title block */}
          <div style={{ textAlign: 'left', alignSelf: 'flex-start' }}>
            {/* "MEAL MAKER" + "FRESH IDEAS!" */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'clamp(16px, 3vw, 32px)' }}>
              <h1 style={{
                fontFamily: 'Pinyon Script, cursive',
                fontSize: 'clamp(85px, 14vw, 155px)',
                fontWeight: 400,
                color: '#faf5e8',
                lineHeight: 0.95,
                letterSpacing: '0.02em',
                textTransform: 'none',
                WebkitTextStroke: '1px rgba(250,245,232,0.3)',
                paintOrder: 'stroke fill',
                textShadow: [
                  '0 -2px 0px rgba(255,255,255,0.15)',
                  '2px 2px 0px #2a1608',
                  '4px 4px 0px #1a0e06',
                  '6px 6px 0px #120a04',
                  '8px 8px 0px rgba(10, 4, 0, 0.95)',
                  '10px 10px 0px rgba(5, 2, 0, 0.9)',
                  '12px 12px 2px rgba(0, 0, 0, 0.85)',
                  '16px 16px 6px rgba(0, 0, 0, 0.75)',
                  '22px 22px 14px rgba(0, 0, 0, 0.6)',
                  '32px 32px 26px rgba(0, 0, 0, 0.45)',
                  '46px 48px 42px rgba(0, 0, 0, 0.32)',
                  '0 0 30px rgba(255,230,150,0.15)',
                  '0 0 60px rgba(0, 0, 0, 0.4)',
                  '0 0 120px rgba(0, 0, 0, 0.25)',
                ].join(', '),
              }}>
                Meal Maker
              </h1>
              <span style={{
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 'clamp(24px, 4vw, 36px)',
                fontWeight: 700,
                color: '#f0e8da',
                letterSpacing: '0.38em',
                textTransform: 'uppercase',
                textShadow: [
                  '2px 2px 0px #1a0e06',
                  '4px 4px 0px rgba(10,4,0,0.9)',
                  '6px 6px 0px rgba(5,2,0,0.8)',
                  '8px 8px 4px rgba(0,0,0,0.75)',
                  '12px 12px 10px rgba(0,0,0,0.6)',
                  '18px 18px 18px rgba(0,0,0,0.45)',
                  '26px 26px 30px rgba(0,0,0,0.3)',
                  '0 0 30px rgba(0,0,0,0.5)',
                ].join(', '),
                marginLeft: 'clamp(20px, 4vw, 60px)',
                marginTop: 'clamp(24px, 4vw, 40px)',
              }}>
                Fresh Ideas
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 4 }}>
                  <span style={{ fontSize: 60, filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.6))', opacity: 0.5, transform: 'scaleX(-1)', display: 'inline-block' }}>🌿</span>
                  <span style={{ fontSize: 60, filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.6))', transform: 'scale(-1, -1)', display: 'inline-block' }}>🌿</span>
                  <span style={{ fontSize: 60, filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.6))', opacity: 0.5 }}>🌿</span>
                </div>
              </span>
            </div>

            {/* Location — city name from zip lookup */}
            <p style={{
              fontFamily: 'Cormorant Garamond, serif',
              fontStyle: 'normal',
              fontSize: 26,
              fontWeight: 600,
              color: '#fef3a0',
              marginTop: 10,
              letterSpacing: '0.04em',
              textShadow: '0 0 12px rgba(254,243,160,0.3), 0 0 24px rgba(254,243,160,0.15)',
            }}>
              <span style={{ fontFamily: 'Pinyon Script, cursive', fontSize: 30, color: '#ffffff', textShadow: '3px 3px 0px #1a0e06, 6px 6px 2px rgba(0,0,0,0.8), 0 0 20px rgba(0,0,0,0.4)' }}>Searching in:</span> {cityState ? `${cityState} · ${zip}` : zip}
            </p>

            {/* Rural-area warning when no grocery stores are within the selected radius */}
            {salesData?.noStoresInRadius && (
              <div style={{
                marginTop: 6,
                padding: '10px 18px',
                background: 'linear-gradient(180deg, rgba(180,60,40,0.92) 0%, rgba(140,40,25,0.92) 100%)',
                border: '1px solid rgba(255,200,140,0.4)',
                borderRadius: 6,
                color: '#fff4d8',
                fontFamily: 'Cormorant Garamond, serif',
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: '0.03em',
                textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
                boxShadow: '0 4px 10px rgba(0,0,0,0.45), 0 8px 20px rgba(0,0,0,0.3)',
                display: 'inline-block',
              }}>
                ⚠ No grocery stores within {salesData.radiusMiles ?? radius} miles — increase your <strong>Shopping Radius</strong> to find deals
              </div>
            )}

            {/* Taglines — ALL CAPS, wide tracking, marigold with tomato bullets */}
            <div style={{ display: 'flex', marginTop: 10, alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              {['RECIPE PLANNER', 'DEAL-FINDER', 'BUDGET CALCULATOR'].map((tag, i) => (
                <span key={tag} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {(
                    <svg width="36" height="36" viewBox="0 0 32 36" style={{ flexShrink: 0, filter: 'drop-shadow(0 0 6px rgba(255,230,150,0.7)) drop-shadow(0 0 12px rgba(255,220,120,0.4)) drop-shadow(0 0 20px rgba(255,210,100,0.2))' }}>
                      {/* stem */}
                      <path d="M16 3 C16 3, 14 6, 16 7.5 C18 6, 16 3, 16 3Z" fill="#3a5a18" />
                      {/* calyx leaves */}
                      <path d="M11 7 Q8 3, 9 1" fill="none" stroke="#2e4e14" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M21 7 Q24 3, 23 1" fill="none" stroke="#2e4e14" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M14 6 Q12 2, 14 1" fill="none" stroke="#3a5a18" strokeWidth="1.4" strokeLinecap="round" />
                      <path d="M18 6 Q20 2, 18 1" fill="none" stroke="#3a5a18" strokeWidth="1.4" strokeLinecap="round" />
                      <path d="M10 8 Q7 5, 6 4" fill="none" stroke="#2e4e14" strokeWidth="1.2" strokeLinecap="round" />
                      <path d="M22 8 Q25 5, 26 4" fill="none" stroke="#2e4e14" strokeWidth="1.2" strokeLinecap="round" />
                      {/* body — deep heirloom */}
                      <path d="M16 8 C10 8, 4 12, 4 18 C4 24, 8 28, 12 28 C13 28, 14 27.5, 15 27 C15.5 28, 16.5 28, 17 27 C18 27.5, 19 28, 20 28 C24 28, 28 24, 28 18 C28 12, 22 8, 16 8Z" fill="#6e1a1a" />
                      {/* color variation — darker, more intense */}
                      <ellipse cx="10" cy="17" rx="4.5" ry="6" fill="#8a2820" opacity="0.8" transform="rotate(-10,10,17)" />
                      <ellipse cx="21" cy="18" rx="4" ry="5.5" fill="#4e1828" opacity="0.7" transform="rotate(8,21,18)" />
                      <ellipse cx="16" cy="20" rx="5" ry="4" fill="#7a3028" opacity="0.6" />
                      <ellipse cx="14" cy="14" rx="3" ry="4" fill="#aa3828" opacity="0.5" transform="rotate(-15,14,14)" />
                      {/* deep shadow at bottom */}
                      <ellipse cx="16" cy="26" rx="8" ry="3" fill="#2a0808" opacity="0.4" />
                      {/* ribbing — more defined */}
                      <path d="M12 9 Q11 18, 12 27" fill="none" stroke="#4a1010" strokeWidth="0.8" opacity="0.6" />
                      <path d="M20 9 Q21 18, 20 27" fill="none" stroke="#4a1010" strokeWidth="0.8" opacity="0.6" />
                      <path d="M16 8 Q16 18, 16 27.5" fill="none" stroke="#4a1010" strokeWidth="0.7" opacity="0.5" />
                      <path d="M8 12 Q9 20, 9 26" fill="none" stroke="#4a1010" strokeWidth="0.5" opacity="0.3" />
                      <path d="M24 12 Q23 20, 23 26" fill="none" stroke="#4a1010" strokeWidth="0.5" opacity="0.3" />
                      {/* highlight — brighter for contrast */}
                      <ellipse cx="11" cy="13" rx="3.5" ry="2.5" fill="white" opacity="0.18" transform="rotate(-25,11,13)" />
                      <ellipse cx="19" cy="12" rx="2" ry="1.5" fill="white" opacity="0.1" transform="rotate(15,19,12)" />
                    </svg>
                  )}
                  <span style={{
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 26,
                    fontWeight: 700,
                    color: '#f5a30a',
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    textShadow: '0 0 6px rgba(255,230,150,0.7), 0 0 14px rgba(255,220,120,0.4), 0 0 24px rgba(255,210,100,0.2), 2px 3px 4px rgba(0,0,0,0.8), 4px 6px 12px rgba(0,0,0,0.6)',
                  }}>
                    {tag}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Controls panel */}
          <div className="controls-panel" style={{
            position: 'relative',
            background: `
              url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='warp'><feTurbulence type='fractalNoise' baseFrequency='0.9 0.04' numOctaves='2' seed='7' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncR type='linear' slope='0.45' intercept='0'/><feFuncG type='linear' slope='0.38' intercept='0'/><feFuncB type='linear' slope='0.25' intercept='0'/><feFuncA type='linear' slope='0.55' intercept='0'/></feComponentTransfer></filter><rect width='220' height='220' filter='url(#warp)'/></svg>`)}"),
              url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='weft'><feTurbulence type='fractalNoise' baseFrequency='0.04 0.9' numOctaves='2' seed='12' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncR type='linear' slope='0.45' intercept='0'/><feFuncG type='linear' slope='0.38' intercept='0'/><feFuncB type='linear' slope='0.25' intercept='0'/><feFuncA type='linear' slope='0.5' intercept='0'/></feComponentTransfer></filter><rect width='220' height='220' filter='url(#weft)'/></svg>`)}"),
              url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='slub'><feTurbulence type='fractalNoise' baseFrequency='0.012 0.018' numOctaves='3' seed='3' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncR type='linear' slope='0.3' intercept='0'/><feFuncG type='linear' slope='0.22' intercept='0'/><feFuncB type='linear' slope='0.14' intercept='0'/><feFuncA type='linear' slope='0.35' intercept='0'/></feComponentTransfer></filter><rect width='300' height='300' filter='url(#slub)'/></svg>`)}"),
              linear-gradient(180deg, rgba(82,64,46,0.5) 0%, rgba(62,48,34,0.5) 50%, rgba(46,34,22,0.5) 100%)
            `,
            borderTop: '1px solid rgba(225,200,155,0.55)',
            borderLeft: '1px solid rgba(205,180,135,0.35)',
            borderRight: '1px solid rgba(20,12,4,0.45)',
            borderBottom: '3px solid rgba(15,8,3,0.75)',
            borderRadius: 10,
            padding: '18px 22px',
            display: 'flex',
            gap: 16,
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            justifyContent: 'center',
            boxShadow: [
              'inset 0 2px 0 rgba(255,245,215,0.28)',
              'inset 0 -6px 14px rgba(0,0,0,0.4)',
              'inset 0 0 26px rgba(30,18,8,0.28)',
              '0 3px 5px rgba(0,0,0,0.4)',
              '0 8px 16px rgba(0,0,0,0.4)',
              '0 16px 30px rgba(0,0,0,0.25)',
            ].join(', '),
          }}>
            <CornerPins />
            {[
              { label: 'ZIP\nCODE', value: zip, setter: e => setZip(e.target.value), type: 'text', maxLength: 5, width: 72 },
              { label: 'SHOPPING\nRADIUS', value: null, type: 'select', width: 90 },
              { label: 'BUDGET $', value: budget, setter: e => setBudget(parseFloat(e.target.value)), type: 'number', min: 20, max: 1000, step: 5, width: 78 },
              { label: 'SERVINGS', value: servings, setter: e => setServings(parseInt(e.target.value)), type: 'number', min: 1, max: 15, width: 58 },
            ].map(({ label, value, setter, width, type, ...rest }) => (
              <label key={label} style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center', justifyContent: 'flex-start', borderRight: '1px solid rgba(180,160,120,0.25)', paddingRight: 16 }}>
                <span style={{
                  fontFamily: 'Amatic SC, cursive',
                  fontSize: 26,
                  fontWeight: 700,
                  color: '#d4c4a0',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  textShadow: '2px 3px 4px rgba(0,0,0,0.8), 4px 6px 12px rgba(0,0,0,0.6), 0 0 20px rgba(0,0,0,0.4)',
                  whiteSpace: 'pre-line',
                  lineHeight: 1,
                  textAlign: 'center',
                  minHeight: 52,
                  display: 'flex',
                  alignItems: 'flex-start',
                }}>
                  {label}
                </span>
                {type === 'select' ? (
                  <select
                    value={radius}
                    onChange={e => setRadius(parseInt(e.target.value))}
                    style={{
                      width,
                      background: '#6b5438',
                      border: '1px solid rgba(180,160,120,0.35)',
                      borderRadius: 6,
                      padding: '10px 8px',
                      color: '#ffffff',
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: 20,
                      fontWeight: 700,
                      outline: 'none',
                      cursor: 'pointer',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
                    }}
                  >
                    {[5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100].map(mi => (
                      <option key={mi} value={mi}>{mi} mi</option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={value}
                    onChange={setter}
                    type={type}
                    {...rest}
                    style={{
                      width,
                      background: '#6b5438',
                      border: '1px solid rgba(180,160,120,0.35)',
                      borderRadius: 6,
                      padding: '10px 10px',
                      color: '#ffffff',
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: 22,
                      fontWeight: 700,
                      outline: 'none',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
                    }}
                  />
                )}
              </label>
            ))}
            {/* Preferred store selector */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center', justifyContent: 'flex-start', borderRight: '1px solid rgba(180,160,120,0.25)', paddingRight: 16 }}>
              <span style={{
                fontFamily: 'Amatic SC, cursive',
                fontSize: 26,
                fontWeight: 700,
                color: '#d4c4a0',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textShadow: '2px 3px 4px rgba(0,0,0,0.8), 4px 6px 12px rgba(0,0,0,0.6), 0 0 20px rgba(0,0,0,0.4)',
                whiteSpace: 'pre-line',
                lineHeight: 1,
                textAlign: 'center',
                minHeight: 52,
                display: 'flex',
                alignItems: 'flex-start',
              }}>
                MY{'\n'}STORE
              </span>
              <select
                value={preferredStore}
                onChange={e => { setPreferredStore(e.target.value); }}
                style={{
                  width: 160,
                  background: '#6b5438',
                  border: '1px solid rgba(180,160,120,0.35)',
                  borderRadius: 6,
                  padding: '10px 8px',
                  color: '#ffffff',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 20,
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
                }}
              >
                <option value="">All Stores</option>
                {salesData?.sales && [...new Set(salesData.sales.map(s => s.store))].sort().map(store => {
                  const dealCount = salesData.sales.filter(s => s.store === store).length;
                  return <option key={store} value={store}>{store} ({dealCount} deals)</option>;
                })}
              </select>
            </label>

            {/* Skill level selector */}
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center', justifyContent: 'flex-start', borderRight: '1px solid rgba(180,160,120,0.25)', paddingRight: 16 }}>
              <span style={{
                fontFamily: 'Amatic SC, cursive',
                fontSize: 26,
                fontWeight: 700,
                color: '#d4c4a0',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                textShadow: '2px 3px 4px rgba(0,0,0,0.8), 4px 6px 12px rgba(0,0,0,0.6), 0 0 20px rgba(0,0,0,0.4)',
                whiteSpace: 'pre-line',
                lineHeight: 1,
                textAlign: 'center',
                minHeight: 52,
                display: 'flex',
                alignItems: 'flex-start',
              }}>
                SKILL{'\n'}LEVEL
              </span>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value)}
                style={{
                  width: 140,
                  background: '#6b5438',
                  border: '1px solid rgba(180,160,120,0.35)',
                  borderRadius: 6,
                  padding: '10px 8px',
                  color: '#ffffff',
                  fontFamily: 'Cormorant Garamond, serif',
                  fontSize: 20,
                  fontWeight: 700,
                  outline: 'none',
                  cursor: 'pointer',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
                }}
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
            </label>

            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
              <button
                onClick={() => { setVariation(0); fetchPlan(true, excluded, onHand, favorites, 0); }}
                disabled={loading}
                style={{
                  background: 'linear-gradient(180deg, #f0e4c8 0%, #ddd0aa 20%, #c8b888 50%, #b0a070 80%, #9a8a5e 100%)',
                  color: '#2a1a0e',
                  fontFamily: 'Amatic SC, cursive',
                  fontWeight: 700,
                  padding: '14px 34px',
                  fontSize: 26,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  border: '1px solid rgba(140,120,70,0.6)',
                  borderTop: '2px solid rgba(255,245,220,0.7)',
                  borderBottom: '3px solid rgba(80,60,30,0.7)',
                  borderRadius: 8,
                  boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.2), 4px 6px 14px rgba(0,0,0,0.5), 8px 10px 24px rgba(0,0,0,0.3), 1px 2px 4px rgba(0,0,0,0.35)',
                  textShadow: '0 1px 0 rgba(255,255,255,0.3)',
                }}
              >
                {loading ? '···' : 'Make A Menu!'}
              </button>
              <button
                onClick={() => {
                  const next = variation + 1;
                  setVariation(next);
                  fetchPlan(false, excluded, onHand, favorites, next);
                }}
                disabled={loading || !planData}
                style={{
                  background: 'linear-gradient(180deg, rgba(100,80,55,0.9) 0%, rgba(70,55,38,0.95) 40%, rgba(50,38,25,0.9) 100%)',
                  color: '#d4c4a0',
                  border: '1px solid rgba(180,160,120,0.3)',
                  borderTop: '1px solid rgba(200,180,140,0.25)',
                  borderBottom: '2px solid rgba(30,20,10,0.5)',
                  fontFamily: 'Amatic SC, cursive',
                  fontWeight: 700,
                  padding: '12px 24px',
                  fontSize: 26,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 2px rgba(0,0,0,0.15), 3px 5px 10px rgba(0,0,0,0.4), 1px 2px 4px rgba(0,0,0,0.3)',
                  textShadow: '1px 2px 3px rgba(0,0,0,0.5)',
                }}
              >
                Change It Up!
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div style={{
        position: 'relative',
        backgroundImage: 'url(/herbs-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}>
        {/* 60% fade overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(139, 115, 85, 0.35)',
          pointerEvents: 'none',
        }} />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: 'clamp(16px, 3vw, 32px) clamp(12px, 2vw, 24px)', position: 'relative', zIndex: 1 }}>

        {error && (
          <div style={{
            background: 'var(--terra-bg)',
            border: '1px solid rgba(232,112,90,0.3)',
            borderRadius: 8,
            padding: '13px 18px',
            marginBottom: 24,
            color: 'var(--terra)',
            fontSize: 16,
            fontWeight: 700,
            fontFamily: 'JetBrains Mono, monospace',
          }}>
            {error} — Make sure the backend is running on port 3001.
          </div>
        )}

        {loading && !planData && (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{
              fontFamily: 'Amatic SC, cursive',
              fontSize: 36,
              fontWeight: 700,
              color: 'var(--chalk-muted)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textShadow: '2px 3px 4px rgba(0,0,0,0.8), 4px 6px 12px rgba(0,0,0,0.6), 0 0 20px rgba(0,0,0,0.4)',
            }}>
              Building your plan ···
            </p>
          </div>
        )}

        {planData && (
          <div style={{ animation: 'fadeUp 0.4s ease both' }}>
            <BudgetBar weeklyTotal={withTax(effectivePlan ? Object.values(effectivePlan).reduce((sum, d) => sum + (d.dayTotal || 0), 0) : 0)} budget={budget} taxRate={groceryTaxRate} />

            {/* Tabs */}
            <div className="tabs-row" role="tablist" onKeyDown={e => {
              const tabs = ['preferences', 'plan', 'recipes', 'grocery', 'deals'];
              const idx = tabs.indexOf(tab);
              if (e.key === 'ArrowRight') { e.preventDefault(); setTab(tabs[(idx + 1) % tabs.length]); }
              if (e.key === 'ArrowLeft') { e.preventDefault(); setTab(tabs[(idx - 1 + tabs.length) % tabs.length]); }
            }} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              marginBottom: 28,
              borderBottom: '1px solid var(--chalk-border)',
              paddingBottom: 0,
            }}>
              {[['preferences', 'Customize'], ['plan', 'The Plan'], ['recipes', 'My Recipes'], ['grocery', 'Shopping List'], ['deals', 'Deals Near Me']].map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  tabIndex={tab === key ? 0 : -1}
                  aria-selected={tab === key}
                  onClick={() => setTab(key)}
                  style={{
                    background: tab === key
                      ? 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 60%, transparent 100%)'
                      : 'transparent',
                    color: tab === key ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                    border: tab === key ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent',
                    borderBottom: tab === key ? '4px solid #ffd044' : '4px solid transparent',
                    borderTop: tab === key ? '1px solid rgba(255,208,68,0.3)' : '1px solid transparent',
                    padding: '10px 16px',
                    marginRight: 12,
                    marginBottom: -1,
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 26,
                    fontWeight: 700,
                    borderRadius: tab === key ? '6px 6px 0 0' : 0,
                    boxShadow: tab === key
                      ? [
                          'inset 0 2px 0 rgba(255,255,255,0.18)',
                          'inset 0 -1px 0 rgba(0,0,0,0.28)',
                          '0 -3px 10px rgba(255,208,68,0.22)',
                          '2px 0 6px rgba(0,0,0,0.28)',
                          '-2px 0 6px rgba(0,0,0,0.28)',
                          '0 6px 14px rgba(0,0,0,0.4)',
                          '0 12px 26px rgba(0,0,0,0.26)',
                        ].join(', ')
                      : 'none',
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    transition: 'color 0.2s, border-color 0.2s, text-shadow 0.2s',
                    textShadow: tab === key
                      ? [
                          '0 0 8px rgba(255,208,68,0.45)',
                          '0 0 20px rgba(255,208,68,0.22)',
                          '2px 2px 0px rgba(0,0,0,0.85)',
                          '4px 4px 0px rgba(0,0,0,0.75)',
                          '6px 6px 4px rgba(0,0,0,0.65)',
                          '10px 10px 14px rgba(0,0,0,0.45)',
                          '16px 16px 26px rgba(0,0,0,0.28)',
                        ].join(', ')
                      : [
                          '1px 1px 0px rgba(0,0,0,0.75)',
                          '2px 2px 0px rgba(0,0,0,0.55)',
                          '3px 4px 4px rgba(0,0,0,0.45)',
                          '5px 7px 10px rgba(0,0,0,0.32)',
                        ].join(', '),
                  }}
                >
                  {label}
                </button>
              ))}
              <span className="tabs-status" style={{
                marginLeft: 'auto',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 14,
                fontWeight: 600,
                color: 'rgba(240, 232, 218, 0.65)',
                letterSpacing: '0.04em',
                paddingBottom: 10,
                textShadow: '1px 2px 3px rgba(0,0,0,0.4)',
              }}>
                {salesData?.sales?.length > 0
                  ? <><span style={{ fontWeight: 900, color: 'rgba(240, 232, 218, 0.85)' }}>{salesData.sales.length}</span> deals nearby!</>
                  : salesData?.noStoresInRadius
                    ? <>No grocery stores within {salesData.radiusMiles}mi — try a wider radius</>
                    : 'No deals yet'}
                {' · '}Serves: <span style={{ fontWeight: 900, color: 'rgba(240, 232, 218, 0.85)' }}>{planData.servings}</span>
              </span>
            </div>

            {tab === 'plan' && <MealPlan plan={effectivePlan} taxRate={groceryTaxRate} skippedMeals={{}} onMealClick={(day, mealType) => {
              setRecipeFocus({ day, mealType });
              setTab('recipes');
            }} onToggleSkip={(key) => {
              if (!recipePool) return;
              const [day, mealType] = key.split(/-(.+)/);
              const pool = recipePool[mealType] || [];
              // Collect all recipe names currently in use for this meal type
              const usedNames = new Set();
              for (const d of Object.keys(effectivePlan)) {
                const meal = effectivePlan[d]?.[mealType];
                if (meal) usedNames.add(meal.name);
              }
              // Also track previously replaced names so we don't cycle back
              for (const r of Object.values(replacements)) {
                if (r) usedNames.add(r.name);
              }
              // Find next unused recipe
              const replacement = pool.find(r => !usedNames.has(r.name));
              if (replacement) {
                setReplacements(prev => ({ ...prev, [key]: replacement }));
              }
            }} />}
            {tab === 'recipes' && <Recipes plan={effectivePlan} focusTarget={recipeFocus} onFocusHandled={() => setRecipeFocus(null)} />}
            {tab === 'grocery' && filteredGroceryData && (
              <GroceryList
                items={filteredGroceryData.items}
                estimatedTotal={withTax(filteredGroceryData.estimatedTotal)}
                taxRate={groceryTaxRate}
                taxAmount={Math.round(filteredGroceryData.estimatedTotal * groceryTaxRate * 100) / 100}
              />
            )}
            {tab === 'deals' && salesData && (
              <LocalDeals
                sales={salesData.sales}
                zip={zip}
                radiusMiles={salesData.radiusMiles ?? radius}
                noStoresInRadius={salesData.noStoresInRadius}
                scrapedAt={salesData.scrapedAt || salesData.cachedAt}
              />
            )}
            {tab === 'preferences' && allIngredients.length > 0 && (
              <ExcludeIngredients
                key={favorites.join(',') + '|' + onHand.join(',')}
                ingredients={allIngredients}
                excluded={excluded}
                onToggle={(id) => {
                  const next = excluded.includes(id) ? excluded.filter(x => x !== id) : [...excluded, id];
                  setExcluded(next);
                  localStorage.setItem('mealmaker_excluded', JSON.stringify(next));
                  fetchPlan(false, next, onHand, favorites);
                }}
                onHand={onHand}
                onToggleOnHand={(id) => {
                  const next = onHand.includes(id) ? onHand.filter(x => x !== id) : [...onHand, id];
                  setOnHand(next);
                  localStorage.setItem('mealmaker_onhand', JSON.stringify(next));
                  fetchPlan(false, excluded, next, favorites);
                }}
                onFavoritesChange={(newFavs) => {
                  setFavorites(newFavs);
                  fetchPlan(false, excluded, onHand, newFavs);
                }}
                customRecipes={customRecipes}
                onAddCustomRecipe={(recipe) => {
                  const next = [...customRecipes, { ...recipe, id: `custom_${Date.now()}` }];
                  setCustomRecipes(next);
                  localStorage.setItem('mealmaker_custom_recipes', JSON.stringify(next));
                  fetchPlan(false, excluded, onHand, favorites);
                }}
                onRemoveCustomRecipe={(id) => {
                  const next = customRecipes.filter(r => r.id !== id);
                  setCustomRecipes(next);
                  localStorage.setItem('mealmaker_custom_recipes', JSON.stringify(next));
                  fetchPlan(false, excluded, onHand, favorites);
                }}
              />
            )}
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
