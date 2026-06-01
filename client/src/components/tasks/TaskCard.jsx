import { useNavigate, useParams } from 'react-router-dom';
import Avatar from '../ui/Avatar';
import { priorityMeta, statusMeta, formatDate, isOverdue } from '../../utils';

const TaskCard = ({ task, isDragging }) => {
  const navigate = useNavigate();
  const { workspaceId } = useParams();
  const priority = priorityMeta[task.priority] || priorityMeta.medium;
  const due = task.dueDate ? formatDate(task.dueDate) : null;
  const overdue = isOverdue(task.dueDate) && task.status !== 'completed';

  return (
    <div
      onClick={() => navigate(`/workspace/${workspaceId}/task/${task._id}`)}
      className={`bg-surface-2 border rounded p-3 cursor-pointer group transition-colors ${
        isDragging ? 'border-blue-500 shadow-lg' : 'border-border hover:border-zinc-600'
      }`}
    >
      {/* priority + tags row */}
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        <span className={`badge ${priority.bg}`}>{priority.label}</span>
        {task.tags?.slice(0, 2).map((tag) => (
          <span key={tag} className="badge bg-surface-4 text-zinc-400">
            {tag}
          </span>
        ))}
      </div>

      <p className="text-xs font-medium text-zinc-200 leading-snug line-clamp-2 mb-2">
        {task.title}
      </p>

      {task.description && (
        <p className="text-2xs text-muted leading-relaxed line-clamp-1 mb-2">
          {task.description}
        </p>
      )}

      <div className="flex items-center justify-between gap-2">
        {task.assignedTo ? (
          <Avatar name={task.assignedTo.name} size="xs" />
        ) : (
          <span className="w-5 h-5 rounded-full border border-dashed border-zinc-700 flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
        )}
        {due && (
          <span className={`text-2xs ml-auto ${overdue ? 'text-red-400' : 'text-muted'}`}>
            {overdue && '⚠ '}{due}
          </span>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
