// App.jsx — the combined dev surface: a switcher to flip between the player app
// and the two desktop consoles. Each surface is also exported as its own
// standalone HTML build (see src/entries/*).

import { useState } from 'react';
import SurfaceSwitcher from './components/SurfaceSwitcher';
import PlayerApp from './surfaces/PlayerApp';
import AdminSurface from './surfaces/AdminSurface';
import ClubSurface from './surfaces/ClubSurface';

export default function App() {
  const [surface, setSurface] = useState('app');

  return (
    <>
      <SurfaceSwitcher surface={surface} onChange={setSurface} />
      {surface === 'app' && <PlayerApp />}
      {surface === 'admin' && <AdminSurface />}
      {surface === 'coach' && <ClubSurface />}
    </>
  );
}
