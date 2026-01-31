import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { GolfProvider } from './context/GolfContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GolfProvider>
      <App />
    </GolfProvider>
  </StrictMode>
);
