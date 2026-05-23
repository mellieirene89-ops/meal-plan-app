import express from 'express';
import cors from 'cors';
import { generateMealPlan, getIngredientList, getAvailableRecipes, populateMealPlanFromIds } from './optimizer.js';
import { getSales } from './scraper.js';

const app = express();
const PORT = 3001;

// Format the aggregated grocery quantity for display.
// Returns null when the unit is too abstract to be useful in a shopping list.
function formatGroceryQty(totalQty, unit) {
  if (!unit || totalQty <= 0) return null;
  if (unit === 'use') return null; // "8 uses of olive oil" doesn't help anyone
  // Countable units (you can't buy half a lemon or a third of a can) round UP
  // to the next whole; fractional display is reserved for measure units like cup/tbsp.
  const COUNTABLE = new Set(['each', 'can', 'head', 'slice', 'bunch', 'block', 'jar', 'packet', 'pack', 'box', 'piece', 'stalk']);
  const n = COUNTABLE.has(unit) ? Math.ceil(totalQty) : totalQty;
  const display = (() => {
    if (n < 0.01) return '0';
    const whole = Math.floor(n);
    const frac = n - whole;
    const FRACS = [[0.25, '1/4'], [0.333, '1/3'], [0.5, '1/2'], [0.666, '2/3'], [0.75, '3/4']];
    for (const [v, lbl] of FRACS) {
      if (Math.abs(frac - v) < 0.05) return whole === 0 ? lbl : `${whole} ${lbl}`;
    }
    if (frac < 0.05) return String(whole);
    if (frac > 0.95) return String(whole + 1);
    return n.toFixed(1).replace(/\.0$/, '');
  })();
  if (unit === 'each') return display; // "12" reads better than "12 each"
  const PLURAL = { cup: 'cups', slice: 'slices', can: 'cans', pack: 'packs', box: 'boxes', block: 'blocks', head: 'heads', bunch: 'bunches', stalk: 'stalks', packet: 'packets', jar: 'jars', serving: 'servings', piece: 'pieces' };
  const u = n === 1 ? unit : (PLURAL[unit] || unit + 's');
  return `${display} ${u}`;
}

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// GET /api/meal-plan?zip=64683&budget=70&servings=1&refresh=false
app.get('/api/meal-plan', async (req, res) => {
  try {
    const zip = req.query.zip || '64683';
    const budget = req.query.budget ? parseFloat(req.query.budget) : null;
    const servings = req.query.servings ? parseInt(req.query.servings) : 1;
    const forceRefresh = req.query.refresh === 'true';

    const radius = req.query.radius ? parseInt(req.query.radius) : 30;
    const exclude = req.query.exclude ? req.query.exclude.split(',') : [];
    const favs = req.query.favorites ? req.query.favorites.split(',') : [];
    const variation = req.query.variation ? parseInt(req.query.variation) : 0;
    let customRecipes = [];
    try { if (req.query.custom) customRecipes = JSON.parse(decodeURIComponent(req.query.custom)); } catch {}
    const storeFilter = req.query.store ? decodeURIComponent(req.query.store) : '';
    const salesData = await getSales(zip, forceRefresh, radius);
    const filteredSales = storeFilter ? salesData.sales.filter(s => s.store === storeFilter) : salesData.sales;
    const onhand = req.query.onhand ? req.query.onhand.split(',') : [];
    const diff = req.query.difficulty || 'all';
    const excludeRecipes = req.query.excludeRecipes ? req.query.excludeRecipes.split(',') : [];
    const cuisines = req.query.cuisines ? req.query.cuisines.split(',') : [];
    // Default true — Change It Up explicitly opts out via respectBudget=false
    const respectBudget = req.query.respectBudget !== 'false';
    // ids={"Monday":{"breakfast":"...","lunch":"...","dinner":"..."},...} — Saved Menus path.
    let savedIds = null;
    try { if (req.query.ids) savedIds = JSON.parse(decodeURIComponent(req.query.ids)); } catch {}
    const plan = savedIds
      ? populateMealPlanFromIds(savedIds, filteredSales, servings, onhand)
      : generateMealPlan(filteredSales, budget, servings, exclude, favs, variation, customRecipes, onhand, diff, excludeRecipes, cuisines, respectBudget);

    res.json({
      ...plan,
      zip,
      radiusMiles: radius,
      salesSource: salesData.scrapedAt || salesData.cachedAt
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sales?zip=64683&refresh=false
app.get('/api/sales', async (req, res) => {
  try {
    const zip = req.query.zip || '64683';
    const forceRefresh = req.query.refresh === 'true';
    const radius = req.query.radius ? parseInt(req.query.radius) : 30;
    const data = await getSales(zip, forceRefresh, radius);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/grocery-list?zip=64683&servings=1&exclude=eggs&onhand=olive_oil,oats
app.get('/api/grocery-list', async (req, res) => {
  try {
    const zip = req.query.zip || '64683';
    const servings = req.query.servings ? parseInt(req.query.servings) : 1;

    const radius = req.query.radius ? parseInt(req.query.radius) : 30;
    const exclude = req.query.exclude ? req.query.exclude.split(',') : [];
    const onhand = req.query.onhand ? req.query.onhand.split(',') : [];
    const favs = req.query.favorites ? req.query.favorites.split(',') : [];
    const variation = req.query.variation ? parseInt(req.query.variation) : 0;
    let customRecipes = [];
    try { if (req.query.custom) customRecipes = JSON.parse(decodeURIComponent(req.query.custom)); } catch {}
    const storeFilter = req.query.store ? decodeURIComponent(req.query.store) : '';
    const salesData = await getSales(zip, false, radius);
    const filteredSales = storeFilter ? salesData.sales.filter(s => s.store === storeFilter) : salesData.sales;
    const diff = req.query.difficulty || 'all';
    const excludeRecipes = req.query.excludeRecipes ? req.query.excludeRecipes.split(',') : [];
    const cuisines = req.query.cuisines ? req.query.cuisines.split(',') : [];
    let savedIds = null;
    try { if (req.query.ids) savedIds = JSON.parse(decodeURIComponent(req.query.ids)); } catch {}
    // Match the meal-plan endpoint's budget logic so the grocery list aggregates
    // the same lineup the user sees in the BudgetBar — previously, the lack of
    // a budget cap here generated a different (more expensive) plan and the
    // grocery total could be 50%+ higher than the BudgetBar weekly total.
    const budget = req.query.budget ? parseFloat(req.query.budget) : null;
    const respectBudget = req.query.respectBudget !== 'false';
    const planData = savedIds
      ? populateMealPlanFromIds(savedIds, filteredSales, servings, onhand)
      : generateMealPlan(filteredSales, budget, servings, exclude, favs, variation, customRecipes, onhand, diff, excludeRecipes, cuisines, respectBudget);

    // Build a set of on-hand ingredient names from IDs, plus a lookup for unit
    const ingredientList = getIngredientList();
    const onHandNames = new Set(
      onhand.map(id => ingredientList.find(i => i.id === id)?.name).filter(Boolean)
    );
    const unitById = Object.fromEntries(ingredientList.map(i => [i.id, i.unit]));

    // Aggregate all ingredients across the week — sum qty and cost per ingredient.
    const aggregated = {};
    for (const day of Object.values(planData.plan)) {
      for (const mealType of ['breakfast', 'lunch', 'dinner']) {
        const meal = day[mealType];
        if (!meal) continue;
        for (const ing of meal.ingredients) {
          const key = ing.id || ing.name;
          if (!aggregated[key]) {
            aggregated[key] = {
              name: ing.name,
              totalCost: 0,
              totalQty: 0,
              unit: unitById[ing.id] || null,
              onSale: ing.onSale,
              saleStore: ing.saleStore || null,
              onHand: onHandNames.has(ing.name),
            };
          }
          aggregated[key].totalCost += ing.cost;
          aggregated[key].totalQty += ing.qty || 0;
        }
      }
    }

    const list = Object.values(aggregated)
      .map(i => ({
        ...i,
        totalCost: Math.round(i.totalCost * 100) / 100,
        // Human-readable "buy this much" string. Hides the count for abstract
        // units ("use", "serving") since "8 uses of olive oil" is unhelpful;
        // shows raw count for "each" (12 eggs reads better than "12 each eggs").
        quantityLabel: formatGroceryQty(i.totalQty, i.unit),
      }))
      .sort((a, b) => b.totalCost - a.totalCost);

    const toBuyItems = list.filter(i => !i.onHand);
    const toBuyTotal = toBuyItems.reduce((sum, i) => sum + i.totalCost, 0);

    res.json({
      items: list,
      estimatedTotal: Math.round(toBuyTotal * 100) / 100,
      fullTotal: Math.round(list.reduce((sum, i) => sum + i.totalCost, 0) * 100) / 100,
      onHandCount: list.filter(i => i.onHand).length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/recipes — all available recipes by type
app.get('/api/recipes', async (req, res) => {
  try {
    const zip = req.query.zip || '64683';
    const servings = req.query.servings ? parseInt(req.query.servings) : 1;
    const radius = req.query.radius ? parseInt(req.query.radius) : 30;
    const exclude = req.query.exclude ? req.query.exclude.split(',') : [];
    const favs = req.query.favorites ? req.query.favorites.split(',') : [];
    let customRecipes = [];
    try { if (req.query.custom) customRecipes = JSON.parse(decodeURIComponent(req.query.custom)); } catch {}
    const excludeRecipes = req.query.excludeRecipes ? req.query.excludeRecipes.split(',') : [];
    const cuisines = req.query.cuisines ? req.query.cuisines.split(',') : [];
    const salesData = await getSales(zip, false, radius);
    res.json(getAvailableRecipes(salesData.sales, servings, exclude, favs, customRecipes, excludeRecipes, cuisines));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ingredients
app.get('/api/ingredients', (req, res) => {
  res.json(getIngredientList());
});

app.listen(PORT, () => {
  console.log(`Meal Plan API running at http://localhost:${PORT}`);
});
