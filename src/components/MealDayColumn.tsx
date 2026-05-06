import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MealPlanDay, Recipe } from '../types';
import { SortableRecipeItem } from './SortableRecipeItem';

interface Props {
  day: MealPlanDay;
  onRemove: (dayId: string, recipeId: number) => void;
}

export function MealDayColumn({ day, onRemove }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: day.id });

  return (
    <div
      className={`meal-day-column${isOver ? ' meal-day-column--over' : ''}`}
      ref={setNodeRef}
    >
      <h3 className="meal-day-column__label">{day.label}</h3>
      <SortableContext
        items={day.recipes.map((r) => `${day.id}:${r.id}`)}
        strategy={verticalListSortingStrategy}
      >
        {day.recipes.map((recipe: Recipe) => (
          <SortableRecipeItem
            key={recipe.id}
            id={`${day.id}:${recipe.id}`}
            recipe={recipe}
            onRemove={() => onRemove(day.id, recipe.id)}
          />
        ))}
      </SortableContext>
      {day.recipes.length === 0 && (
        <p className="meal-day-column__empty">Перетащите рецепт сюда</p>
      )}
    </div>
  );
}
