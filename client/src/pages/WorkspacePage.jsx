import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DragDropContext } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import { workspaceApi, taskApi, activityApi } from '../api';
import useAuthStore from '../context/authStore';
import useWorkspaceStore from '../context/workspaceStore';
import useSocket from '../hooks/useSocket';
import useTaskFilters from '../hooks/useTaskFilters';
import TaskBoard from '../components/tasks/TaskBoard';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskForm from '../components/tasks/TaskForm';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import MembersList from '../components/workspace/MembersList';
import Spinner from '../components/ui/Spinner';

const COLUMNS = ['backlog', 'in-progress', 'review', 'completed'];

const WorkspacePage = () => {
  const { workspaceId } = useParams();
  const { user } = useAuthStore();
  const { setActiveWorkspace } = useWorkspaceStore();
  const qc = useQueryClient();
  const socket = useSocket();

  const [taskFormOpen, setTaskFormOpen] = useState(false);
  const [taskFormDefaults, setTaskFormDefaults] = useState({});
  const [taskLoading, setTaskLoading] = useState(false);
  const [rightPanel, setRightPanel] = useState('activity'); // 'activity' | 'members'

  const { filters, setFilter, resetFilters, activeCount } = useTaskFilters();

  const { data: wsData, isLoading: wsLoading } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: () => workspaceApi.getOne(workspaceId).then((r) => r.data.workspace),
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', workspaceId, filters],
    queryFn: () => {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.assignedTo) params.assignedTo = filters.assignedTo;
      if (filters.tag) params.tag = filters.tag;
      if (filters.sort) params.sort = filters.sort;
      return taskApi.getAll(workspaceId, params).then((r) => r.data.tasks);
    },
  });

  const { data: activity = [], isLoading: actLoading } = useQuery({
    queryKey: ['activity', workspaceId],
    queryFn: () =>
      activityApi.getWorkspaceActivity(workspaceId, { limit: 20 }).then((r) => r.data.activity),
  });

  useEffect(() => {
    if (wsData) setActiveWorkspace(wsData);
  }, [wsData]);

  // socket room join + live event handlers
  useEffect(() => {
    if (!socket || !workspaceId) return;

    socket.emit('workspace:join', workspaceId);

    const invalidateTasks = () => qc.invalidateQueries({ queryKey: ['tasks', workspaceId] });
    const invalidateActivity = () => qc.invalidateQueries({ queryKey: ['activity', workspaceId] });

    socket.on('task:created', invalidateTasks);
    socket.on('task:updated', invalidateTasks);
    socket.on('task:deleted', invalidateTasks);
    socket.on('task:reordered', invalidateTasks);
    socket.on('workspace:member_joined', () => {
      qc.invalidateQueries({ queryKey: ['workspace', workspaceId] });
    });

    // refresh activity on task events
    socket.on('task:created', invalidateActivity);
    socket.on('task:updated', invalidateActivity);
    socket.on('task:deleted', invalidateActivity);

    return () => {
      socket.emit('workspace:leave', workspaceId);
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
      socket.off('task:reordered');
      socket.off('workspace:member_joined');
    };
  }, [socket, workspaceId]);

  const openNewTask = (status = 'backlog') => {
    setTaskFormDefaults({ status, priority: 'medium' });
    setTaskFormOpen(true);
  };

  const handleCreateTask = async (data) => {
    setTaskLoading(true);
    try {
      await taskApi.create(workspaceId, data);
      setTaskFormOpen(false);
      qc.invalidateQueries({ queryKey: ['tasks', workspaceId] });
      toast.success('Task created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setTaskLoading(false);
    }
  };

  const handleDragEnd = useCallback(
    async (result) => {
      const { destination, source, draggableId } = result;
      if (!destination) return;
      if (destination.droppableId === source.droppableId && destination.index === source.index)
        return;

      const newStatus = destination.droppableId;
      const taskId = draggableId;

      // optimistic update
      qc.setQueryData(['tasks', workspaceId, filters], (old = []) =>
        old.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );

      try {
        await taskApi.update(workspaceId, taskId, { status: newStatus });
      } catch {
        toast.error('Could not move task');
        qc.invalidateQueries({ queryKey: ['tasks', workspaceId] });
      }
    },
    [workspaceId, filters, qc]
  );

  if (wsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size={5} />
      </div>
    );
  }

  if (!wsData) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted">Workspace not found</p>
      </div>
    );
  }

  const members = wsData.members || [];

  return (
    <div className="flex h-full">
      {/* main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* workspace header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: wsData.themeColor + '20',
                color: wsData.themeColor,
              }}
            >
              {wsData.name[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-sm font-semibold text-zinc-100">{wsData.name}</h1>
              {wsData.description && (
                <p className="text-2xs text-muted">{wsData.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xs text-muted">
              {members.length} {members.length === 1 ? 'member' : 'members'}
            </span>
            <Link
              to={`/workspace/${workspaceId}/settings`}
              className="btn-ghost text-xs px-2 py-1"
            >
              Settings
            </Link>
            <button className="btn-primary text-xs" onClick={() => openNewTask()}>
              + New task
            </button>
          </div>
        </div>

        {/* filters */}
        <div className="px-5 py-2.5 border-b border-border shrink-0 overflow-x-auto">
          <TaskFilters
            filters={filters}
            setFilter={setFilter}
            resetFilters={resetFilters}
            activeCount={activeCount}
            members={members}
          />
        </div>

        {/* board */}
        <div className="flex-1 overflow-auto pt-4">
          {tasksLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size={5} />
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <TaskBoard tasks={tasks} onAddTask={openNewTask} />
            </DragDropContext>
          )}
        </div>
      </div>

      {/* right panel */}
      <div className="w-64 shrink-0 border-l border-border flex flex-col bg-surface-1">
        <div className="flex border-b border-border">
          {['activity', 'members'].map((panel) => (
            <button
              key={panel}
              onClick={() => setRightPanel(panel)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                rightPanel === panel
                  ? 'text-zinc-100 border-b-2 border-blue-500'
                  : 'text-muted hover:text-zinc-300'
              }`}
            >
              {panel.charAt(0).toUpperCase() + panel.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {rightPanel === 'activity' ? (
            <ActivityFeed activity={activity} loading={actLoading} compact />
          ) : (
            <MembersList members={members} />
          )}
        </div>
        {/* invite code */}
        <div className="border-t border-border px-4 py-3">
          <p className="text-2xs text-muted mb-1">Invite code</p>
          <code className="text-xs font-mono text-zinc-300 bg-surface-2 px-2 py-1 rounded block tracking-widest">
            {wsData.inviteCode}
          </code>
        </div>
      </div>

      <TaskForm
        open={taskFormOpen}
        onClose={() => setTaskFormOpen(false)}
        onSubmit={handleCreateTask}
        defaultValues={taskFormDefaults}
        members={members}
        loading={taskLoading}
      />
    </div>
  );
};

export default WorkspacePage;
