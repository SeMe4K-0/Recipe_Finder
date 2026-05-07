import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMealPlan } from '../hooks/useMealPlan';
import { getRecipeById } from '../api/spoonacular';
import { enToRu } from '../api/translate';
import { Recipe, MealType } from '../types';

interface FullRecipe extends Recipe {
  ruTitle: string;
  ruIngredients: string[];
  ruSteps: string[];
  blobImage: string; // local blob URL — prints reliably
}

const MEAL_TYPES: { type: MealType; label: string }[] = [
  { type: 'breakfast', label: 'Завтрак' },
  { type: 'lunch',     label: 'Обед'    },
  { type: 'dinner',    label: 'Ужин'    },
];

async function toBlobUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    if (!res.ok) return url;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
  } catch {
    return url;
  }
}

export function PdfPreviewPage() {
  const navigate = useNavigate();
  const { days } = useMealPlan();
  const [fullRecipes, setFullRecipes] = useState<FullRecipe[]>([]);
  const [status, setStatus] = useState<'loading' | 'done' | 'error'>('loading');
  const [progress, setProgress] = useState('');
  const blobUrls = useRef<string[]>([]);

  // Clean up blob URLs on unmount
  useEffect(() => {
    const urls = blobUrls.current;
    return () => urls.forEach((u) => { if (u.startsWith('blob:')) URL.revokeObjectURL(u); });
  }, []);

  useEffect(() => {
    const seen = new Map<number, Recipe>();
    days.forEach((day) => {
      MEAL_TYPES.forEach(({ type }) => {
        day.meals[type].forEach((r) => { if (!seen.has(r.id)) seen.set(r.id, r); });
      });
    });

    const ids = Array.from(seen.keys());
    if (ids.length === 0) { setStatus('done'); return; }

    (async () => {
      try {
        setProgress('Загружаем рецепты…');
        const details = await Promise.all(ids.map((id) => getRecipeById(id)));

        setProgress('Переводим на русский…');
        const allTitles      = details.map((r) => r.title);
        const allIngredients = details.map((r) =>
          (r.extendedIngredients ?? []).map((i) => i.original)
        );
        const allSteps = details.map((r) =>
          (r.analyzedInstructions?.[0]?.steps ?? []).map((s) => s.step)
        );

        const [ruTitles, ...restIngAndSteps] = await Promise.all([
          enToRu(allTitles),
          ...details.flatMap((_, i) => [
            enToRu(allIngredients[i]),
            enToRu(allSteps[i]),
          ]),
        ]);

        setProgress('Загружаем фотографии…');
        const imageUrls = await Promise.all(details.map((r) => toBlobUrl(r.image)));
        blobUrls.current = imageUrls.filter((u) => u.startsWith('blob:'));

        const result: FullRecipe[] = details.map((r, i) => ({
          ...r,
          ruTitle:       ruTitles[i],
          ruIngredients: restIngAndSteps[i * 2],
          ruSteps:       restIngAndSteps[i * 2 + 1],
          blobImage:     imageUrls[i],
        }));

        setFullRecipes(result);
        setStatus('done');
      } catch {
        setStatus('error');
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const recipeById = (id: number) => fullRecipes.find((r) => r.id === id);

  return (
    <div className="pdf-wrap">
      {/* Toolbar — hidden in print */}
      <div className="pdf-toolbar no-print">
        <button className="pdf-toolbar__back" onClick={() => navigate(-1)}>← Назад</button>
        <span className="pdf-toolbar__title">Предпросмотр PDF</span>
        <button
          className="pdf-toolbar__print pdf-btn"
          onClick={() => window.print()}
          disabled={status !== 'done'}
        >
          <svg viewBox="0 0 20 20" fill="none" width="15" height="15">
            <path d="M10 3v9m0 0l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 14v1a2 2 0 002 2h10a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Сохранить PDF
        </button>
      </div>

      {status === 'loading' && (
        <div className="pdf-loading no-print">
          <div className="pdf-loading__spinner" />
          <p>{progress}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="pdf-loading no-print">
          <p style={{ color: '#c0392b' }}>Ошибка загрузки. Проверьте лимит API.</p>
        </div>
      )}

      {status === 'done' && (
        <>
          {/* ── Page 1: Meal plan overview ── */}
          <div className="pdf-page">
            <h1 className="pdf-page__title">План питания</h1>

            <table className="pdf-plan-table">
              <thead>
                <tr>
                  <th className="pdf-plan-table__day-h">День</th>
                  {MEAL_TYPES.map(({ type, label }) => (
                    <th key={type} className={`pdf-plan-table__meal-h pdf-plan-table__meal-h--${type}`}>
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day) => (
                  <tr key={day.id}>
                    <td className="pdf-plan-table__day-cell">{day.label}</td>
                    {MEAL_TYPES.map(({ type }) => (
                      <td key={type} className={`pdf-plan-table__meal-cell pdf-plan-table__meal-cell--${type}`}>
                        {day.meals[type].map((r) => {
                          const full = recipeById(r.id);
                          return (
                            <div key={r.id} className="pdf-plan-item">
                              <span className="pdf-plan-item__dot" />
                              <span>{full?.ruTitle ?? r.title}</span>
                              {r.readyInMinutes && (
                                <span className="pdf-plan-item__time">{r.readyInMinutes} мин</span>
                              )}
                            </div>
                          );
                        })}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── Pages 2+: One page per unique recipe ── */}
          {fullRecipes.map((recipe) => (
            <div key={recipe.id} className="pdf-page pdf-page--recipe">
              <div className="pdf-recipe__hero">
                <div className="pdf-recipe__hero-text">
                  <h2 className="pdf-recipe__title">{recipe.ruTitle}</h2>
                  <div className="pdf-recipe__meta">
                    {recipe.readyInMinutes && <span>⏱ {recipe.readyInMinutes} мин</span>}
                    {recipe.servings && <span>🍽 {recipe.servings} порций</span>}
                  </div>
                </div>
                <img
                  src={recipe.blobImage}
                  alt={recipe.ruTitle}
                  className="pdf-recipe__img"
                />
              </div>

              <div className="pdf-recipe__body">
                {recipe.extendedIngredients && recipe.extendedIngredients.length > 0 && (
                  <section className="pdf-recipe__section">
                    <h3>Ингредиенты</h3>
                    <ul>
                      {recipe.extendedIngredients.map((ing, i) => (
                        <li key={ing.id}>{recipe.ruIngredients[i] ?? ing.original}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0 && (
                  <section className="pdf-recipe__section pdf-recipe__section--steps">
                    <h3>Приготовление</h3>
                    <ol>
                      {recipe.analyzedInstructions[0].steps.map((step, i) => (
                        <li key={step.number}>{recipe.ruSteps[i] ?? step.step}</li>
                      ))}
                    </ol>
                  </section>
                )}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
