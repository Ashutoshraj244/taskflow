import Avatar from '../ui/Avatar';
import Spinner from '../ui/Spinner';
import { timeAgo } from '../../utils';

const ACTION_LABELS = {
  created_task: 'created',
  updated_task: 'updated',
  moved_task: 'moved',
  deleted_task: 'deleted',
  created_workspace: 'created workspace',
  joined_workspace: 'joined',
};

const ActivityFeed = ({ activity = [], loading, compact = false }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner />
      </div>
    );
  }

  if (!activity.length) {
    return <p className="text-xs text-muted text-center py-6">No activity yet</p>;
  }

  return (
    <div className="space-y-0">
      {activity.map((entry, i) => (
        <div
          key={entry._id}
          className={`flex gap-2.5 ${compact ? 'py-2' : 'py-3'} ${
            i !== 0 ? 'border-t border-border' : ''
          }`}
        >
          <Avatar name={entry.actor?.name} size="xs" className="mt-0.5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-zinc-300 leading-snug">
              <span className="font-medium">{entry.actor?.name}</span>{' '}
              <span className="text-muted">{ACTION_LABELS[entry.action] || entry.action}</span>{' '}
              {entry.taskRef && (
                <span className="text-zinc-400 font-mono text-2xs">
                  "{entry.taskRef.title}"
                </span>
              )}
            </p>
            {!compact && entry.details && (
              <p className="text-2xs text-muted mt-0.5 truncate">{entry.details}</p>
            )}
            <p className="text-2xs text-zinc-700 mt-0.5">{timeAgo(entry.createdAt)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
