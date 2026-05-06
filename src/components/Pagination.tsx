import React from 'react';
import { RECIPES_PER_PAGE } from '../api/spoonacular';

interface Props {
  page: number;
  totalResults: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalResults, onPageChange }: Props) {
  const totalPages = Math.ceil(totalResults / RECIPES_PER_PAGE);

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        ←
      </button>
      <span>
        {page} / {totalPages}
      </span>
      <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        →
      </button>
    </div>
  );
}
