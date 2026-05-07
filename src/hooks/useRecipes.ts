import { useState, useEffect, useCallback, useRef } from 'react';
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
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  query: string;
  diets: string[];
  cuisines: string[];
  setQuery: (q: string) => void;
  setDiets: (d: string[]) => void;
  setCuisines: (c: string[]) => void;
  loadMore: () => void;
}

export function useRecipes(): UseRecipesReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  const query    = searchParams.get('q') ?? '';
  const diets    = searchParams.get('diet')?.split(',').filter(Boolean) ?? [];
  const cuisines = searchParams.get('cuisine')?.split(',').filter(Boolean) ?? [];

  const debouncedQuery = useDebounce(query, 500);

  const [recipes, setRecipes]               = useState<Recipe[]>([]);
  const [translatedTitles, setTranslatedTitles] = useState<Record<number, string>>({});
  const [totalResults, setTotalResults]     = useState(0);
  const [isLoading, setIsLoading]           = useState(false);
  const [isLoadingMore, setIsLoadingMore]   = useState(false);
  const [error, setError]                   = useState<string | null>(null);

  // Internal page cursor — not in URL since page = scroll position
  const pageRef = useRef(1);

  const hasMore = recipes.length < totalResults;

  // Translate a batch and merge into translatedTitles
  async function translateAndMerge(batch: Recipe[], cancelled: () => boolean) {
    const titles = batch.map((r) => r.title);
    const translated = await enToRu(titles);
    if (cancelled()) return;
    setTranslatedTitles((prev) => {
      const next = { ...prev };
      batch.forEach((r, i) => { next[r.id] = translated[i]; });
      return next;
    });
  }

  // Fetch a page using an already-resolved English query string
  async function fetchPage(enQuery: string, page: number) {
    return searchRecipes({
      query: enQuery,
      diet: diets[0] ?? '',
      cuisine: cuisines.join(','),
      page,
    });
  }

  // Reset + fetch page 1 whenever query/filters change
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setRecipes([]);
      setTranslatedTitles({});
      setTotalResults(0);
      pageRef.current = 1;
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setRecipes([]);
    setTranslatedTitles({});
    pageRef.current = 1;

    const hasCyrillic = /[а-яёА-ЯЁ]/.test(debouncedQuery);
    const queryPromise = hasCyrillic
      ? ruToEn([debouncedQuery]).then((r) => r[0])
      : Promise.resolve(debouncedQuery);

    queryPromise
      .then((enQuery) => fetchPage(enQuery, 1))
      .then(async (data) => {
        if (cancelled) return;
        setRecipes(data.results);
        setTotalResults(data.totalResults);
        translateAndMerge(data.results, () => cancelled);
      })
      .catch((err: Error) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    return () => { cancelled = true; };
  }, [debouncedQuery, diets.join(','), cuisines.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  // Append next page
  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !hasMore) return;

    const nextPage = pageRef.current + 1;
    setIsLoadingMore(true);

    const hasCyrillic = /[а-яёА-ЯЁ]/.test(debouncedQuery);
    const queryPromise = hasCyrillic
      ? ruToEn([debouncedQuery]).then((r) => r[0])
      : Promise.resolve(debouncedQuery);

    let cancelled = false;

    queryPromise
      .then((enQuery) =>
        searchRecipes({
          query: enQuery,
          diet: diets[0] ?? '',
          cuisine: cuisines.join(','),
          page: nextPage,
        })
      )
      .then(async (data) => {
        if (cancelled) return;
        pageRef.current = nextPage;
        setRecipes((prev) => [...prev, ...data.results]);
        setTotalResults(data.totalResults);
        translateAndMerge(data.results, () => cancelled);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setIsLoadingMore(false); });
  }, [isLoading, isLoadingMore, hasMore, debouncedQuery, diets.join(','), cuisines.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

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
    recipes, translatedTitles, totalResults,
    isLoading, isLoadingMore, hasMore, error,
    query, diets, cuisines,
    setQuery:    (q) => updateParam('q', q),
    setDiets:    (d) => updateArrayParam('diet', d),
    setCuisines: (c) => updateArrayParam('cuisine', c),
    loadMore,
  };
}
