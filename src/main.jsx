import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import './styles/global.css';
import './styles/features.css';
import './styles/locations.css';
import './styles/theme.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <LanguageProvider><App /></LanguageProvider>
    </AuthProvider>
  </React.StrictMode>,
);
