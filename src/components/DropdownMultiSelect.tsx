import React, { useState, useRef, useEffect } from 'react';

interface Option {
  value: string;
  label: string;
}

interface Props {
  placeholder: string;
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
}

export function DropdownMultiSelect({ placeholder, options, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onOutsideClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onOutsideClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onOutsideClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  function toggle(value: string) {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value]
    );
  }

  const label =
    selected.length === 0
      ? placeholder
      : selected.length === 1
      ? options.find((o) => o.value === selected[0])?.label ?? placeholder
      : `${placeholder} · ${selected.length}`;

  const isActive = selected.length > 0;

  return (
    <div className="dropdown" ref={ref}>
      <button
        className={[
          'dropdown__trigger',
          open ? 'dropdown__trigger--open' : '',
          isActive ? 'dropdown__trigger--active' : '',
        ].join(' ')}
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        <span>{label}</span>
        <svg
          className="dropdown__chevron"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="dropdown__panel">
          {options.map((opt) => {
            const checked = selected.includes(opt.value);
            return (
              <button
                key={opt.value}
                className={`dropdown__option${checked ? ' dropdown__option--selected' : ''}`}
                onClick={() => toggle(opt.value)}
                type="button"
              >
                <span className="dropdown__check">
                  {checked && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </span>
                {opt.label}
              </button>
            );
          })}
          {isActive && (
            <>
              <div className="dropdown__divider" />
              <button className="dropdown__clear" onClick={() => onChange([])} type="button">
                Сбросить
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
