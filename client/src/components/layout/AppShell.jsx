import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const AppShell = () => (
  <div className="flex h-screen overflow-hidden bg-surface-0">
    <Sidebar />
    <main className="flex-1 overflow-y-auto">
      <Outlet />
    </main>
  </div>
);

export default AppShell;
