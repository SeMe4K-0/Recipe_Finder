import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { SearchPage } from './pages/SearchPage';
import { RecipePage } from './pages/RecipePage';
import { MealPlanPage } from './pages/MealPlanPage';
import { PdfPreviewPage } from './pages/PdfPreviewPage';

function Layout() {
  const { pathname } = useLocation();
  const hideNavbar = pathname === '/pdf-preview';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Navigate to="/search" replace />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/recipe/:id" element={<RecipePage />} />
        <Route path="/meal-plan" element={<MealPlanPage />} />
        <Route path="/pdf-preview" element={<PdfPreviewPage />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
