import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { GolfProvider } from './context/GolfContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <GolfProvider>
        <App />
      </GolfProvider>
    </AuthProvider>
  </StrictMode>
);
