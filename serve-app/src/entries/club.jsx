import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ClubSurface from '../surfaces/ClubSurface';
import '../index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClubSurface />
  </StrictMode>
);
