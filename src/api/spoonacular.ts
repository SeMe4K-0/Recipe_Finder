import { Recipe, SearchResult, SearchParams } from '../types';

const BASE_URL = process.env.REACT_APP_SPOONACULAR_BASE_URL!;
const API_KEY = process.env.REACT_APP_SPOONACULAR_API_KEY!;
const PAGE_SIZE = 12;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

interface CacheEntry<T> {
  data: T;
  ts: number;
}

function getCacheKey(path: string, params: Record<string, string>): string {
  const sorted = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return `spoonacular:${path}?${sorted}`;
}

function fromCache<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (Date.now() - entry.ts > CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return entry.data;
  } catch {
    return null;
  }
}

function toCache(key: string, data: unknown): void {
  try {
    const entry: CacheEntry<unknown> = { data, ts: Date.now() };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch {
    // storage full — clear old spoonacular entries and retry
    for (const k of Object.keys(localStorage)) {
      if (k.startsWith('spoonacular:')) localStorage.removeItem(k);
    }
  }
}

async function get<T>(path: string, params: Record<string, string>): Promise<T> {
  const key = getCacheKey(path, params);
  const cached = fromCache<T>(key);
  if (cached) return cached;

  const query = new URLSearchParams({ ...params, apiKey: API_KEY }).toString();
  const res = await fetch(`${BASE_URL}${path}?${query}`);

  if (res.status === 402) {
    throw new Error('Исчерпан дневной лимит API (150 запросов/день). Попробуйте завтра — кэш сохраняет результаты на 6 часов.');
  }

  if (!res.ok) {
    throw new Error(`Ошибка API: ${res.status} ${res.statusText}`);
  }

  const data: T = await res.json();
  toCache(key, data);
  return data;
}

export async function searchRecipes(params: SearchParams): Promise<SearchResult> {
  const { query, diet = '', cuisine = '', page = 1 } = params;

  return get<SearchResult>('/recipes/complexSearch', {
    query,
    diet,
    cuisine,
    offset: String((page - 1) * PAGE_SIZE),
    number: String(PAGE_SIZE),
    addRecipeInformation: 'true',
  });
}

export async function getRecipeById(id: number): Promise<Recipe> {
  return get<Recipe>(`/recipes/${id}/information`, {
    includeNutrition: 'false',
  });
}

export const RECIPES_PER_PAGE = PAGE_SIZE;
