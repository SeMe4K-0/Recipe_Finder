# Recipe Finder

Веб-приложение для поиска рецептов на русском языке с планировщиком питания и экспортом в PDF.


Деплой доступен по ссылке https://recipe-finder-pearl-psi.vercel.app/search

---

## Стек

| Слой | Технологии |
|------|-----------|
| Фреймворк | React 18, Create React App, TypeScript |
| Маршрутизация | React Router v6 (URL-синхронизированное состояние) |
| Стили | CSS Custom Properties, Inter + Fraunces (Google Fonts) |
| API рецептов | Spoonacular REST API |
| Перевод | Google Translate (неофициальный клиент `gtx`) |
| PDF | `window.print()` + `@media print` CSS |
| Хранение | `localStorage` (план питания, кэш API), `sessionStorage` (кэш переводов) |

---

## Реализованный функционал

### Поиск рецептов
- Поиск на **русском языке** — запрос автоматически переводится EN→RU перед отправкой в Spoonacular
- Названия карточек переводятся обратно RU→EN и отображаются на русском
- **Дебаунс** 500 мс, чтобы не спамить API при наборе
- Фильтрация по диете и кухне с **множественным выбором** — кастомный `DropdownMultiSelect`
- Состояние поиска и фильтров синхронизировано с URL (`?q=паста&diet=vegan`) — ссылки работают и сохраняются в истории браузера
- Скелетон-анимация во время загрузки
- Пагинация (12 рецептов на страницу)
- Кэш API ответов в `localStorage` с TTL 6 часов — экономия лимита 150 запросов/день


### Экспорт в PDF
- Кнопка «Скачать PDF» открывает страницу **предпросмотра** (`/pdf-preview`)
- На странице последовательно выполняется:
  1. Загрузка полных данных всех уникальных рецептов из плана через Spoonacular API
  2. Перевод всех названий, ингредиентов и шагов на русский язык
  3. Загрузка фотографий как **blob URL** (решает проблему CORS при печати)
- Итоговый документ:
  - **Страница 1** — сводная таблица плана питания с названиями блюд и временем
  - **Страницы 2+** — по одной странице на каждый уникальный рецепт: фото, ингредиенты, нумерованные шаги
- Нажатие «Сохранить PDF» вызывает `window.print()` — браузер рендерит документ нативно, кириллица и изображения отображаются корректно

---

## Архитектура

```
src/
├── api/
│   ├── spoonacular.ts      # Запросы к Spoonacular + localStorage кэш
│   └── translate.ts        # Google Translate gtx + sessionStorage кэш
├── components/
│   ├── Navbar.tsx
│   ├── RecipeCard.tsx       # Variant B — оверлей + пилюля времени
│   ├── Filters.tsx
│   ├── DropdownMultiSelect.tsx  # Кастомный мультиселект
│   ├── AddToMealPlanModal.tsx   # Сетка 7×3
│   └── Pagination.tsx
├── hooks/
│   ├── useRecipes.ts       # Поиск + URL-синхронизация + перевод заголовков
│   ├── useMealPlan.ts      # CRUD плана питания + localStorage
│   └── useDebounce.ts
├── pages/
│   ├── SearchPage.tsx
│   ├── RecipePage.tsx      # 2-кол. макет + перевод ингредиентов/шагов
│   ├── MealPlanPage.tsx    # Таблица 7×3
│   └── PdfPreviewPage.tsx  # Предпросмотр + экспорт PDF
├── types/
│   └── index.ts            # Recipe, MealPlanDay, MealType
├── utils/
│   ├── exportPDF.ts        # window.print()
│   └── i18n.ts             # Словари диет и кухонь RU
└── index.css               # Дизайн-система (CSS Custom Properties)
```

---

## Дизайн-система

| Токен | Значение |
|-------|---------|
| `--bg` | `#f5f2ec` — тёплый бежевый фон |
| `--surface` | `#fafaf7` — поверхность карточек |
| `--accent-breakfast` | `#c7a14a` — золотой (завтрак) |
| `--accent-lunch` | `#5a7d4f` — зелёный (обед) |
| `--accent-dinner` | `#3b5a8a` — синий (ужин) |

Основной шрифт — **Inter**, заголовки рецептов — **Fraunces** (оптическая засечка).

---

## Запуск

```bash
# Установка зависимостей
npm install

# Добавить ключ Spoonacular в .env
echo "REACT_APP_SPOONACULAR_API_KEY=ваш_ключ" >> .env
echo "REACT_APP_SPOONACULAR_BASE_URL=https://api.spoonacular.com" >> .env

# Запуск в режиме разработки
npm start

# Сборка для продакшна
npm run build
```

Получить бесплатный API ключ: [spoonacular.com/food-api](https://spoonacular.com/food-api) (150 запросов/день, результаты кэшируются на 6 часов).
