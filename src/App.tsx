import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { SearchPage } from './pages/SearchPage';
import { RecipePage } from './pages/RecipePage';
import { MealPlanPage } from './pages/MealPlanPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/search" replace />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/recipe/:id" element={<RecipePage />} />
        <Route path="/meal-plan" element={<MealPlanPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
