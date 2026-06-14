import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import DailyCrypt from './migraine/DailyCrypt';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DailyCrypt />
  </StrictMode>
);
