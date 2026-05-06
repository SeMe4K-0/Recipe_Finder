import React, { useEffect } from 'react';
import { MealPlanDay, Recipe } from '../types';

interface Props {
  recipe: Recipe;
  days: MealPlanDay[];
  onAdd: (dayId: string) => void;
  onClose: () => void;
}

export function AddToMealPlanModal({ recipe, days, onAdd, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>✕</button>
        <h2 className="modal__title">В какой день добавить?</h2>
        <p className="modal__recipe-name">«{recipe.title}»</p>
        <div className="modal__days">
          {days.map((day) => (
            <button
              key={day.id}
              className="modal__day-btn"
              onClick={() => { onAdd(day.id); onClose(); }}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
