import express from 'express';
import cors from 'cors';
import { generateMealPlan, getIngredientList, getAvailableRecipes } from './optimizer.js';
import { getSales } from './scraper.js';

const app = express();
const PORT = 3001;

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
    const plan = generateMealPlan(filteredSales, budget, servings, exclude, favs, variation, customRecipes, onhand, diff, excludeRecipes, cuisines, respectBudget);

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
    const planData = generateMealPlan(filteredSales, null, servings, exclude, favs, variation, customRecipes, onhand, diff, excludeRecipes, cuisines);

    // Build a set of on-hand ingredient names from IDs
    const ingredientList = getIngredientList();
    const onHandNames = new Set(
      onhand.map(id => ingredientList.find(i => i.id === id)?.name).filter(Boolean)
    );

    // Aggregate all ingredients across the week
    const aggregated = {};
    for (const day of Object.values(planData.plan)) {
      for (const mealType of ['breakfast', 'lunch', 'dinner']) {
        const meal = day[mealType];
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
