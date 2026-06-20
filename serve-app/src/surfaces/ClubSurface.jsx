// ClubSurface.jsx — the club-coordinator (coach) desktop console in a Chrome
// window frame.

import DesktopFrame from '../desktop/DesktopFrame';
import ChromeWindow from '../components/ChromeWindow';
import CoachConsole from '../desktop/coach/CoachConsole';

export default function ClubSurface() {
  return (
    <DesktopFrame>
      <ChromeWindow tabs={[{ title: 'SERVE · Coach console' }]} url="club.serve.app/hsc">
        <CoachConsole />
      </ChromeWindow>
    </DesktopFrame>
  );
}
