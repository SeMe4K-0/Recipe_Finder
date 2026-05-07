import { useState, useCallback } from 'react';
import { MealPlanDay, MealType, Recipe } from '../types';

const STORAGE_KEY = 'mealPlan_v2';

const DEFAULT_DAYS: MealPlanDay[] = [
  { id: 'mon', label: 'Понедельник', short: 'Пн', meals: { breakfast: [], lunch: [], dinner: [] } },
  { id: 'tue', label: 'Вторник',     short: 'Вт', meals: { breakfast: [], lunch: [], dinner: [] } },
  { id: 'wed', label: 'Среда',       short: 'Ср', meals: { breakfast: [], lunch: [], dinner: [] } },
  { id: 'thu', label: 'Четверг',     short: 'Чт', meals: { breakfast: [], lunch: [], dinner: [] } },
  { id: 'fri', label: 'Пятница',     short: 'Пт', meals: { breakfast: [], lunch: [], dinner: [] } },
  { id: 'sat', label: 'Суббота',     short: 'Сб', meals: { breakfast: [], lunch: [], dinner: [] } },
  { id: 'sun', label: 'Воскресенье', short: 'Вс', meals: { breakfast: [], lunch: [], dinner: [] } },
];

function load(): MealPlanDay[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);

    // Migrate from old format { id, label, recipes: Recipe[] }
    const oldRaw = localStorage.getItem('mealPlan');
    if (oldRaw) {
      const old: { id: string; label: string; recipes: Recipe[] }[] = JSON.parse(oldRaw);
      return DEFAULT_DAYS.map((def, i) => {
        const prev = old[i];
        if (!prev) return def;
        return { ...def, meals: { breakfast: [], lunch: [], dinner: prev.recipes ?? [] } };
      });
    }

    return DEFAULT_DAYS;
  } catch {
    return DEFAULT_DAYS;
  }
}

function save(days: MealPlanDay[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(days));
}

export function useMealPlan() {
  const [days, setDays] = useState<MealPlanDay[]>(load);

  const addRecipe = useCallback((dayId: string, mealType: MealType, recipe: Recipe) => {
    setDays((prev) => {
      const next = prev.map((d) => {
        if (d.id !== dayId) return d;
        const existing = d.meals[mealType];
        if (existing.find((r) => r.id === recipe.id)) return d;
        return { ...d, meals: { ...d.meals, [mealType]: [...existing, recipe] } };
      });
      save(next);
      return next;
    });
  }, []);

  const removeRecipe = useCallback((dayId: string, mealType: MealType, recipeId: number) => {
    setDays((prev) => {
      const next = prev.map((d) => {
        if (d.id !== dayId) return d;
        return {
          ...d,
          meals: { ...d.meals, [mealType]: d.meals[mealType].filter((r) => r.id !== recipeId) },
        };
      });
      save(next);
      return next;
    });
  }, []);

  return { days, addRecipe, removeRecipe };
}
