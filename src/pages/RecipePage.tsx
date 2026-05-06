import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRecipeById } from '../api/spoonacular';
import { enToRu } from '../api/translate';
import { useMealPlan } from '../hooks/useMealPlan';
import { AddToMealPlanModal } from '../components/AddToMealPlanModal';
import { Recipe } from '../types';
import { translateDiet, translateCuisine } from '../utils/i18n';

interface TranslatedData {
  title: string;
  ingredients: string[];
  steps: string[];
}

export function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [translated, setTranslated] = useState<TranslatedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const { days, addRecipe } = useMealPlan();

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setTranslated(null);

    getRecipeById(Number(id))
      .then(async (data) => {
        setRecipe(data);
        setIsLoading(false);

        // Translate in parallel
        setIsTranslating(true);
        const ingredientTexts = (data.extendedIngredients ?? []).map((i) => i.original);
        const stepTexts = (data.analyzedInstructions?.[0]?.steps ?? []).map((s) => s.step);

        const [titleArr, ingredientsArr, stepsArr] = await Promise.all([
          enToRu([data.title]),
          enToRu(ingredientTexts),
          enToRu(stepTexts),
        ]);

        setTranslated({
          title: titleArr[0],
          ingredients: ingredientsArr,
          steps: stepsArr,
        });
        setIsTranslating(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [id]);

  if (isLoading) {
    return (
      <div className="recipe-page-skeleton">
        <div className="skeleton skeleton--title" />
        <div className="skeleton skeleton--image" />
        <div className="skeleton skeleton--text" />
        <div className="skeleton skeleton--text" />
      </div>
    );
  }
  if (error) return <p className="status-message status-message--error">{error}</p>;
  if (!recipe) return null;

  const displayTitle = translated?.title ?? recipe.title;

  return (
    <>
      <main className="recipe-page" style={{ viewTransitionName: `recipe-${recipe.id}` }}>
        <Link to="/search" className="recipe-page__back">← Назад</Link>

        <div className="recipe-page__hero">
          <img src={recipe.image} alt={displayTitle} />
          <div className="recipe-page__meta">
            <h1>{displayTitle}</h1>
            <div className="recipe-page__badges">
              {recipe.readyInMinutes && (
                <span className="badge badge--time">⏱ {recipe.readyInMinutes} мин</span>
              )}
              {recipe.servings && (
                <span className="badge badge--servings">🍽 {recipe.servings} порц.</span>
              )}
            </div>
            {recipe.diets && recipe.diets.length > 0 && (
              <p className="recipe-page__diets">{recipe.diets.map(translateDiet).join(' · ')}</p>
            )}
            {recipe.cuisines && recipe.cuisines.length > 0 && (
              <p className="recipe-page__cuisines">Кухня: {recipe.cuisines.map(translateCuisine).join(', ')}</p>
            )}
            <button className="recipe-page__add-btn" onClick={() => setShowModal(true)}>
              + Добавить в план питания
            </button>
          </div>
        </div>

        {isTranslating && <p className="translating-notice">Переводим рецепт...</p>}

        {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 && (
          <section className="recipe-page__section">
            <h2>Ингредиенты</h2>
            <ul className="ingredient-list">
              {recipe.extendedIngredients.map((ing, i) => (
                <li key={ing.id}>
                  {translated ? translated.ingredients[i] : ing.original}
                </li>
              ))}
            </ul>
          </section>
        )}

        {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 && (
          <section className="recipe-page__section">
            <h2>Приготовление</h2>
            <ol className="step-list">
              {recipe.analyzedInstructions[0].steps.map((step, i) => (
                <li key={step.number}>
                  {translated ? translated.steps[i] : step.step}
                </li>
              ))}
            </ol>
          </section>
        )}
      </main>

      {showModal && (
        <AddToMealPlanModal
          recipe={{ ...recipe, title: displayTitle }}
          days={days}
          onAdd={(dayId) => addRecipe(dayId, { ...recipe, title: displayTitle })}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
