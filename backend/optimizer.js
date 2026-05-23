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
  return ingredients.map(i => ({ id: i.id, name: i.name, category: i.category }));
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
          measure: item.measure || null,
          onSale: ingredientMap[item.id]?.onSale || false,
          saleStore: ingredientMap[item.id]?.saleStore || null,
          cost: Math.round(ingredientMap[item.id]?.currentPrice * item.qty * servings * 100) / 100
        }))
      }))
      .sort((a, b) => b.score - a.score);
  }
  return result;
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

export function generateMealPlan(sales = [], budgetCap = null, servings = 1, excludeIds = [], favoriteIds = [], variation = 0, customRecipes = [], onHandIds = [], difficulty = 'all', excludeRecipeIds = [], selectedCuisines = []) {
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
          measure: item.measure || null,
          onSale: ingredientMap[item.id]?.onSale || false,
          saleStore: ingredientMap[item.id]?.saleStore || null,
          cost: Math.round(ingredientMap[item.id]?.currentPrice * item.qty * servings * 100) / 100
        }))
      };
      dayTotal += meal.cost;
    }

    plan[day].dayTotal = Math.round(dayTotal * 100) / 100;
    weeklyTotal += dayTotal;
  }

  return {
    plan,
    weeklyTotal: Math.round(weeklyTotal * 100) / 100,
    servings,
    generatedAt: new Date().toISOString(),
    salesApplied: sales.length
  };
}
