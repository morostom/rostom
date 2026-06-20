import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AdminSurface from '../surfaces/AdminSurface';
import '../index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AdminSurface />
  </StrictMode>
);
