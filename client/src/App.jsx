import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './context/authStore';
import useWorkspaceStore from './context/workspaceStore';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AppShell from './components/layout/AppShell';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WorkspacePage from './pages/WorkspacePage';
import TaskDetail from './pages/TaskDetail';
import NewWorkspace from './pages/NewWorkspace';
import JoinWorkspace from './pages/JoinWorkspace';
import WorkspaceSettings from './pages/WorkspaceSettings';
import Settings from './pages/Settings';

const App = () => {
  const { fetchMe, user } = useAuthStore();
  const { fetchWorkspaces } = useWorkspaceStore();

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    if (user) fetchWorkspaces();
  }, [user]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="workspaces/new" element={<NewWorkspace />} />
          <Route path="workspaces/join" element={<JoinWorkspace />} />
          <Route path="workspace/:workspaceId" element={<WorkspacePage />} />
          <Route path="workspace/:workspaceId/task/:taskId" element={<TaskDetail />} />
          <Route path="workspace/:workspaceId/settings" element={<WorkspaceSettings />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
