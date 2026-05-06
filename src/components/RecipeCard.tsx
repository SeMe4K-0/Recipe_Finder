import React from 'react';
import { Link } from 'react-router-dom';
import { Recipe } from '../types';
import { translateDiet } from '../utils/i18n';

interface Props {
  recipe: Recipe;
  translatedTitle?: string;
  onAddToMealPlan?: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, translatedTitle, onAddToMealPlan }: Props) {
  const displayTitle = translatedTitle || recipe.title;

  return (
    <div className="recipe-card" style={{ viewTransitionName: `recipe-${recipe.id}` }}>
      <Link to={`/recipe/${recipe.id}`}>
        <img src={recipe.image} alt={displayTitle} loading="lazy" />
        <div className="recipe-card__body">
          <h3 className="recipe-card__title">{displayTitle}</h3>
          {recipe.readyInMinutes && (
            <span className="recipe-card__time">⏱ {recipe.readyInMinutes} мин</span>
          )}
          {recipe.diets && recipe.diets.length > 0 && (
            <ul className="recipe-card__diets">
              {recipe.diets.slice(0, 3).map((d) => (
                <li key={d}>{translateDiet(d)}</li>
              ))}
            </ul>
          )}
        </div>
      </Link>
      {onAddToMealPlan && (
        <button
          className="recipe-card__add-btn"
          onClick={(e) => { e.preventDefault(); onAddToMealPlan(recipe); }}
          title="Добавить в план питания"
        >
          + В план
        </button>
      )}
    </div>
  );
}
