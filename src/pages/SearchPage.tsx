import { useState, useEffect, useRef } from 'react';
import { useRecipes } from '../hooks/useRecipes';
import { useMealPlan } from '../hooks/useMealPlan';
import { RecipeCard } from '../components/RecipeCard';
import { Filters } from '../components/Filters';
import { AddToMealPlanModal } from '../components/AddToMealPlanModal';
import { Recipe, MealType } from '../types';

const HINTS = ['Паста карбонара', 'Борщ', 'Греческий салат', 'Пицца', 'Ризотто', 'Том Ям', 'Тирамису'];

export function SearchPage() {
  const {
    recipes, translatedTitles, totalResults,
    isLoading, isLoadingMore, hasMore, error,
    query, diets, cuisines,
    setQuery, setDiets, setCuisines, loadMore,
  } = useRecipes();

  const { days, addRecipe } = useMealPlan();
  const [modalRecipe, setModalRecipe] = useState<Recipe | null>(null);

  // Sentinel for infinite scroll
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

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

        {/* Empty state hint — shown when no query entered */}
        {!query && !isLoading && (
          <div className="search-hint">
            <svg className="search-hint__icon" viewBox="0 0 64 64" fill="none">
              <circle cx="28" cy="28" r="18" stroke="currentColor" strokeWidth="3" opacity=".25"/>
              <path d="M41 41l10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".25"/>
              <path d="M21 28h14M28 21v14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity=".4"/>
            </svg>
            <p className="search-hint__title">Найдите рецепт по-русски</p>
            <p className="search-hint__sub">Введите название блюда или продукта — результаты переводятся автоматически</p>
            <div className="search-hint__tags">
              {HINTS.map((hint) => (
                <button key={hint} className="search-hint__tag" onClick={() => setQuery(hint)}>
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

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

        {recipes.length > 0 && (
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

            {/* Infinite scroll sentinel */}
            {hasMore && <div ref={sentinelRef} className="scroll-sentinel" />}

            {/* Loading more spinner */}
            {isLoadingMore && (
              <div className="load-more">
                <div className="load-more__spinner" />
              </div>
            )}

            {/* End of results */}
            {!hasMore && !isLoading && (
              <p className="load-more__end">Все {totalResults} рецептов загружены</p>
            )}
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
