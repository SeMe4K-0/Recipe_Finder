import React, { useEffect } from 'react';
import { MealPlanDay, MealType, Recipe } from '../types';

interface Props {
  recipe: Recipe;
  days: MealPlanDay[];
  onAdd: (dayId: string, mealType: MealType) => void;
  onClose: () => void;
}

const MEAL_TYPES: { type: MealType; label: string }[] = [
  { type: 'breakfast', label: 'Завтрак' },
  { type: 'lunch',     label: 'Обед'    },
  { type: 'dinner',    label: 'Ужин'    },
];

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
        <h2 className="modal__title">Добавить в план питания</h2>
        <p className="modal__recipe-name">«{recipe.title}»</p>

        <div className="modal__grid">
          <div className="modal__grid-corner" />
          {MEAL_TYPES.map(({ type, label }) => (
            <div key={type} className={`modal__grid-header modal__grid-header--${type}`}>{label}</div>
          ))}

          {days.map((day) => (
            <React.Fragment key={day.id}>
              <div className="modal__grid-day">{day.short}</div>
              {MEAL_TYPES.map(({ type }) => {
                const existing = day.meals[type];
                const hasItems = existing.length > 0;
                const alreadyAdded = existing.some((r) => r.id === recipe.id);
                return (
                  <button
                    key={type}
                    className={[
                      'modal__grid-cell',
                      `modal__grid-cell--${type}`,
                      alreadyAdded ? 'modal__grid-cell--added' : '',
                    ].join(' ')}
                    onClick={() => { onAdd(day.id, type); onClose(); }}
                    title={alreadyAdded ? 'Уже добавлено' : undefined}
                  >
                    {hasItems && (
                      <div className="modal__cell-preview">
                        {existing.slice(0, 2).map((r) => (
                          <img
                            key={r.id}
                            src={r.image}
                            alt=""
                            className={r.id === recipe.id ? 'modal__cell-img--current' : ''}
                          />
                        ))}
                        {existing.length > 2 && (
                          <span className="modal__cell-more">+{existing.length - 2}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
