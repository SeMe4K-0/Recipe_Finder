import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Recipe } from '../types';

interface Props {
  id: string;
  recipe: Recipe;
  onRemove: () => void;
}

export function SortableRecipeItem({ id, recipe, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div className="sortable-recipe-item" ref={setNodeRef} style={style}>
      <div className="sortable-recipe-item__drag-handle" {...attributes} {...listeners}>
        ⠿
      </div>
      <img src={recipe.image} alt={recipe.title} />
      <span>{recipe.title}</span>
      <button className="sortable-recipe-item__remove" onClick={onRemove} title="Удалить">
        ✕
      </button>
    </div>
  );
}
