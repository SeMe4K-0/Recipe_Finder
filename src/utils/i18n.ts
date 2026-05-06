const DIETS: Record<string, string> = {
  'gluten free': 'Без глютена',
  'dairy free': 'Без молочного',
  'vegetarian': 'Вегетарианская',
  'lacto ovo vegetarian': 'Вегетарианская',
  'vegan': 'Веганская',
  'ketogenic': 'Кетогенная',
  'paleo': 'Палео',
  'primal': 'Примальная',
  'pescetarian': 'Пескетарианская',
  'whole30': 'Whole30',
  'fodmap friendly': 'FODMAP',
  'low fodmap': 'Низкий FODMAP',
};

const CUISINES: Record<string, string> = {
  'mediterranean': 'Средиземноморская',
  'italian': 'Итальянская',
  'european': 'Европейская',
  'eastern european': 'Восточноевропейская',
  'american': 'Американская',
  'mexican': 'Мексиканская',
  'asian': 'Азиатская',
  'chinese': 'Китайская',
  'japanese': 'Японская',
  'indian': 'Индийская',
  'thai': 'Тайская',
  'korean': 'Корейская',
  'vietnamese': 'Вьетнамская',
  'greek': 'Греческая',
  'spanish': 'Испанская',
  'french': 'Французская',
  'british': 'Британская',
  'irish': 'Ирландская',
  'middle eastern': 'Ближневосточная',
  'african': 'Африканская',
  'caribbean': 'Карибская',
  'nordic': 'Скандинавская',
  'cajun': 'Каджунская',
  'jewish': 'Еврейская',
};

export function translateDiet(diet: string): string {
  return DIETS[diet.toLowerCase()] ?? diet;
}

export function translateCuisine(cuisine: string): string {
  return CUISINES[cuisine.toLowerCase()] ?? cuisine;
}
