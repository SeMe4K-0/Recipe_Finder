import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchRecipes } from '../api/spoonacular';
import { ruToEn, enToRu } from '../api/translate';
import { Recipe } from '../types';
import { useDebounce } from './useDebounce';

interface UseRecipesReturn {
  recipes: Recipe[];
  translatedTitles: Record<number, string>;
  totalResults: number;
  isLoading: boolean;
  error: string | null;
  query: string;
  diets: string[];
  cuisines: string[];
  page: number;
  setQuery: (q: string) => void;
  setDiets: (d: string[]) => void;
  setCuisines: (c: string[]) => void;
  setPage: (p: number) => void;
}

export function useRecipes(): UseRecipesReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') ?? '';
  const diets = searchParams.get('diet')?.split(',').filter(Boolean) ?? [];
  const cuisines = searchParams.get('cuisine')?.split(',').filter(Boolean) ?? [];
  const page = Number(searchParams.get('page') ?? '1');

  const debouncedQuery = useDebounce(query, 500);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [translatedTitles, setTranslatedTitles] = useState<Record<number, string>>({});
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setRecipes([]);
      setTranslatedTitles({});
      setTotalResults(0);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    const hasCyrillic = /[а-яёА-ЯЁ]/.test(debouncedQuery);
    const queryPromise = hasCyrillic
      ? ruToEn([debouncedQuery]).then((r) => r[0])
      : Promise.resolve(debouncedQuery);

    queryPromise
      .then((enQuery) =>
        searchRecipes({
          query: enQuery,
          diet: diets[0] ?? '',       // Spoonacular supports one diet
          cuisine: cuisines.join(','), // Spoonacular supports multiple cuisines
          page,
        })
      )
      .then(async (data) => {
        if (cancelled) return;
        setRecipes(data.results);
        setTotalResults(data.totalResults);

        const titles = data.results.map((r) => r.title);
        const translated = await enToRu(titles);
        if (!cancelled) {
          const map: Record<number, string> = {};
          data.results.forEach((r, i) => { map[r.id] = translated[i]; });
          setTranslatedTitles(map);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [debouncedQuery, diets.join(','), cuisines.join(','), page]); // eslint-disable-line react-hooks/exhaustive-deps

  function updateArrayParam(key: string, values: string[]) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (values.length > 0) next.set(key, values.join(','));
      else next.delete(key);
      next.delete('page');
      return next;
    });
  }

  function updateParam(key: string, value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete('page');
      return next;
    });
  }

  return {
    recipes,
    translatedTitles,
    totalResults,
    isLoading,
    error,
    query,
    diets,
    cuisines,
    page,
    setQuery: (q) => updateParam('q', q),
    setDiets: (d) => updateArrayParam('diet', d),
    setCuisines: (c) => updateArrayParam('cuisine', c),
    setPage: (p) => updateParam('page', String(p)),
  };
}
