import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/journal" replace />} />
        <Route path="/:view" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
