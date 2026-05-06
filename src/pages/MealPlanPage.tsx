import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useMealPlan } from '../hooks/useMealPlan';
import { MealDayColumn } from '../components/MealDayColumn';
import { exportMealPlanPDF } from '../utils/exportPDF';
import { Recipe } from '../types';

export function MealPlanPage() {
  const { days, removeRecipe, moveRecipe } = useMealPlan();
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [activeDayId, setActiveDayId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const hasAnyRecipe = days.some((d) => d.recipes.length > 0);

  function handleDragStart(event: DragStartEvent) {
    const [dayId, recipeId] = String(event.active.id).split(':');
    const day = days.find((d) => d.id === dayId);
    const recipe = day?.recipes.find((r) => r.id === Number(recipeId));
    if (recipe) {
      setActiveRecipe(recipe);
      setActiveDayId(dayId);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { over } = event;
    if (!over || !activeRecipe || !activeDayId) {
      setActiveRecipe(null);
      setActiveDayId(null);
      return;
    }
    const toDayId = String(over.id).split(':')[0];
    if (toDayId !== activeDayId) {
      moveRecipe(activeDayId, toDayId, activeRecipe);
    }
    setActiveRecipe(null);
    setActiveDayId(null);
  }

  return (
    <main className="meal-plan-page">
      <div className="meal-plan-page__header">
        <div>
          <h1 className="meal-plan-page__title">План питания</h1>
          <p className="meal-plan-page__hint">
            Добавляйте рецепты через поиск, перетаскивайте между днями
          </p>
        </div>
        <button
          className="pdf-btn"
          disabled={!hasAnyRecipe}
          onClick={() => exportMealPlanPDF(days)}
          title={hasAnyRecipe ? 'Скачать план в PDF' : 'Добавьте рецепты в план'}
        >
          <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
            <path d="M10 3v9m0 0l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 14v1a2 2 0 002 2h10a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Скачать PDF
        </button>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="meal-plan-grid">
          {days.map((day) => (
            <MealDayColumn key={day.id} day={day} onRemove={removeRecipe} />
          ))}
        </div>
        <DragOverlay>
          {activeRecipe && (
            <div className="sortable-recipe-item sortable-recipe-item--overlay">
              <img src={activeRecipe.image} alt={activeRecipe.title} />
              <span>{activeRecipe.title}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </main>
  );
}
