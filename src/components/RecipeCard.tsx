import React from 'react';
import { Link } from 'react-router-dom';
import { Recipe } from '../types';

interface Props {
  recipe: Recipe;
  translatedTitle?: string;
  onAddToMealPlan?: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, translatedTitle, onAddToMealPlan }: Props) {
  const displayTitle = translatedTitle || recipe.title;

  return (
    <div className="recipe-card" style={{ viewTransitionName: `recipe-${recipe.id}` }}>
      <Link to={`/recipe/${recipe.id}`} className="recipe-card__link">
        <div className="recipe-card__image-wrap">
          <img src={recipe.image} alt={displayTitle} loading="lazy" />
          {recipe.readyInMinutes && (
            <span className="recipe-card__time-pill">{recipe.readyInMinutes} мин</span>
          )}
        </div>
        <div className="recipe-card__title">{displayTitle}</div>
      </Link>
      {onAddToMealPlan && (
        <button
          className="recipe-card__add-btn"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToMealPlan(recipe); }}
          title="Добавить в план питания"
        >
          +
        </button>
      )}
    </div>
  );
}
