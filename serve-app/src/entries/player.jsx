import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import PlayerApp from '../surfaces/PlayerApp';
import '../index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PlayerApp />
  </StrictMode>
);
