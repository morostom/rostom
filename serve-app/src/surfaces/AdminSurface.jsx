// AdminSurface.jsx — the academy-owner desktop console in a Chrome window frame.

import DesktopFrame from '../desktop/DesktopFrame';
import ChromeWindow from '../components/ChromeWindow';
import AdminConsole from '../desktop/admin/AdminConsole';

export default function AdminSurface() {
  return (
    <DesktopFrame>
      <ChromeWindow tabs={[{ title: 'SERVE · Academy admin' }]} url="admin.serve.app/apex">
        <AdminConsole />
      </ChromeWindow>
    </DesktopFrame>
  );
}
