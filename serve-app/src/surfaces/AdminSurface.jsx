// AdminSurface.jsx — the academy-owner desktop console, full width.

import DesktopFrame from '../desktop/DesktopFrame';
import AdminConsole from '../desktop/admin/AdminConsole';

export default function AdminSurface() {
  return (
    <DesktopFrame>
      <AdminConsole />
    </DesktopFrame>
  );
}
