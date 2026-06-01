import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format, isToday, isTomorrow } from 'date-fns';
import useAuthStore from '../context/authStore';
import useWorkspaceStore from '../context/workspaceStore';
import { taskApi, activityApi, userApi } from '../api';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import WorkspaceCard from '../components/workspace/WorkspaceCard';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import { priorityMeta, statusMeta, formatDate, isOverdue } from '../utils';

const Dashboard = () => {
  const { user } = useAuthStore();
  const { workspaces, fetchWorkspaces, loading: wsLoading } = useWorkspaceStore();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const { data: statsData } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => userApi.getStats().then((r) => r.data.stats),
  });

  // collect tasks due today across all workspaces
  const { data: todayTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['dashboard-today-tasks', workspaces.map((w) => w._id).join(',')],
    enabled: workspaces.length > 0,
    queryFn: async () => {
      const results = await Promise.all(
        workspaces.map((ws) =>
          taskApi
            .getAll(ws._id, { assignedTo: user._id, sort: 'dueDate' })
            .then((r) => r.data.tasks.map((t) => ({ ...t, workspaceName: ws.name })))
            .catch(() => [])
        )
      );
      const all = results.flat();
      return all.filter(
        (t) => t.dueDate && isToday(new Date(t.dueDate)) && t.status !== 'completed'
      );
    },
  });

  // recent activity from first workspace for now
  const firstWs = workspaces[0];
  const { data: activityData, isLoading: actLoading } = useQuery({
    queryKey: ['activity', firstWs?._id],
    enabled: !!firstWs,
    queryFn: () =>
      activityApi.getWorkspaceActivity(firstWs._id, { limit: 8 }).then((r) => r.data.activity),
  });

  const stats = statsData || { total: 0, completed: 0, inProgress: 0, overdue: 0 };

  return (
    <div className="max-w-5xl mx-auto px-5 py-6">
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-base font-semibold text-zinc-100">
            {greeting()}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-xs text-muted mt-0.5">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/workspaces/new" className="btn-ghost text-xs">
            New workspace
          </Link>
          <Link to="/workspaces/join" className="btn-ghost text-xs">
            Join workspace
          </Link>
        </div>
      </div>

      {/* stat row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total assigned', value: stats.total },
          { label: 'In progress', value: stats.inProgress },
          { label: 'Completed', value: stats.completed },
          { label: 'Overdue', value: stats.overdue, warn: stats.overdue > 0 },
        ].map(({ label, value, warn }) => (
          <div key={label} className="card px-4 py-3">
            <p className={`text-xl font-semibold ${warn ? 'text-red-400' : 'text-zinc-100'}`}>
              {value}
            </p>
            <p className="text-2xs text-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* left col */}
        <div className="col-span-2 space-y-5">
          {/* due today */}
          <section>
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
              Due today
            </h2>
            <div className="card divide-y divide-border">
              {tasksLoading ? (
                <div className="flex justify-center py-6"><Spinner /></div>
              ) : todayTasks.length === 0 ? (
                <p className="text-xs text-muted text-center py-6">Nothing due today</p>
              ) : (
                todayTasks.map((task) => (
                  <DueTodayRow key={task._id} task={task} />
                ))
              )}
            </div>
          </section>

          {/* workspaces */}
          <section>
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
              Workspaces
            </h2>
            {wsLoading ? (
              <div className="flex justify-center py-6"><Spinner /></div>
            ) : workspaces.length === 0 ? (
              <div className="card p-5 text-center">
                <p className="text-xs text-muted mb-3">No workspaces yet</p>
                <Link to="/workspaces/new" className="btn-primary text-xs">
                  Create your first workspace
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {workspaces.map((ws) => (
                  <WorkspaceCard key={ws._id} workspace={ws} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* right col — activity */}
        <div>
          <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">
            Recent activity
          </h2>
          <div className="card px-4">
            <ActivityFeed activity={activityData || []} loading={actLoading} compact />
          </div>
        </div>
      </div>
    </div>
  );
};

const DueTodayRow = ({ task }) => {
  const priority = priorityMeta[task.priority];
  return (
    <Link
      to={`/workspace/${task.workspace}/task/${task._id}`}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-2 transition-colors"
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusMeta[task.status]?.dot}`} />
      <p className="text-xs text-zinc-300 flex-1 truncate">{task.title}</p>
      <span className="text-2xs text-muted shrink-0">{task.workspaceName}</span>
      <span className={`badge ${priority?.bg} shrink-0`}>{priority?.label}</span>
    </Link>
  );
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

export default Dashboard;
