import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];

// Seeded Fisher-Yates shuffle. Same seed produces the same order — the variation
// number is used as the seed so each Change It Up click is a stable reshuffle
// rather than a single-position offset (which buries low-scored recipes for ~90+ clicks).
function seededShuffle(arr, seed) {
  let a = (seed | 0) ^ 0x9e3779b9;
  const rand = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function loadData() {
  const recipes = JSON.parse(readFileSync(join(__dirname, 'recipes.json'), 'utf-8'));
  const ingredients = JSON.parse(readFileSync(join(__dirname, 'ingredients.json'), 'utf-8'));
  return { recipes, ingredients };
}

function buildIngredientMap(ingredients, sales = []) {
  const map = {};
  for (const ing of ingredients) {
    map[ing.id] = { ...ing };
  }
  // Apply sale prices where keywords match
  for (const sale of sales) {
    for (const ing of ingredients) {
      const match = ing.keywords.some(kw =>
        sale.name.toLowerCase().includes(kw.toLowerCase())
      );
      if (match && sale.salePrice < map[ing.id].basePrice) {
        map[ing.id].currentPrice = sale.salePrice;
        map[ing.id].onSale = true;
        map[ing.id].saleName = sale.name;
        map[ing.id].saleStore = sale.store;
      }
    }
    if (!map[Object.keys(map).find(id => map[id].onSale && !map[id].currentPrice)]) {
      // fallback: ensure currentPrice is set to basePrice if not on sale
    }
  }
  // Ensure all ingredients have currentPrice
  for (const id in map) {
    if (!map[id].currentPrice) {
      map[id].currentPrice = map[id].basePrice;
      map[id].onSale = false;
    }
  }
  return map;
}

function calcRecipeCost(recipe, ingredientMap) {
  let cost = 0;
  for (const item of recipe.ingredients) {
    const ing = ingredientMap[item.id];
    if (!ing) continue;
    cost += ing.currentPrice * item.qty;
  }
  return Math.round(cost * 100) / 100;
}

function calcRecipeProtein(recipe, ingredientMap) {
  let protein = 0;
  for (const item of recipe.ingredients) {
    const ing = ingredientMap[item.id];
    if (!ing) continue;
    protein += ing.protein_g_per_unit * item.qty;
  }
  return Math.round(protein);
}

function calcVeggieCount(recipe, ingredientMap) {
  let count = 0;
  for (const item of recipe.ingredients) {
    const ing = ingredientMap[item.id];
    if (ing && ing.category === 'vegetable') count++;
  }
  return count;
}

function scoreRecipe(recipe, ingredientMap, favoriteIds = [], onHandIds = []) {
  const cost = calcRecipeCost(recipe, ingredientMap);
  const protein = calcRecipeProtein(recipe, ingredientMap);
  const veggies = calcVeggieCount(recipe, ingredientMap);
  if (cost === 0) return 0;
  // Boost score if any ingredient is on sale
  const onSaleBonus = recipe.ingredients.some(item => ingredientMap[item.id]?.onSale) ? 1.3 : 1;
  // Boost score for recipes containing favorite ingredients
  const favCount = recipe.ingredients.filter(item => favoriteIds.includes(item.id)).length;
  const favBonus = favCount > 0 ? 1 + (favCount * 0.8) : 1;
  // Boost score for recipes using ingredients already in kitchen
  const onHandCount = recipe.ingredients.filter(item => onHandIds.includes(item.id)).length;
  const onHandBonus = onHandCount > 0 ? 1 + (onHandCount * 0.6) : 1;
  return ((protein * (veggies + 1)) / cost) * onSaleBonus * favBonus * onHandBonus;
}

export function getIngredientList() {
  const { ingredients } = loadData();
  return ingredients.map(i => ({ id: i.id, name: i.name, category: i.category, unit: i.unit }));
}

// Build a meal-plan response from an explicit recipe-id-per-day-per-meal-type map.
// Used by the Saved Menus feature so a saved lineup re-prices itself against
// today's sales (cheaper when an ingredient is on sale, etc.) without picking
// new recipes. Returns the same shape as generateMealPlan.
export function populateMealPlanFromIds(idsByDay = {}, sales = [], servings = 1, onHandIds = []) {
  const { recipes, ingredients } = loadData();
  const ingredientMap = buildIngredientMap(ingredients, sales);
  const byId = Object.fromEntries(recipes.map(r => [r.id, r]));

  const plan = {};
  let weeklyTotal = 0;
  for (const day of DAYS) {
    plan[day] = {};
    let dayTotal = 0;
    const dayIds = idsByDay[day] || {};
    for (const type of MEAL_TYPES) {
      const recipeId = dayIds[type];
      const r = recipeId ? byId[recipeId] : null;
      if (!r) { plan[day][type] = null; continue; }
      const cost = calcRecipeCost(r, ingredientMap) * servings;
      plan[day][type] = {
        id: r.id,
        name: r.name,
        prepMinutes: r.prepMinutes,
        cost,
        protein_g: calcRecipeProtein(r, ingredientMap) * servings,
        veggie_count: calcVeggieCount(r, ingredientMap),
        onSaleIngredients: r.ingredients.filter(it => ingredientMap[it.id]?.onSale).map(it => ingredientMap[it.id].name),
        tags: r.tags,
        instructions: r.instructions || [],
        ingredients: r.ingredients.map(item => ({
          id: item.id,
          name: ingredientMap[item.id]?.name || item.id,
          measure: scaleMeasure(item.measure, servings / BASE_SERVINGS),
          onSale: ingredientMap[item.id]?.onSale || false,
          saleStore: ingredientMap[item.id]?.saleStore || null,
          qty: item.qty * servings, cost: Math.round(ingredientMap[item.id]?.currentPrice * item.qty * servings * 100) / 100,
        })),
      };
      dayTotal += cost;
    }
    plan[day].dayTotal = Math.round(dayTotal * 100) / 100;
    weeklyTotal += dayTotal;
  }
  return {
    plan,
    weeklyTotal: Math.round(weeklyTotal * 100) / 100,
    servings,
    generatedAt: new Date().toISOString(),
    salesApplied: sales.length,
  };
}

export function getAvailableRecipes(sales = [], servings = 1, excludeIds = [], favoriteIds = [], customRecipes = [], excludeRecipeIds = [], selectedCuisines = []) {
  const { recipes: builtInRecipes, ingredients } = loadData();
  const ingredientMap = buildIngredientMap(ingredients, sales);

  const recipes = [...builtInRecipes];
  for (const custom of customRecipes) {
    const mappedIngredients = custom.ingredients.map(ing => {
      const match = ingredients.find(i => i.id === ing.id);
      if (match) return ing;
      const nameMatch = ingredients.find(i => i.name.toLowerCase() === (ing.name || '').toLowerCase());
      return nameMatch ? { ...ing, id: nameMatch.id } : ing;
    }).filter(ing => ingredientMap[ing.id]);
    if (mappedIngredients.length > 0) {
      recipes.push({ id: `custom_${custom.id || Date.now()}`, name: custom.name, mealType: custom.mealType, prepMinutes: custom.prepMinutes || 15, ingredients: mappedIngredients, tags: custom.tags || ['custom'], instructions: custom.instructions || [] });
    }
  }

  const result = {};
  for (const type of MEAL_TYPES) {
    result[type] = recipes
      .filter(r => r.mealType === type)
      .filter(r => !excludeRecipeIds.includes(r.id))
      .filter(r => !selectedCuisines.length || (r.tags || []).some(t => selectedCuisines.includes(t)))
      .filter(r => !excludeIds.length || !r.ingredients.some(item => excludeIds.includes(item.id)))
      .map(r => ({
        id: r.id,
        name: r.name,
        prepMinutes: r.prepMinutes,
        cost: calcRecipeCost(r, ingredientMap) * servings,
        protein_g: calcRecipeProtein(r, ingredientMap) * servings,
        veggie_count: calcVeggieCount(r, ingredientMap),
        tags: r.tags,
        instructions: r.instructions || [],
        ingredients: r.ingredients.map(item => ({
          id: item.id,
          name: ingredientMap[item.id]?.name || item.id,
          measure: scaleMeasure(item.measure, servings / BASE_SERVINGS),
          onSale: ingredientMap[item.id]?.onSale || false,
          saleStore: ingredientMap[item.id]?.saleStore || null,
          qty: item.qty * servings, cost: Math.round(ingredientMap[item.id]?.currentPrice * item.qty * servings * 100) / 100
        }))
      }))
      .sort((a, b) => b.score - a.score);
  }
  return result;
}

// Recipes are written with `measure` reflecting a single serving (e.g. "1/2 cup oats").
// Scale that display string up/down when the user picks more or fewer servings so
// they see realistic total amounts. The default servings count is 2, so use that as
// the baseline — at servings=2 the measure renders unchanged.
const BASE_SERVINGS = 2;

function formatQty(n) {
  if (n < 0.01) return '0';
  const whole = Math.floor(n);
  const frac = n - whole;
  const FRACS = [
    [0.125, '1/8'], [0.25, '1/4'], [0.333, '1/3'], [0.375, '3/8'],
    [0.5, '1/2'], [0.625, '5/8'], [0.666, '2/3'], [0.75, '3/4'], [0.875, '7/8'],
  ];
  for (const [val, label] of FRACS) {
    if (Math.abs(frac - val) < 0.04) return whole === 0 ? label : `${whole} ${label}`;
  }
  if (frac < 0.04) return String(whole);
  if (frac > 0.96) return String(whole + 1);
  return n.toFixed(2).replace(/\.?0+$/, '');
}

function scaleMeasure(str, factor) {
  if (!str || factor === 1) return str;
  // Pull a leading number: mixed fraction ("1 1/2"), simple fraction ("3/4"),
  // decimal ("1.5"), or integer ("2"). Everything else ("pinch", "to taste",
  // "small handful") returns unchanged.
  const m = String(str).match(/^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s*(.*)$/);
  if (!m) return str;
  const [, numStr, rest] = m;
  let n;
  if (/\s/.test(numStr)) {
    const [w, f] = numStr.split(/\s+/);
    const [a, b] = f.split('/').map(Number);
    n = Number(w) + a / b;
  } else if (/\//.test(numStr)) {
    const [a, b] = numStr.split('/').map(Number);
    n = a / b;
  } else {
    n = Number(numStr);
  }
  const num = formatQty(n * factor);
  if (!rest) return num;
  // Don't insert a space before punctuation (",", ".", etc.) — keeps
  // "1, sliced" reading cleanly when scaled to "2, sliced".
  return /^[,;:.!?]/.test(rest) ? `${num}${rest}` : `${num} ${rest}`;
}

// Coarse category derived from the recipe name. Used to avoid two same-style
// meals landing on consecutive days (no toast → toast, scramble → scramble, etc.).
// Order matters: most-specific patterns first.
function recipeCategory(recipe) {
  const n = (recipe.name || '').toLowerCase();
  if (/french toast/.test(n))                                              return 'french-toast';
  if (/\btoast\b|caprese.*toast|crostini|bagel|english muffin/.test(n))    return 'toast';
  if (/pancake|waffle|crepe/.test(n))                                      return 'pancake';
  if (/muffin/.test(n) && !/english/.test(n))                              return 'muffin';
  if (/smoothie/.test(n))                                                  return 'smoothie';
  if (/parfait/.test(n))                                                   return 'parfait';
  if (/yogurt.*(bowl|crunch)/.test(n))                                     return 'yogurt-bowl';
  if (/overnight oat|oatmeal|porridge|granola|muesli|baked oat/.test(n))   return 'oats';
  if (/yogurt/.test(n))                                                    return 'yogurt';
  if (/chia|pudding/.test(n))                                              return 'chia';
  if (/cereal/.test(n))                                                    return 'cereal';
  if (/burrito/.test(n))                                                   return 'burrito';
  if (/quesadilla/.test(n))                                                return 'quesadilla';
  if (/\btaco\b/.test(n))                                                  return 'taco';
  if (/wrap/.test(n))                                                      return 'wrap';
  if (/omelet|frittata|spanish.*tortilla|strata/.test(n))                  return 'omelet';
  if (/scramble|migas/.test(n))                                            return 'scramble';
  if (/shakshuka|huevos|egg in a hole/.test(n))                            return 'egg-dish';
  if (/hash|skillet/.test(n))                                              return 'hash';
  if (/sheet pan/.test(n))                                                 return 'sheet-pan';
  if (/grain bowl|rice bowl|quinoa bowl|savory.*bowl|power bowl/.test(n))  return 'grain-bowl';
  if (/\bbowl\b/.test(n))                                                  return 'bowl';
  if (/salad/.test(n))                                                     return 'salad';
  if (/soup|chili|stew/.test(n))                                           return 'soup';
  if (/sandwich|slider|burger/.test(n))                                    return 'sandwich';
  if (/pasta|spaghetti|linguine|fettuccine|penne|lasagn|noodle/.test(n))   return 'pasta';
  if (/stir.?fry/.test(n))                                                 return 'stir-fry';
  if (/curry/.test(n))                                                     return 'curry';
  if (/pizza/.test(n))                                                     return 'pizza';
  if (/casserole|bake/.test(n))                                            return 'bake';
  if (/cornbread/.test(n))                                                 return 'cornbread';
  if (/\begg/.test(n))                                                     return 'egg-other';
  return 'other';
}

// Difficulty is stored on each recipe (curated). Falls back to a prep/ingredient
// heuristic for custom recipes or anything missing the field.
function recipeDifficulty(recipe) {
  if (recipe.difficulty) return recipe.difficulty;
  const ingCount = recipe.ingredients.length;
  const prep = recipe.prepMinutes || 15;
  if (prep <= 10 && ingCount <= 4) return 'beginner';
  if (prep <= 20 && ingCount <= 6) return 'intermediate';
  return 'expert';
}

export function generateMealPlan(sales = [], budgetCap = null, servings = 1, excludeIds = [], favoriteIds = [], variation = 0, customRecipes = [], onHandIds = [], difficulty = 'all', excludeRecipeIds = [], selectedCuisines = [], respectBudget = true) {
  const { recipes: builtInRecipes, ingredients } = loadData();
  const ingredientMap = buildIngredientMap(ingredients, sales);

  // Merge custom recipes — they use ingredient names, so map them to IDs
  const recipes = [...builtInRecipes];
  for (const custom of customRecipes) {
    const mappedIngredients = custom.ingredients.map(ing => {
      const match = ingredients.find(i => i.id === ing.id);
      if (match) return ing;
      const nameMatch = ingredients.find(i => i.name.toLowerCase() === (ing.name || '').toLowerCase());
      return nameMatch ? { ...ing, id: nameMatch.id } : ing;
    }).filter(ing => ingredientMap[ing.id]);

    if (mappedIngredients.length > 0) {
      recipes.push({
        id: `custom_${custom.id || Date.now()}`,
        name: custom.name,
        mealType: custom.mealType,
        prepMinutes: custom.prepMinutes || 15,
        ingredients: mappedIngredients,
        tags: custom.tags || ['custom'],
        instructions: custom.instructions || [],
      });
    }
  }

  // Score and sort recipes by meal type, filtering out excluded ingredients
  const byType = {};
  for (const type of MEAL_TYPES) {
    byType[type] = recipes
      .filter(r => r.mealType === type)
      .filter(r => !excludeRecipeIds.includes(r.id))
      .filter(r => !selectedCuisines.length || (r.tags || []).some(t => selectedCuisines.includes(t)))
      .filter(r => !excludeIds.length || !r.ingredients.some(item => excludeIds.includes(item.id)))
      .filter(r => {
        if (difficulty === 'all') return true;
        const d = recipeDifficulty(r);
        if (difficulty === 'beginner') return d === 'beginner';
        if (difficulty === 'intermediate') return d === 'beginner' || d === 'intermediate';
        return true; // expert gets everything
      })
      .map(r => ({
        ...r,
        cost: calcRecipeCost(r, ingredientMap) * servings,
        protein_g: calcRecipeProtein(r, ingredientMap) * servings,
        veggie_count: calcVeggieCount(r, ingredientMap),
        score: scoreRecipe(r, ingredientMap, favoriteIds, onHandIds),
        onSaleIngredients: r.ingredients
          .filter(item => ingredientMap[item.id]?.onSale)
          .map(item => ingredientMap[item.id].name)
      }))
      .sort((a, b) => b.score - a.score);
  }

  // Reshuffle the pool with the variation as a seed so each Change It Up click produces
  // a different week. Shuffle on-hand and non-on-hand groups separately so on-hand recipes
  // still pin to the top of the rotation (user intent: use up the kitchen before it spoils).
  for (const type of MEAL_TYPES) {
    if (onHandIds.length > 0) {
      const usesOnHand = byType[type].filter(r => r.ingredients.some(i => onHandIds.includes(i.id)));
      const noOnHand = byType[type].filter(r => !r.ingredients.some(i => onHandIds.includes(i.id)));
      byType[type] = [
        ...seededShuffle(usesOnHand, variation + type.length),
        ...seededShuffle(noOnHand, variation + type.length + 1000),
      ];
    } else {
      byType[type] = seededShuffle(byType[type], variation + type.length);
    }
  }

  // Assign meals across 7 days, walking through the shuffled pool in order.
  const plan = {};
  let weeklyTotal = 0;
  const usedByType = {};
  for (const type of MEAL_TYPES) {
    usedByType[type] = 0;
  }

  // Track the previous day's category per meal type so we can avoid two same-style
  // meals in a row (no toast → toast, scramble → scramble, etc.). If every remaining
  // candidate matches the previous category we give up and use the natural pick.
  const prevCategory = { breakfast: null, lunch: null, dinner: null };

  for (let i = 0; i < DAYS.length; i++) {
    const day = DAYS[i];
    plan[day] = {};
    let dayTotal = 0;

    for (const type of MEAL_TYPES) {
      const options = byType[type];
      if (!options.length) {
        plan[day][type] = null;
        continue;
      }
      // Pick next unused recipe; wrap around only after exhausting all options.
      let meal = options[usedByType[type] % options.length];
      let scans = 0;
      while (
        prevCategory[type] &&
        recipeCategory(meal) === prevCategory[type] &&
        scans < options.length
      ) {
        usedByType[type]++;
        meal = options[usedByType[type] % options.length];
        scans++;
      }
      prevCategory[type] = recipeCategory(meal);
      usedByType[type]++;
      plan[day][type] = {
        id: meal.id,
        name: meal.name,
        prepMinutes: meal.prepMinutes,
        cost: meal.cost,
        protein_g: meal.protein_g,
        veggie_count: meal.veggie_count,
        onSaleIngredients: meal.onSaleIngredients,
        tags: meal.tags,
        instructions: meal.instructions || [],
        ingredients: meal.ingredients.map(item => ({
          id: item.id,
          name: ingredientMap[item.id]?.name || item.id,
          measure: scaleMeasure(item.measure, servings / BASE_SERVINGS),
          onSale: ingredientMap[item.id]?.onSale || false,
          saleStore: ingredientMap[item.id]?.saleStore || null,
          qty: item.qty * servings, cost: Math.round(ingredientMap[item.id]?.currentPrice * item.qty * servings * 100) / 100
        }))
      };
      dayTotal += meal.cost;
    }

    plan[day].dayTotal = Math.round(dayTotal * 100) / 100;
    weeklyTotal += dayTotal;
  }

  // Budget reconciliation: when the user generated the plan from the CTA we want
  // the first menu they see to land under (or near) the cap. Iteratively swap the
  // most expensive pick for a cheaper unused alternative.
  //
  // Two passes: first try to stay under the cap WITH the no-same-style-in-a-row
  // rule respected (preferred — variety + budget). If the week is still over
  // because every cheaper option would put two scrambles/toasts/etc in a row,
  // run a second pass that relaxes adjacency so the budget always wins when
  // forced to choose. Change It Up sets respectBudget=false to opt out entirely.
  if (respectBudget && budgetCap && weeklyTotal > budgetCap) {
    const SAFETY_LIMIT = DAYS.length * MEAL_TYPES.length * 2;
    const runSwapDown = (respectAdjacency) => {
      let iter = 0;
      while (weeklyTotal > budgetCap && iter < SAFETY_LIMIT) {
        iter++;
        const usedIds = new Set();
        for (const d of DAYS) for (const t of MEAL_TYPES) {
          const m = plan[d][t]; if (m) usedIds.add(m.id);
        }
        let bestSwap = null; // { dayIdx, type, savings, candidate }
        for (let di = 0; di < DAYS.length; di++) {
          for (const t of MEAL_TYPES) {
            const current = plan[DAYS[di]][t];
            if (!current) continue;
            const prevC = respectAdjacency && di > 0 && plan[DAYS[di - 1]][t] ? recipeCategory(plan[DAYS[di - 1]][t]) : null;
            const nextC = respectAdjacency && di < DAYS.length - 1 && plan[DAYS[di + 1]][t] ? recipeCategory(plan[DAYS[di + 1]][t]) : null;
            for (const candidate of byType[t]) {
              if (usedIds.has(candidate.id)) continue;
              if (candidate.cost >= current.cost) continue;
              if (respectAdjacency) {
                const cC = recipeCategory(candidate);
                if (cC === prevC || cC === nextC) continue;
              }
              const savings = current.cost - candidate.cost;
              if (!bestSwap || savings > bestSwap.savings) {
                bestSwap = { dayIdx: di, type: t, savings, candidate };
              }
            }
          }
        }
        if (!bestSwap) return; // No further beneficial swap at this constraint level
        const day = DAYS[bestSwap.dayIdx];
        const c = bestSwap.candidate;
        plan[day][bestSwap.type] = {
          id: c.id,
          name: c.name,
          prepMinutes: c.prepMinutes,
          cost: c.cost,
          protein_g: c.protein_g,
          veggie_count: c.veggie_count,
          onSaleIngredients: c.onSaleIngredients,
          tags: c.tags,
          instructions: c.instructions || [],
          ingredients: c.ingredients.map(item => ({
            id: item.id,
            name: ingredientMap[item.id]?.name || item.id,
            measure: scaleMeasure(item.measure, servings / BASE_SERVINGS),
            onSale: ingredientMap[item.id]?.onSale || false,
            saleStore: ingredientMap[item.id]?.saleStore || null,
            qty: item.qty * servings, cost: Math.round(ingredientMap[item.id]?.currentPrice * item.qty * servings * 100) / 100
          }))
        };
        let dt = 0;
        for (const tt of MEAL_TYPES) { const m = plan[day][tt]; if (m) dt += m.cost; }
        plan[day].dayTotal = Math.round(dt * 100) / 100;
        weeklyTotal = 0;
        for (const d of DAYS) {
          for (const tt of MEAL_TYPES) { const m = plan[d][tt]; if (m) weeklyTotal += m.cost; }
        }
      }
    };

    runSwapDown(true);
    if (weeklyTotal > budgetCap) runSwapDown(false);
  }

  return {
    plan,
    weeklyTotal: Math.round(weeklyTotal * 100) / 100,
    servings,
    generatedAt: new Date().toISOString(),
    salesApplied: sales.length
  };
}
