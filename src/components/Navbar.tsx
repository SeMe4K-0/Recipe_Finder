import React from 'react';
import { NavLink } from 'react-router-dom';

export function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/search" className="navbar__brand" aria-label="Главная">
        <img src="/logo.png" alt="" className="navbar__logo" />
      </NavLink>
      <NavLink
        to="/search"
        className={({ isActive }) => 'navbar__link' + (isActive ? ' navbar__link--active' : '')}
      >
        Поиск рецептов
      </NavLink>
      <NavLink
        to="/meal-plan"
        className={({ isActive }) => 'navbar__link' + (isActive ? ' navbar__link--active' : '')}
      >
        План питания
      </NavLink>
    </nav>
  );
}
