import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ProductProvider } from './context/ProductContext';
import AppRoutes from './routes/AppRoutes';

// Global Styles
import './styles/index.css';

/**
 * EarnFlow - Main App Component
 */
function App() {
  return (
    <BrowserRouter>
      <ProductProvider>
        <AppRoutes />
      </ProductProvider>
    </BrowserRouter>
  );
}

export default App;