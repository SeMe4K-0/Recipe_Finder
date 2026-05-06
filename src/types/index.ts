export interface Recipe {
  id: number;
  title: string;
  image: string;
  imageType: string;
  readyInMinutes?: number;
  servings?: number;
  summary?: string;
  diets?: string[];
  cuisines?: string[];
  dishTypes?: string[];
  extendedIngredients?: Ingredient[];
  analyzedInstructions?: AnalyzedInstruction[];
}

export interface Ingredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  original: string;
  image: string;
}

export interface AnalyzedInstruction {
  name: string;
  steps: Step[];
}

export interface Step {
  number: number;
  step: string;
  ingredients: { id: number; name: string; image: string }[];
}

export interface SearchResult {
  results: Recipe[];
  totalResults: number;
  offset: number;
  number: number;
}

export interface SearchParams {
  query: string;
  diet?: string;
  cuisine?: string;
  page?: number;
}

export interface MealPlanDay {
  id: string;
  label: string;
  recipes: Recipe[];
}

export type Diet =
  | ''
  | 'vegetarian'
  | 'vegan'
  | 'glutenFree'
  | 'ketogenic'
  | 'paleo'
  | 'primal';

export type Cuisine =
  | ''
  | 'italian'
  | 'mexican'
  | 'asian'
  | 'american'
  | 'french'
  | 'mediterranean';
