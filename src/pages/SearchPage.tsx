import { useState } from 'react';
import { useRecipes } from '../hooks/useRecipes';
import { useMealPlan } from '../hooks/useMealPlan';
import { RecipeCard } from '../components/RecipeCard';
import { Filters } from '../components/Filters';
import { Pagination } from '../components/Pagination';
import { AddToMealPlanModal } from '../components/AddToMealPlanModal';
import { Recipe, MealType } from '../types';

export function SearchPage() {
  const {
    recipes, translatedTitles, totalResults, isLoading, error,
    query, diets, cuisines, page,
    setQuery, setDiets, setCuisines, setPage,
  } = useRecipes();

  const { days, addRecipe } = useMealPlan();
  const [modalRecipe, setModalRecipe] = useState<Recipe | null>(null);

  return (
    <>
      <main className="search-page">
        <div className="search-page__controls">
          <div className="search-input-wrapper">
            <svg className="search-icon" viewBox="0 0 20 20" fill="none">
              <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.8"/>
              <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <input
              className="search-page__input"
              type="search"
              placeholder="Паста карбонара, суп, салат..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <Filters
            diets={diets}
            cuisines={cuisines}
            onDietsChange={setDiets}
            onCuisinesChange={setCuisines}
          />
          {!isLoading && recipes.length > 0 && (
            <span className="search-page__count">{totalResults} рецептов</span>
          )}
        </div>

        {isLoading && (
          <div className="recipe-grid">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="recipe-card-skeleton">
                <div className="skeleton skeleton--image" />
                <div className="skeleton-body">
                  <div className="skeleton skeleton--title" />
                  <div className="skeleton skeleton--text" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && <p className="status-message status-message--error">{error}</p>}

        {!isLoading && query && recipes.length === 0 && !error && (
          <div className="empty-state">
            <span className="empty-state__icon">🔍</span>
            <p>Ничего не найдено по запросу «{query}»</p>
          </div>
        )}

        {!isLoading && recipes.length > 0 && (
          <>
            <div className="recipe-grid">
              {recipes.map((r) => (
                <RecipeCard
                  key={r.id}
                  recipe={r}
                  translatedTitle={translatedTitles[r.id]}
                  onAddToMealPlan={(recipe) =>
                    setModalRecipe({ ...recipe, title: translatedTitles[recipe.id] ?? recipe.title })
                  }
                />
              ))}
            </div>
            <Pagination page={page} totalResults={totalResults} onPageChange={setPage} />
          </>
        )}
      </main>

      {modalRecipe && (
        <AddToMealPlanModal
          recipe={modalRecipe}
          days={days}
          onAdd={(dayId: string, mealType: MealType) =>
            addRecipe(dayId, mealType, modalRecipe)
          }
          onClose={() => setModalRecipe(null)}
        />
      )}
    </>
  );
}
