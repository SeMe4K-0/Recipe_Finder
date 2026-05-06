import { useState, useCallback } from 'react';
import { MealPlanDay, Recipe } from '../types';

const STORAGE_KEY = 'mealPlan';

const DEFAULT_DAYS: MealPlanDay[] = [
  { id: 'mon', label: 'Понедельник', recipes: [] },
  { id: 'tue', label: 'Вторник', recipes: [] },
  { id: 'wed', label: 'Среда', recipes: [] },
  { id: 'thu', label: 'Четверг', recipes: [] },
  { id: 'fri', label: 'Пятница', recipes: [] },
  { id: 'sat', label: 'Суббота', recipes: [] },
  { id: 'sun', label: 'Воскресенье', recipes: [] },
];

function load(): MealPlanDay[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_DAYS;
  } catch {
    return DEFAULT_DAYS;
  }
}

function save(days: MealPlanDay[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
}

export function useMealPlan() {
  const [days, setDays] = useState<MealPlanDay[]>(load);

  const update = useCallback((next: MealPlanDay[]) => {
    setDays(next);
    save(next);
  }, []);

  const addRecipe = useCallback((dayId: string, recipe: Recipe) => {
    setDays((prev) => {
      const next = prev.map((d) =>
        d.id === dayId && !d.recipes.find((r) => r.id === recipe.id)
          ? { ...d, recipes: [...d.recipes, recipe] }
          : d
      );
      save(next);
      return next;
    });
  }, []);

  const removeRecipe = useCallback((dayId: string, recipeId: number) => {
    setDays((prev) => {
      const next = prev.map((d) =>
        d.id === dayId
          ? { ...d, recipes: d.recipes.filter((r) => r.id !== recipeId) }
          : d
      );
      save(next);
      return next;
    });
  }, []);

  const moveRecipe = useCallback(
    (fromDayId: string, toDayId: string, recipe: Recipe) => {
      setDays((prev) => {
        const next = prev.map((d) => {
          if (d.id === fromDayId) return { ...d, recipes: d.recipes.filter((r) => r.id !== recipe.id) };
          if (d.id === toDayId && !d.recipes.find((r) => r.id === recipe.id))
            return { ...d, recipes: [...d.recipes, recipe] };
          return d;
        });
        save(next);
        return next;
      });
    },
    []
  );

  return { days, update, addRecipe, removeRecipe, moveRecipe };
}
