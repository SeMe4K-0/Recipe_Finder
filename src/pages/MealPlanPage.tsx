import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMealPlan } from '../hooks/useMealPlan';
import { MealType } from '../types';

const MEAL_TYPES: { type: MealType; label: string }[] = [
  { type: 'breakfast', label: 'Завтрак' },
  { type: 'lunch',     label: 'Обед'    },
  { type: 'dinner',    label: 'Ужин'    },
];

export function MealPlanPage() {
  const navigate = useNavigate();
  const { days, removeRecipe } = useMealPlan();

  const hasAnyRecipe = days.some((d) =>
    (['breakfast', 'lunch', 'dinner'] as MealType[]).some((mt) => d.meals[mt].length > 0)
  );

  return (
    <main className="meal-plan-page">
      <div className="meal-plan-page__header">
        <h1 className="meal-plan-page__title">План питания</h1>
        <button
          className="pdf-btn"
          disabled={!hasAnyRecipe}
          onClick={() => navigate('/pdf-preview')}
          title={hasAnyRecipe ? 'Скачать план в PDF' : 'Добавьте рецепты в план'}
        >
          <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
            <path d="M10 3v9m0 0l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 14v1a2 2 0 002 2h10a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Скачать PDF
        </button>
      </div>

      <div className="meal-table">
        <div className="meal-table__header-day" />
        {MEAL_TYPES.map(({ type, label }) => (
          <div key={type} className={`meal-table__header-meal meal-table__header-meal--${type}`}>
            {label}
          </div>
        ))}

        {days.map((day) => (
          <React.Fragment key={day.id}>
            <div className="meal-table__day-cell">
              <span className="meal-table__day-short">{day.short}</span>
              <span className="meal-table__day-long">{day.label}</span>
            </div>
            {MEAL_TYPES.map(({ type }) => (
              <div key={type} className={`meal-table__meal-cell meal-table__meal-cell--${type}`}>
                {day.meals[type].map((recipe) => (
                  <div key={recipe.id} className="meal-dish">
                    <Link to={`/recipe/${recipe.id}`} className="meal-dish__link">
                      <img src={recipe.image} alt="" />
                      <div className="meal-dish__info">
                        <div className="meal-dish__title">{recipe.title}</div>
                        {recipe.readyInMinutes && (
                          <div className="meal-dish__time">{recipe.readyInMinutes} мин</div>
                        )}
                      </div>
                    </Link>
                    <button
                      className="meal-dish__remove"
                      onClick={() => removeRecipe(day.id, type, recipe.id)}
                      title="Удалить"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {day.meals[type].length === 0 && (
                  <div className="meal-cell__empty">—</div>
                )}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </main>
  );
}
