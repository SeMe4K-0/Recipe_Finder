import React from 'react';
import { NavLink } from 'react-router-dom';

export function Navbar() {
  return (
    <nav className="navbar">
      <NavLink to="/search" className="navbar__brand">
        <img src="/logo.png" alt="Поиск рецептов" className="navbar__logo" />
      </NavLink>
      <NavLink to="/search" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
        Поиск рецептов
      </NavLink>
      <NavLink to="/meal-plan" className={({ isActive }) => isActive ? 'navbar__link navbar__link--active' : 'navbar__link'}>
        План питания
      </NavLink>
    </nav>
  );
}
