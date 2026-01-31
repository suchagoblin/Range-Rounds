import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { GolfProvider } from './context/GolfContext';
import ErrorBoundary from './components/ErrorBoundary';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <GolfProvider>
          <App />
        </GolfProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
