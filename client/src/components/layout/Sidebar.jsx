import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useAuthStore from '../../context/authStore';
import useWorkspaceStore from '../../context/workspaceStore';
import Avatar from '../ui/Avatar';
import { disconnectSocket } from '../../hooks/useSocket';

const Sidebar = () => {
  const { workspaceId } = useParams();
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { workspaces, activeWorkspace } = useWorkspaceStore();

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`${
        collapsed ? 'w-12' : 'w-52'
      } shrink-0 bg-surface-1 border-r border-border flex flex-col h-screen sticky top-0 transition-all duration-200`}
    >
      {/* header */}
      <div className="flex items-center justify-between px-3 h-12 border-b border-border">
        {!collapsed && (
          <Link to="/dashboard" className="text-sm font-semibold text-zinc-100 tracking-tight">
            TaskFlow
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-muted hover:text-zinc-300 transition-colors ml-auto"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>

      {/* nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        <NavItem to="/dashboard" icon={DashIcon} label="Dashboard" collapsed={collapsed} />

        {!collapsed && (
          <div className="px-3 mt-4 mb-1">
            <span className="text-2xs text-muted uppercase tracking-widest font-medium">
              Workspaces
            </span>
          </div>
        )}

        {workspaces.map((ws) => (
          <NavItem
            key={ws._id}
            to={`/workspace/${ws._id}`}
            label={ws.name}
            collapsed={collapsed}
            active={ws._id === workspaceId}
            dot={ws.themeColor}
          />
        ))}

        {!collapsed && (
          <Link
            to="/workspaces/new"
            className="flex items-center gap-2 px-3 py-1.5 mx-1 mt-1 text-xs text-muted hover:text-zinc-300 hover:bg-surface-3 rounded transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New workspace
          </Link>
        )}
      </nav>

      {/* footer */}
      <div className="border-t border-border p-2">
        {!collapsed ? (
          <div className="flex items-center gap-2 px-1">
            <Avatar name={user?.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-zinc-300 truncate">{user?.name}</p>
              <p className="text-2xs text-muted truncate">{user?.email}</p>
            </div>
            <Link to="/settings" className="text-muted hover:text-zinc-300" title="Settings">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </Link>
            <button onClick={handleLogout} className="text-muted hover:text-red-400" title="Logout">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Avatar name={user?.name} size="sm" />
          </div>
        )}
      </div>
    </aside>
  );
};

const NavItem = ({ to, icon: Icon, label, collapsed, active, dot }) => (
  <Link
    to={to}
    className={`flex items-center gap-2 px-3 py-1.5 mx-1 rounded text-xs transition-colors ${
      active
        ? 'bg-surface-3 text-zinc-100'
        : 'text-zinc-400 hover:text-zinc-200 hover:bg-surface-2'
    }`}
    title={collapsed ? label : undefined}
  >
    {dot ? (
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dot }} />
    ) : Icon ? (
      <Icon className="w-4 h-4 shrink-0" />
    ) : null}
    {!collapsed && <span className="truncate">{label}</span>}
  </Link>
);

const DashIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

export default Sidebar;
