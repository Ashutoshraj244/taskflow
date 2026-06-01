import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { taskApi } from '../api';
import TaskForm from '../components/tasks/TaskForm';
import Avatar from '../components/ui/Avatar';
import Spinner from '../components/ui/Spinner';
import { priorityMeta, statusMeta, formatDate, isOverdue, timeAgo } from '../utils';

const TaskDetail = () => {
  const { workspaceId, taskId } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => taskApi.getOne(workspaceId, taskId).then((r) => r.data.task),
  });

  const handleEdit = async (data) => {
    setEditLoading(true);
    try {
      await taskApi.update(workspaceId, taskId, data);
      qc.invalidateQueries({ queryKey: ['task', taskId] });
      qc.invalidateQueries({ queryKey: ['tasks', workspaceId] });
      setEditOpen(false);
      toast.success('Task updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await taskApi.delete(workspaceId, taskId);
      qc.invalidateQueries({ queryKey: ['tasks', workspaceId] });
      navigate(`/workspace/${workspaceId}`);
      toast.success('Task deleted');
    } catch (err) {
      toast.error('Delete failed');
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size={5} />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-muted">Task not found</p>
      </div>
    );
  }

  const priority = priorityMeta[task.priority];
  const status = statusMeta[task.status];
  const due = task.dueDate ? formatDate(task.dueDate) : null;
  const overdue = isOverdue(task.dueDate) && task.status !== 'completed';

  return (
    <div className="max-w-2xl mx-auto px-5 py-6">
      {/* breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted mb-5">
        <button
          onClick={() => navigate(`/workspace/${workspaceId}`)}
          className="hover:text-zinc-300 transition-colors"
        >
          ← Back to board
        </button>
      </div>

      <div className="card p-6">
        {/* header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`badge ${priority?.bg}`}>{priority?.label}</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${status?.dot}`} />
              <span className="text-xs text-zinc-400">{status?.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button className="btn-ghost text-xs px-2 py-1" onClick={() => setEditOpen(true)}>
              Edit
            </button>
            <button
              className="btn-danger text-xs px-2 py-1"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Spinner size={3} /> : 'Delete'}
            </button>
          </div>
        </div>

        <h1 className="text-base font-semibold text-zinc-100 mb-3">{task.title}</h1>

        {task.description ? (
          <p className="text-sm text-zinc-400 leading-relaxed mb-5 whitespace-pre-wrap">
            {task.description}
          </p>
        ) : (
          <p className="text-sm text-zinc-700 italic mb-5">No description</p>
        )}

        {/* meta grid */}
        <div className="grid grid-cols-2 gap-4 text-xs border-t border-border pt-4">
          <MetaRow label="Assignee">
            {task.assignedTo ? (
              <div className="flex items-center gap-1.5">
                <Avatar name={task.assignedTo.name} size="xs" />
                <span className="text-zinc-300">{task.assignedTo.name}</span>
              </div>
            ) : (
              <span className="text-muted">Unassigned</span>
            )}
          </MetaRow>

          <MetaRow label="Created by">
            <span className="text-zinc-300">{task.createdBy?.name}</span>
          </MetaRow>

          <MetaRow label="Due date">
            {due ? (
              <span className={overdue ? 'text-red-400' : 'text-zinc-300'}>
                {overdue && '⚠ '}{due}
              </span>
            ) : (
              <span className="text-muted">—</span>
            )}
          </MetaRow>

          <MetaRow label="Est. hours">
            {task.estimatedHours ? (
              <span className="text-zinc-300">{task.estimatedHours}h</span>
            ) : (
              <span className="text-muted">—</span>
            )}
          </MetaRow>

          <MetaRow label="Created">
            <span className="text-zinc-400">{timeAgo(task.createdAt)}</span>
          </MetaRow>

          <MetaRow label="Updated">
            <span className="text-zinc-400">{timeAgo(task.updatedAt)}</span>
          </MetaRow>
        </div>

        {/* tags */}
        {task.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-border">
            {task.tags.map((tag) => (
              <span key={tag} className="badge bg-surface-3 text-zinc-400">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* edit form */}
      <TaskForm
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSubmit={handleEdit}
        defaultValues={{
          ...task,
          assignedTo: task.assignedTo?._id || '',
          dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        }}
        members={[]} // passed from workspace context in a real flow
        loading={editLoading}
      />
    </div>
  );
};

const MetaRow = ({ label, children }) => (
  <div>
    <p className="text-2xs text-muted uppercase tracking-wide mb-1">{label}</p>
    {children}
  </div>
);

export default TaskDetail;
