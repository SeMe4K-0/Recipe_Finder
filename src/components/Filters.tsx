import React from 'react';
import { DropdownMultiSelect } from './DropdownMultiSelect';

interface Props {
  diets: string[];
  cuisines: string[];
  onDietsChange: (d: string[]) => void;
  onCuisinesChange: (c: string[]) => void;
}

const DIET_OPTIONS = [
  { value: 'vegetarian', label: 'Вегетарианская' },
  { value: 'vegan', label: 'Веганская' },
  { value: 'glutenFree', label: 'Без глютена' },
  { value: 'ketogenic', label: 'Кето' },
  { value: 'paleo', label: 'Палео' },
  { value: 'dairyFree', label: 'Без молочного' },
];

const CUISINE_OPTIONS = [
  { value: 'italian', label: 'Итальянская' },
  { value: 'mexican', label: 'Мексиканская' },
  { value: 'asian', label: 'Азиатская' },
  { value: 'american', label: 'Американская' },
  { value: 'french', label: 'Французская' },
  { value: 'mediterranean', label: 'Средиземноморская' },
  { value: 'chinese', label: 'Китайская' },
  { value: 'japanese', label: 'Японская' },
  { value: 'indian', label: 'Индийская' },
  { value: 'greek', label: 'Греческая' },
];

export function Filters({ diets, cuisines, onDietsChange, onCuisinesChange }: Props) {
  return (
    <div className="filters">
      <DropdownMultiSelect
        placeholder="Диета"
        options={DIET_OPTIONS}
        selected={diets}
        onChange={onDietsChange}
      />
      <DropdownMultiSelect
        placeholder="Кухня"
        options={CUISINE_OPTIONS}
        selected={cuisines}
        onChange={onCuisinesChange}
      />
    </div>
  );
}
